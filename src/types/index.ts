
export type UserRole = "student" | "teacher" | "lecturer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  courses?: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructor_id?: string;
  instructorId?: string;  // Alternative to instructor_id
  level: "Beginner" | "Intermediate" | "Advanced";
  progress?: number;
  enrolled?: number;
  enrolledStudents?: number;  // Alternative to enrolled
  image?: string;
  created_at?: string;
  // Additional optional properties used in components
  duration?: string;
  category?: string;
  bannerColor?: string;
  modules?: Module[];
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "document" | "video" | "link";
  url: string;
  created_by: string;
  course_id: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options?: string[];
  correctOption?: number;
  answerType: "multiple-choice" | "text" | "true-false";
  correctAnswer?: string;
  userAnswer?: number | string;
  explanation?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  
  // Make required fields optional when the alternative field is used
  course_id?: string;
  courseId?: string;  // Alternative to course_id
  
  due_date?: string;
  dueDate?: string;  // Alternative to due_date
  
  created_by?: string;
  status?: "pending" | "submitted" | "graded";
  
  // Optional fields
  submission?: string;
  grade?: string;
  feedback?: string;
  
  // Fields used in components
  type?: "reading" | "video" | "quiz" | "assignment";
  completed?: boolean;
  content?: string;
  videoUrl?: string;
  questions?: QuizQuestion[];
  moduleId?: string;
}

export interface StudentChat {
  id: string;
  student_id: string;
  student_name: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sender: "student" | "ai";
  content: string;
  timestamp: string | Date;
  role?: "user" | "assistant"; // Added role for compatibility with OpenAI API format
}

// Add missing interfaces for other components
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
  type: "toggle" | "select" | "input";
  options?: string[];
  value?: string;
  category: "appearance" | "notifications" | "privacy" | "account";
}

