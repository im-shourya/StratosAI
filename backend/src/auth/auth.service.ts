import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService
  ) {}

  async signup(data: any) {
    const existing = await this.userModel.findOne({ email: data.email });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await this.userModel.create({
      email: data.email,
      password: hashedPassword,
      company_name: data.company_name,
      industry: data.industry,
      valuation: data.valuation,
      country: data.country,
    });

    const payload = { sub: user._id.toString(), email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        company_name: user.company_name
      }
    };
  }

  async login(data: any) {
    const user = await this.userModel.findOne({ email: data.email });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user._id.toString(), email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        email: user.email,
        company_name: user.company_name
      }
    };
  }
}
