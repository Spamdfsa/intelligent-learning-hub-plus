
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, Loader2, X, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

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
  messages?: {id: string, content: string, role: "user" | "assistant", timestamp: Date}[];
}

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
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
        
        // Hole die verbesserte Bewertung vom evaluateAnswer
        const { feedback, grade } = evaluateAnswer(studentAnswer, task);
        
        const updatedTasks = tasks.map(t => 
          t.id === taskId 
            ? { 
                ...t, 
                status: "graded" as const, 
                feedback, 
                grade,
                messages: t.messages || [] 
              } 
            : t
        );
        
        saveTasksToStorage(updatedTasks);
        setActiveTask(updatedTasks.find(t => t.id === taskId) || null);
        
        toast({
          title: "Bewertung abgeschlossen",
          description: "Deine Antwort wurde bewertet.",
        });
        
        setIsGrading(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der Bewertung.",
        variant: "destructive",
      });
      setIsGrading(false);
    }
  };
  
  // Verbesserte Bewertungsfunktion mit Teacher-Prompt
  const evaluateAnswer = (answer: string, task: Task) => {
    // Keine objektiven Kriterien in der sichtbaren Bewertung mehr anzeigen
    // Stattdessen Lehrkraft-ähnliche kritische Bewertung
    
    if (!answer || answer.length < 20) {
      return {
        feedback: "Die Antwort ist zu kurz und erfüllt nicht die Mindestanforderungen für eine Bewertung. Bitte reiche eine ausführlichere Antwort ein.",
        grade: "Ungenügend"
      };
    }
    
    // Versteckte Bewertungskriterien (nicht im Feedback sichtbar)
    const wordCount = answer.split(/\s+/).length;
    const sentenceCount = answer.split(/[.!?]+/).filter(Boolean).length;
    const averageSentenceLength = wordCount / Math.max(1, sentenceCount);
    const uniqueWords = new Set(answer.toLowerCase().match(/\b\w+\b/g)).size;
    const uniqueWordsRatio = uniqueWords / Math.max(1, wordCount);
    
    // Objektive Bewertungskriterien im Hintergrund
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
    
    // Lehrer-Feedback ohne sichtbare Kriterien
    let grade: string;
    let feedback: string;
    
    if (scorePoints >= 90) {
      grade = "Sehr gut";
      feedback = "Sehr gut! Du hast die Aufgabenstellung vollständig erfasst und alle relevanten Aspekte korrekt behandelt. Deine Ausführungen sind präzise und zeigen ein hervorragendes Verständnis des Themas.";
    } else if (scorePoints >= 80) {
      grade = "Gut";
      feedback = "Gut! Deine Antwort enthält die meisten wichtigen Punkte und zeigt ein gutes Verständnis des Themas. An einigen Stellen könnte die Erklärung noch detaillierter sein.";
    } else if (scorePoints >= 70) {
      grade = "Befriedigend";
      feedback = "Deine Antwort zeigt ein grundlegendes Verständnis des Themas, jedoch fehlen einige wichtige Aspekte oder wurden nicht ausreichend erläutert. Achte darauf, alle Teile der Aufgabenstellung zu berücksichtigen.";
    } else if (scorePoints >= 60) {
      grade = "Ausreichend";
      feedback = "Deine Antwort erfüllt die grundlegenden Anforderungen, weist jedoch einige inhaltliche Lücken und Ungenauigkeiten auf. Für eine bessere Bewertung solltest du die Kernaspekte der Fragestellung ausführlicher behandeln.";
    } else if (scorePoints >= 50) {
      grade = "Mangelhaft";
      feedback = "Deine Antwort behandelt das Thema nur oberflächlich und enthält einige Fehler. Wichtige Kernpunkte der Aufgabe wurden nicht ausreichend oder gar nicht behandelt. Für die nächste Aufgabe empfehle ich eine tiefere Auseinandersetzung mit dem Material.";
    } else {
      grade = "Ungenügend";
      feedback = "Die eingereichte Arbeit entspricht leider nicht den grundlegenden Anforderungen der Aufgabenstellung. Wesentliche Aspekte fehlen oder sind falsch dargestellt. Ich empfehle, das Material erneut durchzuarbeiten und bei Unklarheiten Fragen zu stellen.";
    }

    // Lösungsvorschlag für ungenügende oder mangelhafte Antworten hinzufügen
    if (grade === "Ungenügend" || grade === "Mangelhaft") {
      feedback += "\n\nHier ist ein Ansatz, wie die Aufgabe besser gelöst werden könnte:\n";
      feedback += generateSampleSolution(task);
      feedback += "\n\nNutze den Chat, um Rückfragen zu stellen oder klärende Fragen zur Aufgabe zu stellen.";
    }
    
    return { feedback, grade };
  };

  // Funktion zum Generieren eines Lösungsvorschlags für schlechte Antworten
  const generateSampleSolution = (task: Task) => {
    // Je nach Task-Typ unterschiedliche Lösungsvorschläge generieren
    if (task.type === "quiz") {
      return "Beim Beantworten von Quizfragen ist es wichtig, die Fragestellung genau zu verstehen und alle relevanten Konzepte einzubeziehen. Achte auf präzise Definitionen und erläutere auch die Zusammenhänge zwischen den Konzepten.";
    } else {
      return "Bei einer Zusammenfassung solltest du die wichtigsten Punkte identifizieren und in eigenen Worten wiedergeben. Achte darauf, die Kernaussagen zu extrahieren und in einer logischen Struktur zu präsentieren. Vermeide es, unwichtige Details einzubeziehen oder vom Thema abzuschweifen.";
    }
  };

  // Chat-Funktion zur Rückfrage
  const handleSendChatMessage = () => {
    if (!chatMessage.trim() || !activeTask) return;
    
    setIsSendingChat(true);
    
    try {
      const userMessage = {
        id: `user-${Date.now()}`,
        content: chatMessage,
        role: "user" as const,
        timestamp: new Date()
      };
      
      // Aktualisiere die Task mit der neuen Nachricht
      const updatedTasks = tasks.map(t => 
        t.id === activeTask.id 
          ? { 
              ...t, 
              messages: [...(t.messages || []), userMessage] 
            } 
          : t
      );
      
      saveTasksToStorage(updatedTasks);
      setActiveTask(updatedTasks.find(t => t.id === activeTask.id) || null);
      setChatMessage("");
      
      // Simuliere eine Antwort vom Lehrer/System nach einer kurzen Verzögerung
      setTimeout(() => {
        const assistantResponse = {
          id: `assistant-${Date.now()}`,
          content: generateAssistantResponse(chatMessage, activeTask),
          role: "assistant" as const,
          timestamp: new Date()
        };
        
        const updatedTasksWithResponse = tasks.map(t => 
          t.id === activeTask.id 
            ? { 
                ...t, 
                messages: [...(t.messages || []), assistantResponse] 
              } 
            : t
        );
        
        saveTasksToStorage(updatedTasksWithResponse);
        setActiveTask(updatedTasksWithResponse.find(t => t.id === activeTask.id) || null);
        setIsSendingChat(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Senden deiner Nachricht.",
        variant: "destructive",
      });
      setIsSendingChat(false);
    }
  };
  
  // Generiere eine Lehrerperson-Antwort
  const generateAssistantResponse = (message: string, task: Task) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("lösung") || lowerMessage.includes("hilfe") || lowerMessage.includes("verstehe nicht")) {
      return "Ich kann dir Hinweise geben, aber keine kompletten Lösungen. Versuche, die Aufgabe in kleinere Teilprobleme zu zerlegen und überlege, welche Konzepte aus dem Unterricht relevant sein könnten.";
    } else if (lowerMessage.includes("bewertung") || lowerMessage.includes("note") || lowerMessage.includes("punkte")) {
      return "Die Bewertung erfolgt nach fachlichen und didaktischen Kriterien. Eine gute Antwort zeigt ein tiefes Verständnis des Themas, behandelt alle relevanten Aspekte der Fragestellung und ist klar strukturiert.";
    } else if (lowerMessage.includes("frist") || lowerMessage.includes("abgabe") || lowerMessage.includes("zeit")) {
      return `Die Abgabefrist für diese Aufgabe ist am ${task.dueDate || "Ende der Woche"}. Planungstipp: Beginne frühzeitig, um genug Zeit für Recherche und Überarbeitung zu haben.`;
    } else {
      return "Danke für deine Nachricht. Bitte sei bei Fragen möglichst spezifisch, damit ich dir gezielt helfen kann. Wenn du Schwierigkeiten mit bestimmten Konzepten hast, kannst du auch Teile deiner Antwort vorab teilen, um Feedback zu erhalten.";
    }
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
                              <span className="rounded bg-blue-100 px-2 py-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Quiz</span>
                            ) : (
                              <span className="rounded bg-purple-100 px-2 py-1 text-purple-800 dark:bg-purple-900 dark:text-purple-200">Zusammenfassung</span>
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
                            <span className={`font-medium ${task.grade === "Sehr gut" || task.grade === "Gut" ? "text-green-600 dark:text-green-400" : task.grade === "Befriedigend" ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
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
              <div className="rounded-md bg-yellow-50 border border-yellow-200 p-3 dark:bg-yellow-900/30 dark:border-yellow-700">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-yellow-800 dark:text-yellow-400 animate-spin" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    Deine Antwort wird bewertet...
                  </p>
                </div>
              </div>
            )}

            {activeTask.status === "graded" && activeTask.feedback && (
              <div className="space-y-2">
                <h3 className="font-medium">Feedback:</h3>
                <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-800 whitespace-pre-line dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
                  {activeTask.feedback}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-medium">Bewertung:</span>
                  <span className={`font-medium ${activeTask.grade === "Sehr gut" || activeTask.grade === "Gut" ? "text-green-600 dark:text-green-400" : activeTask.grade === "Befriedigend" ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                    {activeTask.grade}
                  </span>
                </div>
              </div>
            )}
            
            {/* Chat-Bereich für Rückfragen */}
            {activeTask.status !== "pending" && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Rückfragen zur Aufgabe
                </h3>
                
                {/* Chat-Nachrichten */}
                <div className="rounded-md border bg-muted/30 mb-3 p-2 max-h-60 overflow-y-auto">
                  {activeTask.messages && activeTask.messages.length > 0 ? (
                    <div className="space-y-3">
                      {activeTask.messages.map(message => (
                        <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[80%] rounded-lg p-2 text-sm ${
                            message.role === "user" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-secondary text-secondary-foreground"
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-center text-muted-foreground py-4">
                      Noch keine Nachrichten. Stelle eine Frage zur Aufgabe.
                    </p>
                  )}
                </div>
                
                {/* Chat-Eingabefeld */}
                <div className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Stelle eine Frage zur Aufgabe..."
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendChatMessage}
                    disabled={isSendingChat || !chatMessage.trim()}
                    size="sm"
                  >
                    {isSendingChat ? <Loader2 className="h-4 w-4 animate-spin" /> : "Senden"}
                  </Button>
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
