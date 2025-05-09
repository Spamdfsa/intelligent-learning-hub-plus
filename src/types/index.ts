
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
  instructor_id: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  progress: number;
  enrolled: number;
  image: string;
  created_at: string;
  // Added properties to match usage in components
  instructorId?: string;  // Alternative to instructor_id for backward compatibility
  duration?: string;
  enrolledStudents?: number;
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

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
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
  // Added properties to match usage in components
  type?: "reading" | "video" | "quiz" | "assignment";
  completed?: boolean;
  content?: string;
  videoUrl?: string;
  questions?: Question[];
  dueDate?: string;  // Alternative to due_date for backward compatibility
  courseId?: string;  // Alternative to course_id for backward compatibility
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
