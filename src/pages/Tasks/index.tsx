import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, Loader2, X, FileText, FilePdf } from "lucide-react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ReactMarkdown from 'react-markdown';
import { QuizQuestion, Task } from "@/types";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [answer, setAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const pdfContentRef = useRef<HTMLDivElement>(null);
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
      let updatedTask = { ...task };

      // Handle different task types
      if (task.type === 'quiz' && task.questions) {
        // For quiz tasks, all questions must have an answer
        const allQuestionsAnswered = task.questions.every(q => {
          if (q.answerType === 'multiple-choice') {
            return q.userAnswer !== undefined;
          } else if (q.answerType === 'text') {
            return typeof q.userAnswer === 'string' && q.userAnswer.trim() !== '';
          } else if (q.answerType === 'true-false') {
            return q.userAnswer !== undefined;
          }
          return false;
        });
        
        if (!allQuestionsAnswered) {
          toast({
            title: "Unvollständiges Quiz",
            description: "Bitte beantworte alle Fragen, bevor du das Quiz einreichst.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        updatedTask.status = "submitted";
        updatedTask.submittedAt = new Date();
      } else {
        // For non-quiz tasks
        if (!answer.trim()) {
          toast({
            title: "Leere Antwort",
            description: "Bitte gib eine Antwort ein, bevor du die Aufgabe einreichst.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        updatedTask = {
          ...task,
          status: "submitted",
          answer,
          submittedAt: new Date()
        };
      }
      
      const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t);
      saveTasksToStorage(updatedTasks);
      setActiveTask(updatedTasks.find(t => t.id === task.id) || null);
      
      toast({
        title: "Antwort eingereicht",
        description: "Deine Antwort wurde erfolgreich eingereicht.",
      });
      
      // Nach der Einreichung automatisch bewerten
      await handleGradeSubmission(task.id);
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
  
  const handleMultipleChoiceAnswer = (questionId: string, optionIndex: number) => {
    if (!activeTask || !activeTask.questions) return;
    
    const updatedQuestions = activeTask.questions.map(question => 
      question.id === questionId 
        ? { ...question, userAnswer: optionIndex } 
        : question
    );
    
    const updatedTask = { ...activeTask, questions: updatedQuestions };
    const updatedTasks = tasks.map(t => t.id === activeTask.id ? updatedTask : t);
    
    saveTasksToStorage(updatedTasks);
    setActiveTask(updatedTask);
  };
  
  const handleTextAnswer = (questionId: string, textAnswer: string) => {
    if (!activeTask || !activeTask.questions) return;
    
    const updatedQuestions = activeTask.questions.map(question => 
      question.id === questionId 
        ? { ...question, userAnswer: textAnswer } 
        : question
    );
    
    const updatedTask = { ...activeTask, questions: updatedQuestions };
    const updatedTasks = tasks.map(t => t.id === activeTask.id ? updatedTask : t);
    
    saveTasksToStorage(updatedTasks);
    setActiveTask(updatedTask);
  };
  
  const handleTrueFalseAnswer = (questionId: string, answer: boolean) => {
    if (!activeTask || !activeTask.questions) return;
    
    const updatedQuestions = activeTask.questions.map(question => 
      question.id === questionId 
        ? { ...question, userAnswer: answer ? "true" : "false" } 
        : question
    );
    
    const updatedTask = { ...activeTask, questions: updatedQuestions };
    const updatedTasks = tasks.map(t => t.id === activeTask.id ? updatedTask : t);
    
    saveTasksToStorage(updatedTasks);
    setActiveTask(updatedTask);
  };
  
  const handleGradeSubmission = async (taskId: string) => {
    setIsGrading(true);
    
    try {
      // In einem realen Projekt würde hier ein API-Aufruf an einen KI-Dienst erfolgen
      // Simuliere einen API-Aufruf mit setTimeout
      setTimeout(() => {
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) {
          throw new Error("Aufgabe nicht gefunden");
        }
        
        let feedback = "";
        let grade = "";
        let correctAnswers = 0;
        let totalQuestions = 0;
        
        // Bewertung je nach Aufgabentyp
        if (task.type === 'quiz' && task.questions) {
          totalQuestions = task.questions.length;
          
          // Zähle korrekte Antworten basierend auf dem Antworttyp
          task.questions.forEach(question => {
            if (question.answerType === 'multiple-choice' && question.userAnswer === question.correctOption) {
              correctAnswers++;
            } else if (question.answerType === 'text' && question.userAnswer) {
              // Für Text-Antworten, wenn eine einfache Antwort vorhanden ist, vergleiche strings
              if (question.correctAnswer && 
                  typeof question.userAnswer === 'string' && 
                  question.userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
                correctAnswers++;
              }
              // In einer realen Anwendung würde hier KI für die Bewertung von Freitextantworten verwendet werden
            } else if (question.answerType === 'true-false' && 
                      question.userAnswer === question.correctAnswer) {
              correctAnswers++;
            }
          });
          
          const percentageCorrect = (correctAnswers / totalQuestions) * 100;
          
          // Bewertung basierend auf Prozentsatz
          if (percentageCorrect >= 90) {
            grade = "Sehr gut";
            feedback = `Du hast ${correctAnswers} von ${totalQuestions} Fragen richtig beantwortet (${percentageCorrect.toFixed(1)}%). Hervorragende Leistung!`;
          } else if (percentageCorrect >= 80) {
            grade = "Gut";
            feedback = `Du hast ${correctAnswers} von ${totalQuestions} Fragen richtig beantwortet (${percentageCorrect.toFixed(1)}%). Gute Arbeit!`;
          } else if (percentageCorrect >= 70) {
            grade = "Befriedigend";
            feedback = `Du hast ${correctAnswers} von ${totalQuestions} Fragen richtig beantwortet (${percentageCorrect.toFixed(1)}%). Solide Leistung, aber es gibt noch Raum für Verbesserung.`;
          } else if (percentageCorrect >= 60) {
            grade = "Ausreichend";
            feedback = `Du hast ${correctAnswers} von ${totalQuestions} Fragen richtig beantwortet (${percentageCorrect.toFixed(1)}%). Du solltest die Themen noch einmal wiederholen.`;
          } else {
            grade = "Mangelhaft";
            feedback = `Du hast ${correctAnswers} von ${totalQuestions} Fragen richtig beantwortet (${percentageCorrect.toFixed(1)}%). Bitte arbeite die Materialien noch einmal durch und versuche es erneut.`;
          }
          
          // Füge detailliertes Feedback zu jeder Frage hinzu
          feedback += "\n\n### Detailliertes Feedback:\n\n";
          task.questions.forEach((question, index) => {
            let isCorrect = false;
            
            if (question.answerType === 'multiple-choice') {
              isCorrect = question.userAnswer === question.correctOption;
            } else if (question.answerType === 'text' && question.correctAnswer && question.userAnswer) {
              isCorrect = typeof question.userAnswer === 'string' && 
                           question.userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
            } else if (question.answerType === 'true-false') {
              isCorrect = question.userAnswer === question.correctAnswer;
            }
            
            feedback += `**Frage ${index + 1}:** ${isCorrect ? '✓ Richtig' : '✗ Falsch'}\n`;
            feedback += `> ${question.question}\n\n`;
            
            if (question.answerType === 'multiple-choice' && question.options) {
              feedback += `Deine Antwort: ${typeof question.userAnswer === 'number' ? question.options[question.userAnswer] : 'Keine Antwort'}\n`;
              if (!isCorrect && question.correctOption !== undefined && question.options) {
                feedback += `Richtige Antwort: ${question.options[question.correctOption]}\n\n`;
              } else {
                feedback += '\n';
              }
            } else if (question.answerType === 'text') {
              feedback += `Deine Antwort: ${question.userAnswer || 'Keine Antwort'}\n`;
              if (!isCorrect && question.correctAnswer) {
                feedback += `Richtige Antwort: ${question.correctAnswer}\n\n`;
              } else {
                feedback += '\n';
              }
            } else if (question.answerType === 'true-false') {
              feedback += `Deine Antwort: ${question.userAnswer === 'true' ? 'Wahr' : 'Falsch'}\n`;
              if (!isCorrect && question.correctAnswer) {
                feedback += `Richtige Antwort: ${question.correctAnswer === 'true' ? 'Wahr' : 'Falsch'}\n\n`;
              } else {
                feedback += '\n';
              }
            }
          });
          
        } else {
          // Für nicht-Quiz Aufgaben, verwende die bestehende Bewertungsfunktion
          const result = evaluateAnswer(task.answer || "", task);
          feedback = result.feedback;
          grade = result.grade;
        }
        
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
      feedback += "\n\n### Lösungsvorschlag:\n\n";
      feedback += generateSampleSolution(task);
      feedback += "\n\n*Nutze den Chat, um Rückfragen zu stellen oder klärende Fragen zur Aufgabe zu stellen.*";
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

  // Export to PDF functionality
  const exportToPDF = async () => {
    if (!activeTask || !pdfContentRef.current) return;
    
    setIsExporting(true);
    
    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const content = pdfContentRef.current;
      
      // Add title
      pdf.setFontSize(18);
      pdf.text(activeTask.title, 20, 20);
      
      // Add course name
      pdf.setFontSize(12);
      pdf.text(`Kurs: ${activeTask.course}`, 20, 30);
      
      // Add date if available
      if (activeTask.dueDate) {
        pdf.text(`Fällig: ${activeTask.dueDate}`, 20, 40);
      }
      
      // Convert content to image and add to PDF
      const canvas = await html2canvas(content);
      const imgData = canvas.toDataURL('image/png');
      
      // Add content image - calculate dimensions to fit on page
      const imgWidth = 170;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      // Add content with proper positioning
      pdf.addImage(imgData, 'PNG', 20, 50, imgWidth, imgHeight);
      
      // If content is too large, create multiple pages
      if (imgHeight > pageHeight - 60) {
        let heightLeft = imgHeight;
        let position = 50;
        
        while (heightLeft > 0) {
          position = position - pageHeight + 20;
          heightLeft = heightLeft - (pageHeight - 50);
          
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 20, position, imgWidth, imgHeight);
        }
      }
      
      // Save the PDF
      const filename = `${activeTask.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      pdf.save(filename);
      
      toast({
        title: "PDF erfolgreich erstellt",
        description: `Die Datei ${filename} wurde heruntergeladen.`,
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Fehler",
        description: "Es gab ein Problem beim Exportieren als PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
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
              <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{activeTask.description}</ReactMarkdown>
              </div>
            </div>

            {activeTask.status === "pending" && (
              <div className="space-y-4">
                {/* Quiz Type Task */}
                {activeTask.type === "quiz" && activeTask.questions && activeTask.questions.length > 0 ? (
                  <div className="space-y-6">
                    {activeTask.questions.map((question, qIndex) => (
                      <div key={question.id} className="space-y-3 border rounded-md p-4 bg-card/50">
                        <h4 className="font-medium text-base">Frage {qIndex + 1}:</h4>
                        <div className="prose prose-sm max-w-none dark:prose-invert mb-3">
                          <ReactMarkdown>{question.question}</ReactMarkdown>
                        </div>
                        
                        {/* Multiple Choice Question */}
                        {question.answerType === 'multiple-choice' && question.options && (
                          <RadioGroup 
                            value={question.userAnswer?.toString()} 
                            onValueChange={(value) => handleMultipleChoiceAnswer(question.id, parseInt(value))}
                            className="space-y-2"
                          >
                            {question.options.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                                <RadioGroupItem value={index.toString()} id={`question-${question.id}-option-${index}`} />
                                <Label htmlFor={`question-${question.id}-option-${index}`} className="flex-1 cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                        
                        {/* Text Question */}
                        {question.answerType === 'text' && (
                          <div className="space-y-2">
                            <Label htmlFor={`question-${question.id}-text`}>Deine Antwort:</Label>
                            <Textarea 
                              id={`question-${question.id}-text`}
                              value={question.userAnswer as string || ''}
                              onChange={(e) => handleTextAnswer(question.id, e.target.value)}
                              placeholder="Schreibe deine Antwort hier..."
                              className="min-h-20"
                            />
                          </div>
                        )}
                        
                        {/* True/False Question */}
                        {question.answerType === 'true-false' && (
                          <RadioGroup 
                            value={question.userAnswer?.toString() || ''} 
                            onValueChange={(value) => handleTrueFalseAnswer(question.id, value === 'true')}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                              <RadioGroupItem value="true" id={`question-${question.id}-true`} />
                              <Label htmlFor={`question-${question.id}-true`} className="flex-1 cursor-pointer">
                                Wahr
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-3 hover:bg-muted/50">
                              <RadioGroupItem value="false" id={`question-${question.id}-false`} />
                              <Label htmlFor={`question-${question.id}-false`} className="flex-1 cursor-pointer">
                                Falsch
                              </Label>
                            </div>
                          </RadioGroup>
                        )}
                      </div>
                    ))}
                    <Button 
                      onClick={() => handleSubmitAnswer(activeTask)}
                      disabled={isSubmitting}
                      className="w-full mt-4"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Quiz wird eingereicht...
                        </>
                      ) : (
                        "Quiz einreichen"
                      )}
                    </Button>
                  </div>
                ) : (
                  /* Non-Quiz Tasks */
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
              </div>
            )}

            {/* Content to be exported as PDF */}
            <div ref={pdfContentRef} className="space-y-4">
              {/* Show submitted answer */}
              {activeTask.status !== "pending" && (
                <div className="space-y-4">
                  {activeTask.type === "quiz" && activeTask.questions ? (
                    <div className="space-y-6 border rounded-md p-4 bg-muted/30">
                      <h3 className="font-medium">Deine Quiz-Antworten:</h3>
                      {activeTask.questions.map((question, qIndex) => {
                        let isCorrect = false;
                        
                        if (question.answerType === 'multiple-choice') {
                          isCorrect = question.userAnswer === question.correctOption;
                        } else if (question.answerType === 'text' && question.correctAnswer && question.userAnswer) {
                          isCorrect = typeof question.userAnswer === 'string' && 
                                      question.userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
                        } else if (question.answerType === 'true-false') {
                          isCorrect = question.userAnswer === question.correctAnswer;
                        }
                        
                        return (
                          <div key={question.id} className="space-y-2">
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              <p className="font-medium">Frage {qIndex + 1}:</p>
                              <ReactMarkdown>{question.question}</ReactMarkdown>
                            </div>
                            
                            <p className={`ml-4 ${
                              activeTask.status === "graded"
                                ? isCorrect
                                  ? "text-green
