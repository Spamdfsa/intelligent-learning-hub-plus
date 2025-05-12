
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockCourses } from "@/data/mockData";
import { Course, Module, Task, User, QuizQuestion } from "@/types";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Clock, FileText, MessageCircle, PlayCircle, User as UserIcon, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("modules");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showMaterial, setShowMaterial] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const { toast } = useToast();

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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setQuizAnswers({});
    setShowMaterial(true);
    
    // Mark as completed if not already
    if (!task.completed && user?.role === "student") {
      task.completed = true;
      toast({
        title: "Fortschritt gespeichert",
        description: `${task.title} wurde als abgeschlossen markiert.`,
      });
    }
  };

  const handleQuizAnswerChange = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const handleQuizSubmit = () => {
    if (!selectedTask || !selectedTask.questions) return;
    
    // Calculate results
    let correctCount = 0;
    let totalQuestions = selectedTask.questions.length;
    
    selectedTask.questions.forEach(question => {
      if (quizAnswers[question.id] === question.correctOption) {
        correctCount++;
      }
    });
    
    const percentage = (correctCount / totalQuestions) * 100;
    
    toast({
      title: "Quiz Ergebnis",
      description: `Du hast ${correctCount} von ${totalQuestions} Fragen richtig beantwortet (${percentage.toFixed(0)}%).`,
    });
    
    // Mark task as completed
    if (selectedTask && !selectedTask.completed && user?.role === "student") {
      selectedTask.completed = true;
    }
    
    // Close the dialog after a short delay to show the toast
    setTimeout(() => setShowMaterial(false), 2000);
  };

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

  const renderTaskContent = () => {
    if (!selectedTask) return null;

    switch (selectedTask.type) {
      case "reading":
        return (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {selectedTask.content ? (
              <div dangerouslySetInnerHTML={{ __html: selectedTask.content }} />
            ) : (
              <ReactMarkdown>{selectedTask.description || ""}</ReactMarkdown>
            )}
          </div>
        );
      case "video":
        return (
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
              {selectedTask.videoUrl ? (
                <iframe 
                  src={selectedTask.videoUrl} 
                  className="absolute inset-0 w-full h-full" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <PlayCircle className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">Video nicht verfügbar</p>
                </div>
              )}
            </div>
            {selectedTask.description && (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{selectedTask.description}</ReactMarkdown>
              </div>
            )}
          </div>
        );
      case "quiz":
        return (
          <div className="space-y-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{selectedTask.description || ""}</ReactMarkdown>
            </div>
            
            {selectedTask.questions && selectedTask.questions.length > 0 ? (
              <>
                {selectedTask.questions.map((question: QuizQuestion, index) => (
                  <div key={question.id} className="space-y-3 border rounded-md p-4">
                    <h3 className="font-medium">Frage {index + 1}: {question.question}</h3>
                    <RadioGroup 
                      value={quizAnswers[question.id]?.toString()} 
                      onValueChange={(value) => handleQuizAnswerChange(question.id, parseInt(value))}
                      className="space-y-2"
                    >
                      {question.options.map((option, optIdx) => (
                        <div key={optIdx} className="flex items-center space-x-2 p-3 border rounded-md hover:bg-muted/50">
                          <RadioGroupItem value={optIdx.toString()} id={`question-${question.id}-option-${optIdx}`} />
                          <Label htmlFor={`question-${question.id}-option-${optIdx}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
                <Button 
                  className="w-full"
                  onClick={handleQuizSubmit}
                  disabled={Object.keys(quizAnswers).length < (selectedTask.questions?.length || 0)}
                >
                  Quiz einreichen
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground">Dieses Quiz enthält keine Fragen.</p>
            )}
          </div>
        );
      case "assignment":
        return (
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              {selectedTask.content ? (
                <div dangerouslySetInnerHTML={{ __html: selectedTask.content }} />
              ) : (
                <ReactMarkdown>{selectedTask.description || ""}</ReactMarkdown>
              )}
            </div>
          </div>
        );
      default:
        return <p>Inhalt nicht verfügbar</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">
            Dozent: {course.instructor} • {course.level} • {course.duration || "Keine Angabe"}
          </p>
        </div>
        {user?.role === "student" && (
          <Button>Fortsetzen</Button>
        )}
        {user?.role === "teacher" && (course.instructor_id === user.id || course.instructorId === user.id) && (
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="modules">Module</TabsTrigger>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="space-y-4 pt-4">
          {course.modules && course.modules.length > 0 ? (
            <Accordion type="single" collapsible className="w-full">
              {course.modules.map((module: Module, moduleIndex) => (
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
                      {module.tasks.map((task: Task, taskIndex) => (
                        <div 
                          key={task.id} 
                          className={cn(
                            "flex items-center justify-between p-4 hover:bg-accent/50 transition-colors",
                            task.completed && "bg-green-50 dark:bg-green-900/10"
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
                                {(task.due_date || task.dueDate) && ` • Fällig am: ${task.due_date || task.dueDate}`}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant={task.completed ? "outline" : "secondary"} 
                            size="sm"
                            onClick={() => handleTaskClick(task)}
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
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              Für diesen Kurs wurden noch keine Module erstellt.
            </p>
          )}
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
                    <span>{course.category || "Allgemein"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Niveau</span>
                    <span>{course.level}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Dauer</span>
                    <span>{course.duration || "Keine Angabe"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Teilnehmer</span>
                    <span>{course.enrolledStudents || course.enrolled || 0}</span>
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
                  <p className="text-sm text-muted-foreground">Dozent für {course.category || "Allgemeine Fächer"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showMaterial} onOpenChange={setShowMaterial}>
        <DialogContent className="max-w-3xl">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTask.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                {renderTaskContent()}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function cn(...inputs: (string | boolean | undefined)[]): string {
  return inputs.filter(Boolean).join(' ');
}

export default CourseDetail;
