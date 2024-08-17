import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';


@ApiTags('Courses')
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new course' })
  @ApiResponse({ status: 201, description: 'The course has been successfully generated.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  generateCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.generateCourse(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({ status: 200, description: 'List of all courses.' })
  findAll() {
    return this.courseService.findAll();
  }
}
