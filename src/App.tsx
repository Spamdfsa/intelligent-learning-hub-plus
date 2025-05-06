
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CoursesPage from "./pages/Courses";
import CourseDetail from "./pages/Courses/CourseDetail";
import AiTutor from "./pages/AiTutor";
import TasksPage from "./pages/Tasks";
import SummariesPage from "./pages/Summaries";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/courses/:courseId" element={<CourseDetail />} />
            <Route path="/ai-tutor" element={<AiTutor />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/summaries" element={<SummariesPage />} />
            <Route path="/assignments" element={<Dashboard />} />
            <Route path="/students" element={<Dashboard />} />
            <Route path="/users" element={<Dashboard />} />
            <Route path="/analytics" element={<Dashboard />} />
            <Route path="/profile" element={<Dashboard />} />
            <Route path="/settings" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
