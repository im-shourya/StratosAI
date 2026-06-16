import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vendor } from './schemas/vendor.schema';

@Injectable()
export class VendorsService {
  constructor(@InjectModel(Vendor.name) private vendorModel: Model<Vendor>) {}

  async findAll(): Promise<Vendor[]> {
    return this.vendorModel.find().exec();
  }

  async search(query: string): Promise<Vendor[]> {
    if (!query) return [];
    return this.vendorModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } }
      ]
    }).limit(5).exec();
  }
}
