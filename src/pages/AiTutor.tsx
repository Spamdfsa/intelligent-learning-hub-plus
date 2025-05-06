
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessage } from "@/types";
import { Send, Bot, Loader2, Check, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  timestamp: Date;
  type: "quiz" | "summary";
}

const AiTutor = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "Hallo! Ich bin dein KI-Tutor. Wie kann ich dir heute bei deinem Lernen helfen?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [courseSelection, setCourseSelection] = useState("Einführung in die Informatik");
  const [questionCount, setQuestionCount] = useState("5");
  const [difficulty, setDifficulty] = useState("Mittel");
  const [summaryStyle, setSummaryStyle] = useState("Kurz und prägnant");
  const [moduleSelection, setModuleSelection] = useState("Alle Module");
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: input,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // In einem realen Projekt würden wir hier eine API-Anfrage an einen KI-Dienst senden
      setTimeout(() => {
        const botResponses = [
          "Gute Frage! Lass mich das erklären...",
          "Das ist ein interessantes Konzept. Im Wesentlichen geht es darum, dass...",
          "Hier sind einige Schritte, die dir helfen könnten:",
          "In diesem Zusammenhang ist es wichtig zu verstehen, dass...",
          "Basierend auf deinen bisherigen Kursaktivitäten würde ich empfehlen...",
        ];
        
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        
        const aiMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          content: `${randomResponse} ${input.includes("?") ? "Hast du noch weitere Fragen?" : "Kann ich dir bei etwas anderem helfen?"}`,
          role: "assistant",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Es gab ein Problem bei der Kommunikation mit dem KI-Tutor.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = () => {
    setIsLoading(true);
    
    // Simuliere Quiz-Generierung
    setTimeout(() => {
      const quizContent = generateMockQuiz(courseSelection, parseInt(questionCount), difficulty);
      
      setGeneratedContent({
        id: uuidv4(),
        title: `Quiz: ${courseSelection}`,
        content: quizContent,
        timestamp: new Date(),
        type: "quiz"
      });

      saveToTasks({
        id: uuidv4(),
        title: `Quiz: ${courseSelection}`,
        description: quizContent,
        course: courseSelection,
        dueDate: getRandomDueDate(),
        status: "pending",
        type: "quiz",
        createdAt: new Date(),
        generatedBy: "ai"
      });
      
      toast({
        title: "Quiz generiert",
        description: "Ein neues Quiz wurde basierend auf deinen Kursinhalten erstellt und zu deinen Aufgaben hinzugefügt.",
      });
      
      setIsLoading(false);
    }, 2000);
  };

  const handleGenerateSummary = () => {
    setIsLoading(true);
    
    // Simuliere Zusammenfassungs-Generierung
    setTimeout(() => {
      const summaryContent = generateMockSummary(courseSelection, moduleSelection, summaryStyle);
      
      setGeneratedContent({
        id: uuidv4(),
        title: `Zusammenfassung: ${courseSelection} - ${moduleSelection}`,
        content: summaryContent,
        timestamp: new Date(),
        type: "summary"
      });

      saveToTasks({
        id: uuidv4(),
        title: `Zusammenfassung: ${courseSelection}`,
        description: `Erstellen Sie anhand dieser Zusammenfassung ein Mindmap oder eine strukturierte Übersicht der wichtigsten Konzepte:\n\n${summaryContent}`,
        course: courseSelection,
        dueDate: getRandomDueDate(),
        status: "pending",
        type: "summary",
        createdAt: new Date(),
        generatedBy: "ai"
      });
      
      toast({
        title: "Zusammenfassung generiert",
        description: "Eine Zusammenfassung deiner Kursunterlagen wurde erstellt und zu deinen Aufgaben hinzugefügt.",
      });
      
      setIsLoading(false);
    }, 2000);
  };

  const saveToTasks = (newTask: any) => {
    // Lade vorhandene Aufgaben aus dem localStorage
    const storedTasks = localStorage.getItem("lms-tasks");
    let tasks = storedTasks ? JSON.parse(storedTasks) : [];
    
    // Füge die neue Aufgabe hinzu
    tasks.push(newTask);
    
    // Speichere die aktualisierte Liste
    localStorage.setItem("lms-tasks", JSON.stringify(tasks));
  };
  
  const getRandomDueDate = () => {
    const today = new Date();
    const daysToAdd = Math.floor(Math.random() * 14) + 3; // 3 bis 17 Tage
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + daysToAdd);
    
    return `${dueDate.getDate()}.${dueDate.getMonth() + 1}.${dueDate.getFullYear()}`;
  };
  
  const generateMockQuiz = (course: string, count: number, difficulty: string): string => {
    const quizQuestions = [
      { q: "Was sind die Hauptkomponenten eines Von-Neumann-Rechners?", a: "Prozessor, Speicher, Ein-/Ausgabegeräte und Bus-System" },
      { q: "Wie funktioniert das HTTP-Protokoll?", a: "Es ist ein zustandsloses Protokoll für Client-Server-Kommunikation im Web" },
      { q: "Was ist der Unterschied zwischen Stack und Heap?", a: "Stack speichert lokale Variablen, Heap speichert dynamisch allozierte Objekte" },
      { q: "Erkläre die Funktionsweise von Hashtabellen.", a: "Datenstruktur, die Schlüssel-Wert-Paare mittels Hashfunktion speichert" },
      { q: "Was sind die ACID-Eigenschaften in Datenbanktransaktionen?", a: "Atomarität, Konsistenz, Isolation und Dauerhaftigkeit" },
      { q: "Wie funktioniert der Quick-Sort-Algorithmus?", a: "Teile-und-herrsche Algorithmus mit Pivot-Element zur Sortierung" },
      { q: "Was ist Polymorphismus in der objektorientierten Programmierung?", a: "Fähigkeit eines Objekts, in verschiedenen Formen aufzutreten" },
      { q: "Erkläre den Unterschied zwischen TCP und UDP.", a: "TCP ist verbindungsorientiert und zuverlässig, UDP ist verbindungslos und schneller" },
      { q: "Was ist ein Deadlock und wie kann er vermieden werden?", a: "Verklemmungszustand von Prozessen, vermeidbar durch Ressourcenzuordnungsstrategien" },
      { q: "Wie funktioniert das OAuth 2.0-Protokoll?", a: "Autorisierungsframework für sicheren, eingeschränkten Zugriff auf Ressourcen" }
    ];
    
    const selectedQuestions = [];
    const usedIndices = new Set();
    
    for (let i = 0; i < Math.min(count, quizQuestions.length); i++) {
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * quizQuestions.length);
      } while (usedIndices.has(randomIndex));
      
      usedIndices.add(randomIndex);
      selectedQuestions.push(quizQuestions[randomIndex]);
    }
    
    return selectedQuestions.map((q, index) => 
      `Frage ${index + 1}: ${q.q}\n\nSchwierigkeit: ${difficulty}`
    ).join("\n\n---\n\n");
  };
  
  const generateMockSummary = (course: string, module: string, style: string): string => {
    const summaries = [
      `# Grundlagen der Informatik\n\nDie Informatik befasst sich mit der automatischen Verarbeitung von Informationen. Sie umfasst sowohl theoretische als auch praktische Aspekte der Datenverarbeitung. Zentrale Konzepte sind Algorithmen (Verfahren zur Lösung von Problemen), Datenstrukturen (Organisationsformen für Daten) und Programmiersprachen (formale Sprachen zur Formulierung von Algorithmen).\n\nWichtige Teilgebiete:\n- Theoretische Informatik: Automatentheorie, Berechenbarkeitstheorie, Komplexitätstheorie\n- Praktische Informatik: Programmierung, Softwareentwicklung, Datenbanken\n- Technische Informatik: Rechnerarchitektur, Betriebssysteme, Netzwerke\n\nDie Bedeutung der Informatik erstreckt sich heute auf nahezu alle Lebensbereiche, von der Kommunikation über die Medizin bis hin zur Wirtschaft.`,
      
      `# Objektorientierte Programmierung\n\nDie objektorientierte Programmierung (OOP) ist ein Programmierparadigma, das auf dem Konzept von "Objekten" basiert, die Daten und Verhalten kombinieren. Die Grundprinzipien der OOP sind:\n\n1. **Kapselung**: Daten und Methoden werden in Objekten zusammengefasst, wobei der interne Zustand vor externem Zugriff geschützt ist.\n\n2. **Vererbung**: Neue Klassen können von vorhandenen Klassen abgeleitet werden und deren Eigenschaften und Methoden erben.\n\n3. **Polymorphismus**: Objekte können in verschiedenen Formen auftreten, abhängig vom Kontext.\n\n4. **Abstraktion**: Komplexe Details werden verborgen, und nur relevante Funktionen werden nach außen zugänglich gemacht.\n\nBeispiele für objektorientierte Programmiersprachen sind Java, C++, Python und C#.`,
      
      `# Datenbanksysteme\n\nDatenbanksysteme dienen zur strukturierten Speicherung, Verwaltung und Abfrage großer Datenmengen. Ein Datenbankmanagementsystem (DBMS) ermöglicht den effizienten Zugriff auf die Daten und gewährleistet Datensicherheit und -integrität.\n\nTypen von Datenbanken:\n- Relationale Datenbanken: Daten in Tabellen mit Beziehungen (z.B. MySQL, PostgreSQL)\n- NoSQL-Datenbanken: Nicht-relationale Datenbanken für spezielle Anwendungsfälle (z.B. MongoDB, Redis)\n- Graphdatenbanken: Fokus auf Beziehungen zwischen Entitäten (z.B. Neo4j)\n\nDie Structured Query Language (SQL) ist die Standardsprache für die Arbeit mit relationalen Datenbanken. Sie ermöglicht das Abfragen, Einfügen, Aktualisieren und Löschen von Daten sowie die Definition von Datenbankstrukturen.`
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  };
  
  const handleNavigateToTasks = () => {
    navigate("/tasks");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">KI-Tutor</h1>
      <p className="text-muted-foreground">
        Stell Fragen zu deinen Kursinhalten, generiere Quizfragen oder lass dir bei Aufgaben helfen.
      </p>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">Chat mit KI-Tutor</TabsTrigger>
          <TabsTrigger value="quiz">Quiz generieren</TabsTrigger>
          <TabsTrigger value="summary">Zusammenfassung</TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4 pt-4">
          <Card className="border-none shadow-none">
            <CardContent className="p-0">
              <div className="flex h-[70vh] flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="mb-2 flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <span className="font-medium">KI-Tutor</span>
                          </div>
                        )}
                        <p className="text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg bg-muted p-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span className="text-sm">KI-Tutor schreibt...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Textarea
                      placeholder="Stelle eine Frage zu deinen Kursinhalten..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || !input.trim()}
                    >
                      <Send className="h-5 w-5" />
                      <span className="sr-only">Senden</span>
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiz" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Quiz-Generator</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Generiere automatisch Quizfragen basierend auf deinen Kursinhalten, um dein Wissen zu testen.</p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Wähle einen Kurs:</p>
                <select 
                  className="w-full border rounded p-2"
                  value={courseSelection}
                  onChange={(e) => setCourseSelection(e.target.value)}
                >
                  <option>Einführung in die Informatik</option>
                  <option>Datenbanksysteme</option>
                  <option>Machine Learning Grundlagen</option>
                  <option>Web-Entwicklung</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Anzahl der Fragen:</p>
                <select 
                  className="w-full border rounded p-2"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                >
                  <option>5</option>
                  <option>10</option>
                  <option>15</option>
                  <option>20</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Schwierigkeitsgrad:</p>
                <select 
                  className="w-full border rounded p-2"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option>Leicht</option>
                  <option>Mittel</option>
                  <option>Schwer</option>
                  <option>Gemischt</option>
                </select>
              </div>
              <Button onClick={handleGenerateQuiz} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Quiz wird generiert...
                  </>
                ) : (
                  "Quiz generieren"
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedContent && generatedContent.type === "quiz" && (
            <Card className="mt-4 border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-green-800 flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-600" />
                      Quiz erfolgreich generiert
                    </CardTitle>
                    <p className="text-sm text-green-700">Das Quiz wurde zu deinen Aufgaben hinzugefügt.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-md border border-green-200 bg-white p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{generatedContent.content}</pre>
                </div>
                <Button 
                  onClick={handleNavigateToTasks}
                  variant="outline" 
                  className="w-full border-green-300 text-green-700 hover:bg-green-100"
                >
                  Zu meinen Aufgaben gehen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="summary" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Inhaltszusammenfassung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Lass dir eine KI-generierte Zusammenfassung deiner Kursunterlagen erstellen.</p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Wähle einen Kurs:</p>
                <select 
                  className="w-full border rounded p-2"
                  value={courseSelection}
                  onChange={(e) => setCourseSelection(e.target.value)}
                >
                  <option>Einführung in die Informatik</option>
                  <option>Datenbanksysteme</option>
                  <option>Machine Learning Grundlagen</option>
                  <option>Web-Entwicklung</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Modul auswählen:</p>
                <select 
                  className="w-full border rounded p-2"
                  value={moduleSelection}
                  onChange={(e) => setModuleSelection(e.target.value)}
                >
                  <option>Alle Module</option>
                  <option>Modul 1: Grundlagen</option>
                  <option>Modul 2: Fortgeschrittene Konzepte</option>
                  <option>Modul 3: Praxisprojekte</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Zusammenfassungsstil:</p>
                <select 
                  className="w-full border rounded p-2"
                  value={summaryStyle}
                  onChange={(e) => setSummaryStyle(e.target.value)}
                >
                  <option>Kurz und prägnant</option>
                  <option>Detailliert</option>
                  <option>Mit Beispielen</option>
                  <option>Prüfungsorientiert</option>
                </select>
              </div>
              <Button onClick={handleGenerateSummary} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Zusammenfassung wird generiert...
                  </>
                ) : (
                  "Zusammenfassung generieren"
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedContent && generatedContent.type === "summary" && (
            <Card className="mt-4 border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-green-800 flex items-center">
                      <Check className="mr-2 h-5 w-5 text-green-600" />
                      Zusammenfassung erfolgreich erstellt
                    </CardTitle>
                    <p className="text-sm text-green-700">Die Zusammenfassung wurde zu deinen Aufgaben hinzugefügt.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-md border border-green-200 bg-white p-4 max-h-64 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <pre className="text-sm whitespace-pre-wrap font-sans">{generatedContent.content}</pre>
                  </div>
                </div>
                <Button 
                  onClick={handleNavigateToTasks}
                  variant="outline" 
                  className="w-full border-green-300 text-green-700 hover:bg-green-100"
                >
                  Zu meinen Aufgaben gehen
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiTutor;
