
export type UserRole = 'admin' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  bannerColor: string;
  modules: Module[];
  enrolledStudents: number;
  progress?: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  completed?: boolean;
}

export interface Task {
  id: string;
  title: string;
  type: 'reading' | 'video' | 'quiz' | 'assignment';
  completed?: boolean;
  description?: string;
  dueDate?: string;
  questions?: QuizQuestion[];
  content?: string;
  videoUrl?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export interface CompletedModule {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  completedDate: string;
  grade?: number;
}

export interface UserSetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'toggle' | 'select' | 'input';
  options?: string[];
  value?: string;
  category: 'appearance' | 'notifications' | 'privacy' | 'account';
}
