
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { User, Course } from "@/types";
import { mockCourses } from "@/data/mockData";
import CourseCard from "@/components/courses/CourseCard";
import { BarChart, BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      const userData: User = JSON.parse(storedUser);
      setUser(userData);

      // Filter courses based on user role
      if (userData.role === "student") {
        setCourses(mockCourses.slice(0, 4)); // First 4 courses for students
      } else if (userData.role === "teacher") {
        setCourses(mockCourses.filter((c) => c.instructorId === userData.id));
      } else {
        setCourses(mockCourses);
      }
    }
  }, []);

  const overallProgress = user?.role === "student" ? 65 : null;
  
  const getUpcomingTaskCount = () => {
    return user?.role === "student" ? 3 : 
           user?.role === "teacher" ? 8 : 
           12;
  };

  const getStatistics = () => {
    if (user?.role === "admin") {
      return [
        { title: "Aktive Kurse", value: "18", icon: <BookOpen className="h-4 w-4" />, path: "/courses" },
        { title: "Eingeschriebene Nutzer", value: "245", icon: <GraduationCap className="h-4 w-4" />, path: "/users" },
        { title: "Aufgabeneinreichungen", value: "87", icon: <Calendar className="h-4 w-4" />, path: "/assignments" },
        { title: "Avg. Engagement", value: "73%", icon: <BarChart className="h-4 w-4" />, path: "/analytics" },
      ];
    }
    
    if (user?.role === "teacher") {
      return [
        { title: "Aktive Kurse", value: "4", icon: <BookOpen className="h-4 w-4" />, path: "/courses/teaching" },
        { title: "Studierende", value: "86", icon: <GraduationCap className="h-4 w-4" />, path: "/students" },
        { title: "Offene Bewertungen", value: "12", icon: <Calendar className="h-4 w-4" />, path: "/assignments" },
        { title: "Avg. Bestehensrate", value: "84%", icon: <BarChart className="h-4 w-4" />, path: "/analytics" },
      ];
    }
    
    return [
      { title: "Belegte Kurse", value: "4", icon: <BookOpen className="h-4 w-4" />, path: "/courses" },
      { title: "Abgeschlossene Module", value: "8", icon: <GraduationCap className="h-4 w-4" />, path: "/modules" },
      { title: "Nächste Deadline", value: "2 Tage", icon: <Clock className="h-4 w-4" />, path: "/deadlines" },
      { title: "Gesamtfortschritt", value: "65%", icon: <BarChart className="h-4 w-4" />, path: "/progress" },
    ];
  };

  const renderWelcomeMessage = () => {
    if (!user) return null;
    
    const roleText = user.role === "admin" ? "Administrator" : 
                     user.role === "teacher" ? "Lehrkraft" : "Student/in";
    
    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Willkommen, {user.name}!</h1>
        <p className="text-muted-foreground">
          Hier ist dein Dashboard als {roleText}. {user.role === "student" && "Dein aktueller Gesamtfortschritt beträgt:"}
        </p>
        
        {overallProgress !== null && (
          <div className="mt-4 space-y-2">
            <Progress value={overallProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>{overallProgress}% abgeschlossen</span>
              <span>100%</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderWelcomeMessage()}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {getStatistics().map((stat, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-md transition-all" 
            onClick={() => stat.path && navigate(stat.path)}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {stat.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{user?.role === "student" ? "Meine Kurse" : "Aktuelle Kurse"}</CardTitle>
            <CardDescription>
              {user?.role === "student" 
                ? "Kurse, bei denen du eingeschrieben bist" 
                : user?.role === "teacher"
                  ? "Kurse, die du unterrichtest" 
                  : "Zuletzt aktualisierte Kurse"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.slice(0, 3).map((course) => (
                <Link to={`/courses/${course.id}`} key={course.id} className="block">
                  <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
                    <div className={`h-10 w-10 rounded-md bg-${course.bannerColor}-500 flex items-center justify-center text-white`}>
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">{course.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {user?.role === "student" 
                          ? `${course.progress}% abgeschlossen` 
                          : `${course.enrolledStudents} Teilnehmer`}
                      </p>
                    </div>
                    {user?.role === "student" && (
                      <Progress value={course.progress} className="w-20 h-2" />
                    )}
                  </div>
                </Link>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/courses">Alle Kurse anzeigen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Nächste Aufgaben</CardTitle>
            <CardDescription>
              {user?.role === "student" 
                ? "Deine anstehenden Aufgaben" 
                : user?.role === "teacher" 
                  ? "Zu bewertende Einreichungen" 
                  : "Systemaufgaben"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Link to="/deadlines" className="block">
                <div className="rounded-lg border bg-card p-3 hover:bg-muted">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {user?.role === "student" 
                        ? "Quiz: Machine Learning Grundlagen" 
                        : user?.role === "teacher" 
                          ? "Bewertung: Python Hausaufgaben" 
                          : "System Update: Bewertungsrubrik"}
                    </p>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      In 2 Tagen
                    </span>
                  </div>
                </div>
              </Link>
              
              <Link to="/deadlines" className="block">
                <div className="rounded-lg border bg-card p-3 hover:bg-muted">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {user?.role === "student" 
                        ? "Abgabe: Datenbankdesign" 
                        : user?.role === "teacher" 
                          ? "Kursplanung: Nächstes Semester" 
                          : "Review: Neue Lehrkräfte"}
                    </p>
                    <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded-full">
                      In 5 Tagen
                    </span>
                  </div>
                </div>
              </Link>
              
              <Link to="/deadlines" className="block">
                <div className="rounded-lg border bg-card p-3 hover:bg-muted">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {user?.role === "student" 
                        ? "Gruppenarbeit: Präsentation" 
                        : user?.role === "teacher" 
                          ? "Feedback: Semesterprojekte" 
                          : "Report: Semesterfortschritt"}
                    </p>
                    <span className="text-xs bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full">
                      In 1 Woche
                    </span>
                  </div>
                </div>
              </Link>
              
              <Button variant="outline" className="w-full" asChild>
                <Link to="/tasks">Alle Aufgaben anzeigen</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {user?.role !== "teacher" && (
        <Card>
          <CardHeader>
            <CardTitle>
              {user?.role === "student" ? "Empfohlene Kurse" : "Neueste Kurse"}
            </CardTitle>
            <CardDescription>
              {user?.role === "student" 
                ? "Diese Kurse könnten dich interessieren" 
                : "Kürzlich zur Plattform hinzugefügt"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {mockCourses.slice(4, 8).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
