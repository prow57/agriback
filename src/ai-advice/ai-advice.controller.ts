import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AiAdviceService } from './ai-advice.service';
import { GetAdviceDto } from './dto/get-advice.dto';


@ApiTags('AI Advice')
@Controller('ai-advice')
export class AiAdviceController {
  constructor(private readonly aiAdviceService: AiAdviceService) {}

  @Post()
  @ApiOperation({ summary: 'Get AI-generated advice based on input data' })
  @ApiResponse({ status: 201, description: 'Successfully generated advice.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({ type: GetAdviceDto, description: 'Data needed to generate advice' })
  getAdvice(@Body() getAdviceDto: GetAdviceDto) {
    return this.aiAdviceService.getAdvice(getAdviceDto);
  }
}
