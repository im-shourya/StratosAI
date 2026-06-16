import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Vendor, VendorSchema } from './schemas/vendor.schema';
import { VendorsController } from './vendors.controller';
import { VendorsService } from './vendors.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Vendor.name, schema: VendorSchema }])],
  controllers: [VendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
