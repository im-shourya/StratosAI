import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsModule } from './reports/reports.module';
import { BenchmarksModule } from './benchmarks/benchmarks.module';
import { VendorsModule } from './vendors/vendors.module';
import 'dotenv/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AssessmentsModule,
    PrismaModule,
    ReportsModule,
    BenchmarksModule,
    VendorsModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/stratosai'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
