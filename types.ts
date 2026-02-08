
export enum TaskType {
  HOMEWORK = 'HOMEWORK',
  EXAM = 'EXAM',
  ORAL_TEST = 'ORAL_TEST',
  PROJECT = 'PROJECT',
  STUDY_HOUR = 'STUDY_HOUR'
}

export enum Difficulty {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
  CHALLENGING = 4,
  EXPERT = 5
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  type: TaskType;
  difficulty: Difficulty;
  description: string;
  isCompleted: boolean;
  source: 'google' | 'classeviva' | 'manual';
}

export interface StudySession {
  id: string;
  taskId: string;
  date: string;
  startTime: string;
  duration: number;
  topic: string;
}

export interface Reminder {
  id: string;
  taskId: string;
  date: string;
  message: string;
}

export interface UserProfile {
  name: string;
  email: string;
  isGoogleConnected: boolean;
  isClasseVivaConnected: boolean;
}
