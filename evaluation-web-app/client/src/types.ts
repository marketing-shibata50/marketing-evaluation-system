export interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  created_at: string;
}

export interface EvaluationPattern {
  id: number;
  pattern_number: number;
  pattern_name: string;
  pattern_description: string;
  pattern_config: any;
  created_at: string;
  updated_at: string;
}

export interface EvaluationData {
  [key: string]: any;
  period_start: string;
  period_end: string;
  total_score?: number;
  grade?: string;
}

export interface Evaluation {
  id: number;
  employee_id: number;
  pattern_type: number;
  evaluation_data: EvaluationData;
  period_start: string;
  period_end: string;
  evaluation_date: string;
}