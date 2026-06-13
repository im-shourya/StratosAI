import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MlIntegrationService {
  private readonly logger = new Logger(MlIntegrationService.name);
  private readonly mlApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.mlApiUrl = this.configService.get<string>('ML_API_URL') || 'http://localhost:5001';
  }

  async predictFull(features: any): Promise<any> {
    try {
      this.logger.log(`Calling Flask ML API at ${this.mlApiUrl}/ml/predict/full`);
      const response = await lastValueFrom(
        this.httpService.post(`${this.mlApiUrl}/ml/predict/full`, features)
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`Failed to call ML API: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error communicating with ML prediction service');
    }
  }

  async checkHealth(): Promise<any> {
    try {
      const response = await lastValueFrom(this.httpService.get(`${this.mlApiUrl}/ml/health`));
      return response.data;
    } catch (error: any) {
      this.logger.error(`ML API Health Check Failed: ${error.message}`);
      return { status: 'down', error: error.message };
    }
  }
}
