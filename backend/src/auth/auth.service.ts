import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthDto } from './dto/oauth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async signup(data: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password_hash: hashedPassword,
        company_name: data.company_name || 'N/A',
      }
    });

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        company_name: user.company_name
      }
    };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(data.password, user.password_hash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        company_name: user.company_name
      }
    };
  }

  async oauthLogin(data: OAuthDto) {
    let user = await this.prisma.user.findUnique({ where: { email: data.email } });
    
    if (!user) {
      // Create user if they don't exist
      const hashedPassword = await bcrypt.hash(data.uid, 10);
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          password_hash: hashedPassword,
          company_name: 'N/A',
        }
      });
    }

    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        company_name: user.company_name
      }
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      job_title: user.job_title,
      company_name: user.company_name,
      industry: user.industry,
      primary_goal: user.primary_goal,
      company_size: user.company_size,
      country: user.country,
      main_market_country: user.main_market_country,
      plan_tier: user.plan_tier
    };
  }

  async updateProfile(userId: string, data: { 
    first_name?: string; 
    last_name?: string; 
    email?: string; 
    job_title?: string;
    company_name?: string; 
    industry?: string;
    primary_goal?: string;
    company_size?: string;
    country?: string; 
    main_market_country?: string 
  }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        job_title: data.job_title,
        company_name: data.company_name,
        industry: data.industry,
        primary_goal: data.primary_goal,
        company_size: data.company_size,
        country: data.country,
        main_market_country: data.main_market_country
      }
    });

    return {
      id: updated.id,
      email: updated.email,
      first_name: updated.first_name,
      last_name: updated.last_name,
      job_title: updated.job_title,
      company_name: updated.company_name,
      industry: updated.industry,
      primary_goal: updated.primary_goal,
      company_size: updated.company_size,
      country: updated.country,
      main_market_country: updated.main_market_country,
      plan_tier: updated.plan_tier
    };
  }
}
