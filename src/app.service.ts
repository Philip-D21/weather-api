import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import * as os from 'os';

@Injectable()
export class AppService {
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENWEATHERMAP_API_KEY');
  }

  getLocalIpAddress(): string {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  async getLocation(ip: string): Promise<{ city: string }> {
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      console.log('Local or private IP detected, defaulting to New York');
      return { city: 'New York' };
    }

    try {
      const response = await this.httpService.get(`https://ipinfo.io/${ip}/json`).toPromise();
      const city = response.data.city;
      if (!city) {
        throw new Error('City not found');
      }
      console.log(`Location fetched for IP ${ip}: ${city}`);
      return { city };
    } catch (error) {
      console.error(`Error fetching location or city not found: ${error.message}`);
      throw new HttpException('Could not determine location', 400);
    }
  }

  getWeather(city: string): Observable<any> {
    if (!city) {
      throw new HttpException('City parameter is missing', 400);
    }
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${this.apiKey}`;
    console.log(`Calling URL: ${url}`);
    return this.httpService.get(url).pipe(
      map((response: AxiosResponse) => response.data),
      catchError(error => {
        console.error(`Error fetching weather data: ${error.message}`);
        throw new HttpException('Error fetching weather data', 400);
      })
    );
  }

  createGreeting(clientIp: string, city: string, temperature: number, visitorName: string): any {
    return {
      client_ip: clientIp,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
    };
  }
}
