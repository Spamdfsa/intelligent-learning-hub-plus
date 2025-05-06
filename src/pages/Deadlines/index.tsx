
import { useEffect, useState } from "react";
import { Task, User } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { mockCourses } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { format, isBefore, addDays } from "date-fns";
import { de } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, AlertTriangle } from "lucide-react";

const DeadlinesPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [deadlines, setDeadlines] = useState<Task[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Get all tasks with deadlines from all courses
    const allDeadlines: Task[] = [];
    mockCourses.forEach(course => {
      course.modules.forEach(module => {
        module.tasks.forEach(task => {
          if (task.dueDate) {
            allDeadlines.push({
              ...task,
              courseId: course.id,
              moduleId: module.id
            });
          }
        });
      });
    });

    // Sort by due date (closest first)
    allDeadlines.sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    setDeadlines(allDeadlines);
  }, []);

  const getTaskStatus = (dueDate: string | undefined) => {
    if (!dueDate) return "none";
    
    const due = new Date(dueDate);
    const now = new Date();
    
    if (isBefore(due, now)) {
      return "overdue";
    }
    
    const threeDaysFromNow = addDays(now, 3);
    if (isBefore(due, threeDaysFromNow)) {
      return "soon";
    }
    
    return "upcoming";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return <Badge variant="destructive" className="ml-2">Überfällig</Badge>;
      case "soon":
        return <Badge variant="warning" className="ml-2 bg-amber-500">Bald fällig</Badge>;
      default:
        return <Badge variant="secondary" className="ml-2">Kommend</Badge>;
    }
  };

  const handleTaskClick = (task: Task) => {
    if (task.courseId && task.moduleId) {
      navigate(`/courses/${task.courseId}?module=${task.moduleId}&task=${task.id}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nächste Deadlines</h1>
        <p className="text-muted-foreground">
          Übersicht deiner anstehenden Aufgaben und Fristen
        </p>
      </div>

      <div className="space-y-4">
        {deadlines.map((task) => {
          const status = getTaskStatus(task.dueDate);
          const statusBadge = getStatusBadge(status);
          const courseTitle = mockCourses.find(c => c.id === task.courseId)?.title || "Unbekannter Kurs";
          const moduleTitle = mockCourses
            .find(c => c.id === task.courseId)
            ?.modules.find(m => m.id === task.moduleId)?.title || "Unbekanntes Modul";
          
          return (
            <Card 
              key={task.id} 
              className={`
                cursor-pointer hover:shadow-md transition-all
                ${status === "overdue" ? "border-red-500 border-2" : ""}
                ${status === "soon" ? "border-amber-500 border" : ""}
              `}
              onClick={() => handleTaskClick(task)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center">
                      {task.title}
                      {statusBadge}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <span>{courseTitle}</span>
                      <span>•</span>
                      <span>{moduleTitle}</span>
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center">
                    {task.type === "assignment" && <FileText className="h-5 w-5 text-primary mr-1" />}
                    {task.type === "quiz" && <Clock className="h-5 w-5 text-amber-500 mr-1" />}
                    {status === "overdue" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Fällig am {task.dueDate ? format(new Date(task.dueDate), "EEEE, dd. MMMM yyyy", { locale: de }) : "Unbekannt"}
                    </span>
                  </div>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
                )}
              </CardContent>
            </Card>
          );
        })}

        {deadlines.length === 0 && (
          <div className="py-12 text-center">
            <h3 className="text-lg font-medium">Keine anstehenden Deadlines</h3>
            <p className="text-muted-foreground">
              Du hast aktuell keine fälligen Aufgaben.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeadlinesPage;
