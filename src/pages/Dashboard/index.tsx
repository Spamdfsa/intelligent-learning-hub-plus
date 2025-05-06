
import { useEffect, useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { User, Course } from "@/types";
import { mockCourses } from "@/data/mockData";
import CourseCard from "@/components/courses/CourseCard";
import { BarChart, BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

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
        { title: "Aktive Kurse", value: "18", icon: <BookOpen className="h-4 w-4" /> },
        { title: "Eingeschriebene Nutzer", value: "245", icon: <GraduationCap className="h-4 w-4" /> },
        { title: "Aufgabeneinreichungen", value: "87", icon: <Calendar className="h-4 w-4" /> },
        { title: "Avg. Engagement", value: "73%", icon: <BarChart className="h-4 w-4" /> },
      ];
    }
    
    if (user?.role === "teacher") {
      return [
        { title: "Aktive Kurse", value: "4", icon: <BookOpen className="h-4 w-4" /> },
        { title: "Studierende", value: "86", icon: <GraduationCap className="h-4 w-4" /> },
        { title: "Offene Bewertungen", value: "12", icon: <Calendar className="h-4 w-4" /> },
        { title: "Avg. Bestehensrate", value: "84%", icon: <BarChart className="h-4 w-4" /> },
      ];
    }
    
    return [
      { title: "Belegte Kurse", value: "4", icon: <BookOpen className="h-4 w-4" /> },
      { title: "Abgeschlossene Module", value: "8", icon: <GraduationCap className="h-4 w-4" /> },
      { title: "Nächste Deadline", value: "2 Tage", icon: <Clock className="h-4 w-4" /> },
      { title: "Gesamtfortschritt", value: "65%", icon: <BarChart className="h-4 w-4" /> },
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
          <Card key={index}>
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
                <div key={course.id} className="flex items-center gap-4">
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
              ))}
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
              <div className="rounded-lg border bg-card p-3">
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
              
              <div className="rounded-lg border bg-card p-3">
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
              
              <div className="rounded-lg border bg-card p-3">
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
