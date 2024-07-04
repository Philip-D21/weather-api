import { Controller, Get, Query, Req, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('hello')
  async greet(@Req() request: Request, @Query('visitor_name') visitor_name: string) {
    if (!visitor_name) {
      throw new HttpException('Visitor name parameter is missing', 400);
    }

    // Extract IPv4 address from IPv6 mapped format if necessary
    let clientIp = request.ip;
    if (clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.substr(7); // Remove '::ffff:' prefix to get IPv4 address
    }

    console.log(`Client IP: ${clientIp}`);
    const location = await this.appService.getLocation(clientIp);
    const weatherData = await this.appService.getWeather(location.city).toPromise();

    return this.appService.createGreeting(clientIp, location.city, weatherData.main.temp, visitor_name);
  }

  @Get('health')
  healthCheck() {
    return {
      status: 'ok',
      message: 'Service is running',
    };
  }
}
