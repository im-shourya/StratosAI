iimport { IsString, IsOptional, IsUUID } from 'class-validator';

export class StartAssessmentDto {
  @IsOptional()
  user_id?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsString()
  company_name?: string;
}
