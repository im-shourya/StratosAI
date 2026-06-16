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

  async getUseCases() {
    const benchmarks = await this.prisma.benchmark.findMany();
    
    return benchmarks.map((b, idx) => ({
      id: b.id,
      title: b.use_case,
      category: b.industry,
      impact: 'High', // Mock derived
      cost: 'Medium', // Mock derived
      desc: b.company_size // Seed script hack stored desc in company_size
    }));
  }
}
