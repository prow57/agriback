import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
  constructor(private readonly httpService: HttpService) {}

    async chat(message: string) {
        const prompt = `You are an agriculture expert. Answer the following question related to agriculture: ${message}`;

            const apiKey = process.env.GROQ_LLAMAI_API_KEY;
                const apiUrl = process.env.GROQ_LLAMAI_API_URL;

                    const response = await lastValueFrom(
                          this.httpService.post(apiUrl, {
                                  prompt,
                                          max_tokens: 500,
                                                  temperature: 0.7,
                                                        }, {
                                                                headers: {
                                                                          'Authorization': `Bearer ${apiKey}`,
                                                                                    'Content-Type': 'application/json',
                                                                                            },
                                                                                                  })
                                                                                                      );

                                                                                                          const courseContent = (response as any).data; // Cast to any or define a type
                                                                                                              return courseContent;
                                                                                                                }
                                                                                                                }
                                                                                                                