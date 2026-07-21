/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: number;
  category: 'Grammar' | 'Vocabulary' | 'Comprehension';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  text: string;
  options: string[];
  correctAnswer: number; // Index inside the options array
  explanation: string;
}

export type EnglishLevelKey = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface LevelDetails {
  key: EnglishLevelKey;
  name: string;
  description: string;
  milestones: string[];
  recommendedProgram: {
    name: string;
    tagline: string;
    duration: string;
    schedule: string;
    focusAreas: string[];
  };
}

export interface ConsultationForm {
  email: string;
  phone: string;
  district: string;
  preferredContact: 'whatsapp' | 'email' | 'phone';
  termsAccepted: boolean;
}
