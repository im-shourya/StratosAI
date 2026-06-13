import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
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
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
        },
      }),
    }),
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
