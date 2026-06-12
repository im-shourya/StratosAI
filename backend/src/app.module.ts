import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AssessmentsModule } from './assessments/assessments.module';
import 'dotenv/config';

@Module({
  imports: [
    AuthModule,
    AssessmentsModule,
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/stratosai'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
