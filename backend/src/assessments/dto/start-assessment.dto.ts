import { IsString, IsOptional, IsUUID } from 'class-validator';

export class StartAssessmentDto {
  @IsOptional()
  user_id?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  project_name?: string;
}
