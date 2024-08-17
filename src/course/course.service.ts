import { Injectable} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CourseService {
  constructor(
      @InjectRepository(Course)
          private readonly courseRepository: Repository<Course>,
              private readonly httpService: HttpService
                ) {}

                  async generateCourse(createCourseDto: CreateCourseDto): Promise<Course> {
                      const { category, title, description } = createCourseDto;

                          const prompt = `Generate a detailed course on the topic "${title}" in the category "${category}". 
                                             Include objectives, introduction, content with examples, tools needed for practical lessons, and a conclusion.`;

                                                 const apiKey = process.env.GROQ_LLAMAI_API_KEY;
                                                     const apiUrl = process.env.GROQ_LLAMAI_API_URL;

                                                         const response = await lastValueFrom(
                                                               this.httpService.post(apiUrl, {
                                                                       prompt,
                                                                               max_tokens: 1000,
                                                                                       temperature: 0.7,
                                                                                             }, {
                                                                                                     headers: {
                                                                                                               'Authorization': `Bearer ${apiKey}`,
                                                                                                                         'Content-Type': 'application/json',
                                                                                                                                 },
                                                                                                                                       })
                                                                                                                                           );

                                                                                                                                               const courseContent = response.data;

                                                                                                                                                   const newCourse = this.courseRepository.create({
                                                                                                                                                         category,
                                                                                                                                                               title,
                                                                                                                                                                     description,
                                                                                                                                                                           content: courseContent,
                                                                                                                                                                               });

                                                                                                                                                                                   return this.courseRepository.save(newCourse);
                                                                                                                                                                                     }

                                                                                                                                                                                       async findAll(): Promise<Course[]> {
                                                                                                                                                                                           return this.courseRepository.find();
                                                                                                                                                                                             }
                                                                                                                                                                                             }
