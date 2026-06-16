import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';

export class StartAssessmentDto {
  @IsOptional()
  user_id?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  department?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  project_name?: string;
}
