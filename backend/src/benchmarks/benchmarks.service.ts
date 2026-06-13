import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BenchmarksService {
  constructor(private prisma: PrismaService) {}

  async getBenchmarksByIndustry(industry: string) {
    const benchmarks = await this.prisma.benchmark.findMany({
      where: {
        industry: {
          equals: industry,
          mode: 'insensitive' // case insensitive search if using pg
        }
      }
    });

    if (!benchmarks || benchmarks.length === 0) {
      throw new NotFoundException(`No benchmarks found for industry: ${industry}`);
    }

    return benchmarks;
  }
}
