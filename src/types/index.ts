export type UserRole = "student" | "teacher" | "lecturer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructor_id: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
  enrolled: number;
  image: string;
  created_at: string;
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

export interface Task {
  id: string;
  title: string;
  description: string;
  course_id: string;
  due_date: string;
  created_by: string;
  status: "pending" | "submitted" | "graded";
  submission?: string;
  grade?: string;
  feedback?: string;
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
  timestamp: string;
}
