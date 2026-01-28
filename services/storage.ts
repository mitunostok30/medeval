
import { EvaluationRecord, Teacher } from '../types';
import { DEFAULT_TEACHERS } from '../constants';

const EVALS_KEY = 'med_eval_submissions';
const LOG_KEY = 'med_eval_log';
const TEACHERS_KEY = 'med_eval_teachers';

export const storageService = {
  getTeachers: (): Teacher[] => {
    const data = localStorage.getItem(TEACHERS_KEY);
    return data ? JSON.parse(data) : DEFAULT_TEACHERS;
  },

  saveTeacher: (teacher: Teacher) => {
    const existing = storageService.getTeachers();
    localStorage.setItem(TEACHERS_KEY, JSON.stringify([...existing, teacher]));
  },

  getEvaluations: (): EvaluationRecord[] => {
    const data = localStorage.getItem(EVALS_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveEvaluation: (evalRecord: EvaluationRecord) => {
    const existing = storageService.getEvaluations();
    localStorage.setItem(EVALS_KEY, JSON.stringify([...existing, evalRecord]));
  },
  
  getSubmissionLog: (): string[] => {
    const data = localStorage.getItem(LOG_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  addLogEntry: (logEntry: string) => {
    const existing = storageService.getSubmissionLog();
    localStorage.setItem(LOG_KEY, JSON.stringify([...existing, logEntry]));
  },
  
  hasEvaluated: (studentToken: string, teacherId: string): boolean => {
    const logs = storageService.getSubmissionLog();
    return logs.includes(`${studentToken}_${teacherId}`);
  },

  clearData: () => {
    localStorage.removeItem(EVALS_KEY);
    localStorage.removeItem(LOG_KEY);
    localStorage.removeItem(TEACHERS_KEY);
  }
};
