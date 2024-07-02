import { Controller, Get, Query, Req, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api/hello')
  async getGreeting(@Query('visitor_name') visitorName: string, @Req() req: Request): Promise<any> {
    const clientIp = this.appService.getLocalIpAddress();
    console.log(`Client IP: ${clientIp}`);

    try {
      const location = await this.appService.getLocation(clientIp);
      console.log(`City from location service: ${location.city}`);

      const weatherData$ = this.appService.getWeather(location.city);

      const weatherData = await weatherData$.toPromise();
      const temperature = weatherData.main.temp;

      return this.appService.createGreeting(clientIp, location.city, temperature, visitorName);
    } catch (error) {
      console.error(`Error in getGreeting: ${error.message}`);
      throw new HttpException('Error fetching location or weather data', 500);
    }
  }
}
