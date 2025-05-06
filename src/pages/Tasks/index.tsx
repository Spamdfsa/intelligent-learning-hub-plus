
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, Loader2, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  course: string;
  dueDate?: string;
  status: "pending" | "submitted" | "graded";
  type: "quiz" | "summary";
  answer?: string;
  feedback?: string;
  grade?: string;
  createdAt: Date;
  submittedAt?: Date;
  generatedBy: "ai" | "teacher";
}

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    // In einem realen Projekt würden wir die Aufgaben aus einer Datenbank laden
    const storedTasks = localStorage.getItem("lms-tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    }
  }, []);

  const saveTasksToStorage = (updatedTasks: Task[]) => {
    localStorage.setItem("lms-tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleSubmitAnswer = async (task: Task) => {
    setIsSubmitting(true);
    
    try {
      // Speichere die Antwort des Benutzers
      const updatedTasks = tasks.map(t => 
        t.id === task.id 
          ? { 
              ...t, 
              status: "submitted" as const, 
              answer, 
              submittedAt: new Date() 
            } 
          : t
      );
      
      saveTasksToStorage(updatedTasks);
      setActiveTask(updatedTasks.find(t => t.id === task.id) || null);
      
      toast({
        title: "Antwort eingereicht",
        description: "Deine Antwort wurde erfolgreich eingereicht.",
      });
      
      // Nach der Einreichung automatisch bewerten
      await handleGradeSubmission(task.id, answer);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der Einreichung deiner Antwort.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGradeSubmission = async (taskId: string, studentAnswer: string) => {
    setIsGrading(true);
    
    try {
      // In einem realen Projekt würde hier ein API-Aufruf an einen KI-Dienst erfolgen
      // Simuliere einen API-Aufruf mit setTimeout
      setTimeout(() => {
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
          throw new Error("Aufgabe nicht gefunden");
        }
        
        // Simuliere KI-Bewertung
        const feedback = generateAIFeedback(studentAnswer, task);
        const grade = generateAIGrade(studentAnswer, task);
        
        const updatedTasks = tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                status: "graded" as const, 
                feedback, 
                grade 
              } 
            : t
        );
        
        saveTasksToStorage(updatedTasks);
        setActiveTask(updatedTasks.find(t => t.id === taskId) || null);
        
        toast({
          title: "Automatische Bewertung abgeschlossen",
          description: "Die KI hat deine Antwort bewertet.",
        });
        
        setIsGrading(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der automatischen Bewertung.",
        variant: "destructive",
      });
      setIsGrading(false);
    }
  };
  
  const generateAIFeedback = (answer: string, task: Task): string => {
    // In einem realen Projekt würde hier die echte KI-Bewertung erfolgen
    if (!answer || answer.length < 10) {
      return "Deine Antwort ist zu kurz. Bitte gib eine ausführlichere Antwort.";
    }
    
    const feedbacks = [
      "Sehr gut! Deine Antwort zeigt ein tiefes Verständnis des Themas. Du hast die wichtigsten Konzepte gut erklärt.",
      "Gut gemacht! Deine Antwort deckt die meisten wichtigen Aspekte ab. Versuche beim nächsten Mal noch detaillierter auf die Zusammenhänge einzugehen.",
      "Insgesamt eine zufriedenstellende Antwort. Du könntest noch mehr Beispiele anführen, um deine Punkte zu verdeutlichen.",
      "Deine Antwort enthält einige gute Punkte, aber es fehlen wichtige Aspekte des Themas. Überprüfe nochmals das Kursmaterial.",
      "Du bist auf dem richtigen Weg, aber deine Antwort könnte präziser sein. Versuche, spezifischer auf die Fragestellung einzugehen."
    ];
    
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };
  
  const generateAIGrade = (answer: string, task: Task): string => {
    // In einem realen Projekt würde hier die echte KI-Bewertung erfolgen
    if (!answer || answer.length < 10) {
      return "Ungenügend";
    }
    
    const grades = ["Sehr gut", "Gut", "Befriedigend", "Ausreichend", "Mangelhaft"];
    return grades[Math.floor(Math.random() * 3)]; // Vorwiegend bessere Noten für das Demo
  };
  
  const pendingTasks = tasks.filter(task => task.status === "pending");
  const submittedTasks = tasks.filter(task => task.status === "submitted");
  const gradedTasks = tasks.filter(task => task.status === "graded");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Aufgaben</h1>
      <p className="text-muted-foreground">
        Hier findest du alle deine Aufgaben, einschließlich Quiz-Fragen und Zusammenfassungsaufgaben.
      </p>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            Ausstehend <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">{pendingTasks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Eingereicht <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">{submittedTasks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="graded">
            Bewertet <span className="ml-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">{gradedTasks.length}</span>
          </TabsTrigger>
        </TabsList>

        {["pending", "submitted", "graded"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {tasks.filter(task => task.status === status).length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tasks
                  .filter(task => task.status === status)
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(task => (
                    <Card key={task.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{task.title}</CardTitle>
                          <div className="flex items-center gap-1 text-xs">
                            {task.type === "quiz" ? (
                              <span className="rounded bg-blue-100 px-2 py-1 text-blue-800">Quiz</span>
                            ) : (
                              <span className="rounded bg-purple-100 px-2 py-1 text-purple-800">Zusammenfassung</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-1">
                          <span>{task.course}</span>
                          {task.dueDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>Fällig: {task.dueDate}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="text-sm">
                        <p className="line-clamp-2">{task.description}</p>
                        <div className="mt-4">
                          <Button 
                            onClick={() => setActiveTask(task)} 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                          >
                            {task.status === "pending" ? "Bearbeiten" : "Details anzeigen"}
                          </Button>
                        </div>
                        
                        {task.status === "graded" && (
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Bewertung:</span>
                            <span className={`font-medium ${task.grade === "Sehr gut" || task.grade === "Gut" ? "text-green-600" : task.grade === "Befriedigend" ? "text-yellow-600" : "text-red-600"}`}>
                              {task.grade}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-6">
                  {status === "pending" ? (
                    <Clock className="h-10 w-10 text-muted-foreground" />
                  ) : status === "submitted" ? (
                    <Loader2 className="h-10 w-10 text-muted-foreground" />
                  ) : (
                    <Check className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
                <h3 className="mt-4 text-lg font-medium">Keine {
                  status === "pending" 
                    ? "ausstehenden" 
                    : status === "submitted" 
                      ? "eingereichten" 
                      : "bewerteten"
                } Aufgaben</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {status === "pending" 
                    ? "Du hast aktuell keine ausstehenden Aufgaben." 
                    : status === "submitted" 
                      ? "Du hast noch keine Aufgaben eingereicht." 
                      : "Du hast noch keine bewerteten Aufgaben."}
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {activeTask && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{activeTask.title}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setActiveTask(null);
                  setAnswer("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{activeTask.course}</span>
              {activeTask.dueDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>Fällig: {activeTask.dueDate}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Aufgabenbeschreibung:</h3>
              <p className="text-sm">{activeTask.description}</p>
            </div>

            {activeTask.status === "pending" && (
              <div className="space-y-2">
                <h3 className="font-medium">Deine Antwort:</h3>
                <Textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Schreibe deine Antwort hier..."
                  className="min-h-32"
                />
                <Button 
                  onClick={() => handleSubmitAnswer(activeTask)}
                  disabled={isSubmitting || !answer.trim()}
                  className="w-full mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird eingereicht...
                    </>
                  ) : (
                    "Antwort einreichen"
                  )}
                </Button>
              </div>
            )}

            {activeTask.status !== "pending" && activeTask.answer && (
              <div className="space-y-2">
                <h3 className="font-medium">Deine Antwort:</h3>
                <div className="rounded-md border bg-muted/30 p-3 text-sm">
                  {activeTask.answer}
                </div>
              </div>
            )}

            {activeTask.status === "submitted" && (
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                  <p className="text-sm text-yellow-800">
                    Deine Antwort wird bewertet...
                  </p>
                </div>
              </div>
            )}

            {activeTask.status === "graded" && activeTask.feedback && (
              <div className="space-y-2">
                <h3 className="font-medium">Feedback:</h3>
                <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800">
                  {activeTask.feedback}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">Bewertung:</span>
                  <span className={`font-medium ${activeTask.grade === "Sehr gut" || activeTask.grade === "Gut" ? "text-green-600" : activeTask.grade === "Befriedigend" ? "text-yellow-600" : "text-red-600"}`}>
                    {activeTask.grade}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TasksPage;
