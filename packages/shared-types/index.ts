// Shared interfaces between Frontend and Backend

export interface UserDto {
  id: string;
  email: string;
  company_name?: string;
}

export interface StartAssessmentDto {
  user_id: string;
  industry?: string;
  company_name?: string;
}

export interface AssessmentResponse {
  assessment_id: string;
  status: string;
  message: any;
}
