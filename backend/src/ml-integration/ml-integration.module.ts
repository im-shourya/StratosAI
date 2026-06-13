import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MlIntegrationService } from './ml-integration.service';

@Module({
  imports: [HttpModule],
  providers: [MlIntegrationService],
  exports: [MlIntegrationService]
})
export class MlIntegrationModule {}
