
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { mockCourses } from "@/data/mockData";
import { Course, Module, Task, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle, Clock, FileText, MessageCircle, PlayCircle, User as UserIcon, Video } from "lucide-react";

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("modules");

  useEffect(() => {
    // Find the course
    const foundCourse = mockCourses.find((c) => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
    }

    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [courseId]);

  if (!course) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p>Kurs nicht gefunden.</p>
      </div>
    );
  }

  const renderTaskIcon = (type: Task["type"]) => {
    switch (type) {
      case "reading":
        return <FileText className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "quiz":
        return <MessageCircle className="h-5 w-5" />;
      case "assignment":
        return <FileText className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">
            Dozent: {course.instructor} • {course.level} • {course.duration}
          </p>
        </div>
        {user?.role === "student" && (
          <Button>Fortsetzen</Button>
        )}
        {user?.role === "teacher" && course.instructorId === user.id && (
          <Button>Kurs bearbeiten</Button>
        )}
        {user?.role === "admin" && (
          <Button>Kurs verwalten</Button>
        )}
      </div>

      {user?.role === "student" && course.progress !== undefined && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Kursfortschritt</span>
                <span className="text-sm font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="modules">Module</TabsTrigger>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="discussion">Diskussion</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4 pt-4">
          <Accordion type="single" collapsible className="w-full">
            {course.modules.map((module, moduleIndex) => (
              <AccordionItem key={module.id} value={`module-${moduleIndex}`}>
                <AccordionTrigger className="py-4 px-6 bg-card rounded-t-lg border">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">
                      Modul {moduleIndex + 1}: {module.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pt-1 pb-0">
                  <div className="space-y-1 rounded-b-lg overflow-hidden border border-t-0">
                    {module.tasks.map((task, taskIndex) => (
                      <div 
                        key={task.id} 
                        className={cn(
                          "task-item",
                          task.completed && "task-item-completed"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {task.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              renderTaskIcon(task.type)
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {moduleIndex + 1}.{taskIndex + 1} {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {task.type === "reading" && "Leseaufgabe"}
                              {task.type === "video" && "Video"}
                              {task.type === "quiz" && "Quiz"}
                              {task.type === "assignment" && "Aufgabe"}
                              {task.dueDate && ` • Fällig am: ${task.dueDate}`}
                            </p>
                          </div>
                        </div>
                        <Button 
                          variant={task.completed ? "outline" : "secondary"} 
                          size="sm"
                        >
                          {task.completed ? "Wiederholen" : "Starten"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Kursbeschreibung</h3>
            </CardHeader>
            <CardContent>
              <p>{course.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <h4 className="font-medium mb-2">Was du lernen wirst</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Grundlagen und fortgeschrittene Konzepte</li>
                    <li>Praktische Anwendungen und Übungen</li>
                    <li>Projektbasierte Lernmethoden</li>
                    <li>Professionelle Best Practices</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Voraussetzungen</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Grundlegende Kenntnisse in diesem Bereich</li>
                    <li>Zugang zu benötigter Software</li>
                    <li>Interesse am Thema</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Kursdetails</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Kategorie</span>
                    <span>{course.category}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Niveau</span>
                    <span>{course.level}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Dauer</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Teilnehmer</span>
                    <span>{course.enrolledStudents}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Dozent</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">{course.instructor}</p>
                  <p className="text-sm text-muted-foreground">Dozent für {course.category}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="discussion" className="space-y-4 pt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
                <MessageCircle className="h-10 w-10 text-muted-foreground" />
                <h3 className="font-medium text-lg">Diskussionsforum</h3>
                <p className="text-muted-foreground">
                  Hier kannst du Fragen stellen und mit anderen Kursteilnehmern diskutieren.
                </p>
                <Button>Neue Diskussion starten</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

function cn(...inputs: (string | boolean | undefined)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export default CourseDetail;
