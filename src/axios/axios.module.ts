import { Module, Global } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AxiosInstance } from 'axios';

export const AXIOS_INSTANCE_TOKEN = 'AXIOS_INSTANCE_TOKEN';

@Global()
@Module({
  imports: [HttpModule],
    providers: [
        {
              provide: AXIOS_INSTANCE_TOKEN,
                    useFactory: (httpService: HttpService): AxiosInstance => {
                            const axiosInstance = httpService.axiosRef;
                                    // Customize the axios instance if necessary
                                            return axiosInstance;
                                                  },
                                                        inject: [HttpService],
                                                            },
                                                              ],
                                                                exports: [AXIOS_INSTANCE_TOKEN],
                                                                })
                                                                export class AxiosModule {}
                                                                