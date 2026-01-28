
export enum Phase {
  P1 = "1st Phase",
  P2 = "2nd Phase",
  P3 = "3rd Phase",
  P4 = "4th Phase"
}

export interface Teacher {
  id: string;
  name: string;
  designation: string;
  subject: string;
}

export interface EvaluationRecord {
  id: string;
  timestamp: number;
  phase: Phase;
  teacherId: string;
  ratings: Record<string, number>; // 1-5
  isRoleModel: boolean;
  learningEnv: Record<string, number>;
  clinicalSkills?: Record<string, number>;
  hostel?: Record<string, number>;
  resideInHostel: boolean;
  qualitativeProblems: string;
}

export interface SubmissionLog {
  // studentId_teacherId format to prevent duplicates while remaining anonymous
  // In a real app, studentId would be a hash of their session/token
  logs: string[]; 
}
