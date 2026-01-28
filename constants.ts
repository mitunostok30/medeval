
import { Phase, Teacher } from './types';

export const DEFAULT_TEACHERS: Teacher[] = [
  { id: "T1", name: "Dr. Sarah Ahmed", designation: "Professor", subject: "Anatomy" },
  { id: "T2", name: "Dr. Robert Wilson", designation: "Associate Professor", subject: "Physiology" },
  { id: "T3", name: "Dr. Maria Garcia", designation: "Assistant Professor", subject: "Biochemistry" },
  { id: "T4", name: "Dr. James Miller", designation: "Professor", subject: "Surgery" },
  { id: "T5", name: "Dr. Lisa Thompson", designation: "Associate Professor", subject: "Medicine" },
  { id: "T6", name: "Dr. Kevin Lee", designation: "Assistant Professor", subject: "Pharmacology" },
];

export const TEACHER_EVAL_ITEMS = [
  "Capturing attention", "Objectives", "Prior knowledge", "Time management", 
  "Clarity", "Aids/Materials", "Participation", "Summary", 
  "References", "Assessment", "Environment", "Respect", 
  "Enthusiasm", "Confidence", "Relevance"
];

export const LEARNING_ENV_ITEMS = [
  "Syllabus coverage", "Importance of student opinions", "Teaching materials availability", 
  "Classes held to routine", "Knowledge development", "Practical skills development",
  "Overall satisfaction with assessment"
];

export const CLINICAL_ITEMS = [
  "Bedside teaching quality", "RFST (Residential Field Site Training)", 
  "Clinical competency of teachers", "Communication skills training"
];

export const HOSTEL_ITEMS = [
  "Overall environment of hostel", "Arrangement for meals", 
  "Environment for individual study", "Provision for indoor games"
];

export const RATING_LABELS: Record<number, string> = {
  1: "Never / Very Dissatisfied",
  2: "Rarely / Dissatisfied",
  3: "Sometimes / Neutral",
  4: "Mostly / Satisfied",
  5: "Always / Very Satisfied"
};
