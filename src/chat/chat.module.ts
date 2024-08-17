import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule],
  controllers: [ChatController],
  providers: [ChatService, HttpService],
  exports: [ChatService, HttpService],
})
export class ChatModule {}
