import { Controller, Get, HttpException, Ip, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('api/hello')
  async greet(@Ip() clientIp: string, @Query('visitor_name') visitor_name: string) {
    if (!visitor_name) {
      throw new HttpException('Name parameter is missing', 400);
    }

    const ip = clientIp || this.appService.getLocalIpAddress();
    const location = await this.appService.getLocation(ip);
    const weatherData = await this.appService.getWeather(location.city).toPromise();

    return this.appService.createGreeting(ip, location.city, weatherData.main.temp, visitor_name);
  }
}
