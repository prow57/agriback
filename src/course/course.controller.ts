import { Controller, Post, Get, Body } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

    @Post()
      generateCourse(@Body() createCourseDto: CreateCourseDto) {
          return this.courseService.generateCourse(createCourseDto);
            }

              @Get()
                findAll() {
                    return this.courseService.findAll();
                      }
                      }
