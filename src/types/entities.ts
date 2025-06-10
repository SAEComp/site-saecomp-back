// src/types/entities.ts

export type UserRole = 'admin' | 'user';
export type EvaluationStatus = 'approved' | 'rejected' | 'pending';
export type AnswerType = 'numeric' | 'text';

// ADICIONE ESTA INTERFACE QUE ESTAVA FALTANDO
export interface User {
  id: number;
  google_sub: string;
  name: string | null;
  email: string;
  role: UserRole;
  nusp: string | null;
  created_at: Date;
}

export interface Teacher {
  id: number;
  name: string;
  department?: string;
  institute?: string;
}

export interface Course {
  id: number;
  name: string;
  code: string;
}

export interface Question {
  id: number;
  question: string;
  type: AnswerType;
  active: boolean;
  question_order: number | null;
  is_score: boolean;
}

export interface Evaluation {
  id: number;
  user_id: number | null;
  teacher_id: number;
  course_id: number;
  score: number | null;
  created_at: Date;
  status: EvaluationStatus;
  approved_by: number | null;
}

export interface Answer {
    id: number;
    evaluation_id: number;
    question_id: number;
    question_order: number | null;
    answer: string | null;
    edited_answer: string | null;
    edited_by: number | null;
}