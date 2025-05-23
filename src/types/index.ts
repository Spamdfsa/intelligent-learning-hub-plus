
// User related types
export type UserRole = "student" | "teacher" | "lecturer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  courses?: string[];
  createdAt: string;
  avatar?: string;
  bio?: string;
  department?: string;
  university?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  notifications: boolean;
  darkMode: boolean;
  language: string;
  id?: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  type?: "toggle" | "select" | "input";
  options?: string[];
  value?: string;
  category?: string;
}

// Course related types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructorId?: string;
  instructor_name?: string;
  instructor?: string; // Added
  created_at: string;
  image_url?: string;
  modules?: Module[];
  status?: "active" | "archived" | "draft";
  semester?: string;
  category?: string;
  tags?: string[];
  students?: string[];
  student_count?: number;
  rating?: number;
  // Additional properties used in components
  level?: string;
  duration?: string;
  progress?: number;
  enrolledStudents?: number;
  enrolled?: number;
  bannerColor?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  course_id: string;
  order: number;
  materials?: Material[];
  tasks?: Task[]; // Added for modules
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
  module_id?: string;
  order?: number;
}

// Task and Quiz related types
export interface Task {
  id: string;
  title: string;
  description: string;
  course?: string; // Make optional to match mock data
  course_id?: string; // Added
  courseId?: string; // Added
  dueDate?: string; // Make optional to match mock data
  due_date?: string; // Added for compatibility
  status?: "pending" | "submitted" | "graded"; // Make optional to match mock data
  type: "quiz" | "assignment" | "summary" | "reading" | "video"; // Added reading and video
  createdAt?: Date; // Make optional to match mock data
  submittedAt?: Date;
  generatedBy?: string;
  answer?: string;
  feedback?: string;
  grade?: string;
  questions?: QuizQuestion[];
  // Additional properties
  completed?: boolean;
  content?: string;
  videoUrl?: string;
  submission?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answerType: "multiple-choice" | "text" | "true-false";
  options?: string[];
  correctOption?: number;
  correctAnswer?: string;
  userAnswer?: string | number;
}

// Chat related types
export interface ChatMessage {
  id: string;
  content: string;
  role: "user" | "assistant" | "system";
  sender: string;
  timestamp: string;
}

// Student Chat related types
export interface StudentChat {
  id: string;
  student_id: string;
  student_name: string;
  messages: ChatMessage[];
}

// Summary related types
export interface Summary {
  id: string;
  title: string;
  content: string;
  course: string;
  createdAt: Date;
  module?: string;
}

// Assignment related types
export interface Assignment {
  id: string;
  title: string;
  description: string;
  course_id: string;
  due_date: string;
  created_by: string;
  max_points: number;
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
}

// Student data types
export interface StudentProgress {
  user_id: string;
  course_id: string;
  modules_completed: number;
  total_modules: number;
  last_activity: string;
  time_spent: number;
  assignments_completed: number;
  total_assignments: number;
  average_grade: number;
}

export interface Deadline {
  id: string;
  title: string;
  description: string;
  due_date: string;
  course_id: string;
  type: "assignment" | "quiz" | "exam";
  status: "upcoming" | "overdue" | "completed";
}

// CompletedModule type for the Modules page
export interface CompletedModule {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  completedDate: string;
  grade?: number;
}
