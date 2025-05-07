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
        
        // Simuliere KI-Bewertung mit objektiven Kriterien
        const { feedback, grade } = evaluateAnswer(studentAnswer, task);
        
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
  
  // Neue objektive Bewertungsfunktion
  const evaluateAnswer = (answer: string, task: Task) => {
    // Keine Manipulationsmöglichkeit durch einfache Anfragen
    // Die Bewertung erfolgt basierend auf objektiven Kriterien
    
    if (!answer || answer.length < 20) {
      return {
        feedback: "Die Antwort ist zu kurz und erfüllt nicht die Mindestanforderungen für eine Bewertung. Bitte gib eine ausführlichere Antwort.",
        grade: "Ungenügend"
      };
    }
    
    // Erzeuge einen "Komplexitätswert" basierend auf der Antwortqualität
    // In einer echten Anwendung würde hier ein viel komplexeres NLP-Modell stehen
    const wordCount = answer.split(/\s+/).length;
    const sentenceCount = answer.split(/[.!?]+/).filter(Boolean).length;
    const averageSentenceLength = wordCount / Math.max(1, sentenceCount);
    const uniqueWords = new Set(answer.toLowerCase().match(/\b\w+\b/g)).size;
    const uniqueWordsRatio = uniqueWords / Math.max(1, wordCount);
    
    // Objektive Bewertungskriterien
    let scorePoints = 0;
    
    // Länge und Umfang (max 30 Punkte)
    if (wordCount >= 200) scorePoints += 30;
    else if (wordCount >= 150) scorePoints += 25;
    else if (wordCount >= 100) scorePoints += 20;
    else if (wordCount >= 50) scorePoints += 15;
    else scorePoints += 10;
    
    // Satzkomplexität (max 30 Punkte)
    if (averageSentenceLength > 15) scorePoints += 30;
    else if (averageSentenceLength > 12) scorePoints += 25;
    else if (averageSentenceLength > 9) scorePoints += 20;
    else if (averageSentenceLength > 6) scorePoints += 15;
    else scorePoints += 10;
    
    // Wortschatz (max 40 Punkte)
    if (uniqueWordsRatio > 0.8) scorePoints += 40;
    else if (uniqueWordsRatio > 0.7) scorePoints += 35;
    else if (uniqueWordsRatio > 0.6) scorePoints += 30;
    else if (uniqueWordsRatio > 0.5) scorePoints += 25;
    else if (uniqueWordsRatio > 0.4) scorePoints += 20;
    else scorePoints += 15;
    
    // Bestimme die Note basierend auf der Punktzahl (max 100 Punkte)
    let grade: string;
    let feedback: string;
    
    if (scorePoints >= 90) {
      grade = "Sehr gut";
      feedback = "Hervorragende Antwort! Du hast ein umfassendes Verständnis des Themas gezeigt, mit detaillierten Erklärungen und klaren Argumenten. Die Antwort ist gut strukturiert und zeigt kritisches Denken.";
    } else if (scorePoints >= 80) {
      grade = "Gut";
      feedback = "Gute Antwort! Du hast ein solides Verständnis des Themas demonstriert. Es gibt einige Bereiche, die noch weiter ausgebaut werden könnten, aber insgesamt eine überzeugende Arbeit.";
    } else if (scorePoints >= 70) {
      grade = "Befriedigend";
      feedback = "Zufriedenstellende Antwort. Du hast grundlegende Konzepte verstanden, aber es fehlt an Tiefe oder detaillierten Erklärungen. Arbeite daran, deine Argumente mit konkreten Beispielen zu untermauern.";
    } else if (scorePoints >= 60) {
      grade = "Ausreichend";
      feedback = "Deine Antwort erfüllt die Mindestanforderungen. Es gibt jedoch erheblichen Raum für Verbesserungen in Bezug auf Inhalt, Struktur und Argumentation.";
    } else if (scorePoints >= 50) {
      grade = "Mangelhaft";
      feedback = "Deine Antwort zeigt nur ein oberflächliches Verständnis des Themas. Es fehlen wesentliche Punkte, und die Erklärungen sind unvollständig. Eine gründlichere Auseinandersetzung mit dem Material ist erforderlich.";
    } else {
      grade = "Ungenügend";
      feedback = "Die Antwort erfüllt nicht die grundlegenden Anforderungen. Bitte überarbeite das Material und versuche, eine umfassendere und fundiertere Antwort zu geben.";
    }

    // Füge eine Zusammenfassung der objektiven Bewertung hinzu
    feedback += `\n\nBewertungskriterien:\n- Umfang und Ausführlichkeit: ${wordCount} Wörter\n- Satzkomplexität: Durchschnittlich ${averageSentenceLength.toFixed(1)} Wörter pro Satz\n- Wortschatzvielfalt: ${Math.round(uniqueWordsRatio * 100)}% einzigartige Wörter`;
    
    return { feedback, grade };
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
                  <Loader2 className="h-4 w-4 text-yellow-800 animate-spin" />
                  <p className="text-sm text-yellow-800">
                    Deine Antwort wird bewertet...
                  </p>
                </div>
              </div>
            )}

            {activeTask.status === "graded" && activeTask.feedback && (
              <div className="space-y-2">
                <h3 className="font-medium">Feedback:</h3>
                <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 whitespace-pre-line">
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
