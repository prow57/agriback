import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GetAdviceDto } from './dto/get-advice.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AiAdviceService {
  constructor(private readonly httpService: HttpService) {}

    async getAdvice(getAdviceDto: GetAdviceDto) {
        const { cropOrAnimalType, farmingMethods, issuesOrChallenges } = getAdviceDto;

            const prompt = `Provide advice for ${cropOrAnimalType} farming. Current methods: ${farmingMethods}. Issues/Challenges: ${issuesOrChallenges}.`;

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

                                                                                                              return response.data;
                                                                                                                }
                                                                                                                }
