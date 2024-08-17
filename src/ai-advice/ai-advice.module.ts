import { Module } from '@nestjs/common';
import { AiAdviceController } from './ai-advice.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAdviceService } from './ai-advice.service';
import { HttpService } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule],
  controllers: [AiAdviceController],
  providers: [AiAdviceService, HttpService],
  exports: [AiAdviceService, HttpService],
})
export class AiAdviceModule {}
