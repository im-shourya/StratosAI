import { Module } from '@nestjs/common';
import { BenchmarksController } from './benchmarks.controller';
import { BenchmarksService } from './benchmarks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BenchmarksController],
  providers: [BenchmarksService],
})
export class BenchmarksModule {}
