
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CoursesPage from "./pages/Courses";
import CourseDetail from "./pages/Courses/CourseDetail";
import CreateCourse from "./pages/Courses/CreateCourse";
import MaterialCreate from "./pages/Materials/CreateMaterial";
import AiTutor from "./pages/AiTutor";
import TasksPage from "./pages/Tasks";
import StudentChatsPage from "./pages/StudentChats";
import AssignmentsPage from "./pages/Assignments";
import SummariesPage from "./pages/Summaries";
import ModulesPage from "./pages/Modules";
import SettingsPage from "./pages/Settings";
import ProfilePage from "./pages/Profile";
import DeadlinesPage from "./pages/Deadlines";
import ProgressPage from "./pages/Progress";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/teaching" element={<CoursesPage />} />
              <Route path="/courses/manage" element={<CoursesPage />} />
              <Route path="/courses/create" element={<CreateCourse />} />
              <Route path="/courses/:courseId" element={<CourseDetail />} />
              <Route path="/materials/create" element={<MaterialCreate />} />
              <Route path="/ai-tutor" element={<AiTutor />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/student-chats" element={<StudentChatsPage />} />
              <Route path="/assignments" element={<AssignmentsPage />} />
              <Route path="/modules" element={<ModulesPage />} />
              <Route path="/summaries" element={<SummariesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/deadlines" element={<DeadlinesPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/students" element={<Dashboard />} />
              <Route path="/users" element={<Dashboard />} />
              <Route path="/analytics" element={<Dashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
