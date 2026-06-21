import { IsEmail, IsString } from 'class-validator';

export class OAuthDto {
  @IsEmail()
  email!: string;

  @IsString()
  uid!: string;
}
