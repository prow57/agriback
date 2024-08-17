import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ChatService } from './chat.service';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Send a message to the chat service' })
  @ApiResponse({ status: 201, description: 'Message successfully processed by the chat service.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiBody({ schema: { type: 'string', example: 'Hello, how are you?' } })
  chat(@Body('message') message: string) {
    return this.chatService.chat(message);
  }
}
