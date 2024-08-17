import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CourseModule } from './course/course.module';
import { ChatModule } from './chat/chat.module';
import { AiAdviceModule } from './ai-advice/ai-advice.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course/course.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
            type: 'postgres',
                  url: process.env.DATABASE_URL,
                        entities: [Course],
                              synchronize: true,
    }),
    CourseModule,
    ChatModule,
    AiAdviceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}