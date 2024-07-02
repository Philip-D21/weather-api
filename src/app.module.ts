import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports:[
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true, 
    }),


  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
