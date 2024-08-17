import { Controller, Post, Body } from '@nestjs/common';
import { AiAdviceService } from './ai-advice.service';
import { GetAdviceDto } from './dto/get-advice.dto';

@Controller('ai-advice')
export class AiAdviceController {
  constructor(private readonly aiAdviceService: AiAdviceService) {}

    @Post()
      getAdvice(@Body() getAdviceDto: GetAdviceDto) {
          return this.aiAdviceService.getAdvice(getAdviceDto);
            }
            }
            