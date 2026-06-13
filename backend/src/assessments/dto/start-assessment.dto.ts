import { IsString, IsOptional, IsUUID } from 'class-validator';

export class StartAssessmentDto {
  @IsUUID()
  user_id!: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  company_name?: string;
}
