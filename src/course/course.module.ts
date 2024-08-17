import { HttpStatus, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { Course } from './course.entity';
import { HttpService } from '@nestjs/axios';
import { AxiosModule } from 'src/axios/axios.module';

@Module({
  imports: [TypeOrmModule.forFeature([Course]), AxiosModule],
  controllers: [CourseController],
  exports: [CourseService, HttpService],
  providers: [CourseService, HttpService]
})
export class CourseModule {}
