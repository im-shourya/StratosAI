import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BenchmarksService } from './benchmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('benchmarks')
@UseGuards(JwtAuthGuard)
export class BenchmarksController {
  constructor(private readonly benchmarksService: BenchmarksService) {}

  @Get('use-cases')
  async getUseCases() {
    return this.benchmarksService.getUseCases();
  }

  @Get(':industry')
  async getBenchmarks(@Param('industry') industry: string) {
    return this.benchmarksService.getBenchmarksByIndustry(industry);
  }
}
