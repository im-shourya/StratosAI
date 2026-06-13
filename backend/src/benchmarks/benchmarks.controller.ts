import { Controller, Get, Param } from '@nestjs/common';
import { BenchmarksService } from './benchmarks.service';

@Controller('benchmarks')
export class BenchmarksController {
  constructor(private readonly benchmarksService: BenchmarksService) {}

  @Get(':industry')
  async getBenchmarks(@Param('industry') industry: string) {
    return this.benchmarksService.getBenchmarksByIndustry(industry);
  }
}
