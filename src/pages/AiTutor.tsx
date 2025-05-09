import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessage } from "@/types";
import { Send, Bot, Loader2, Check, ArrowRight, Key, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [showUserDataDialog, setShowUserDataDialog] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load all user data for the AI to use
  useEffect(() => {
    const loadUserData = () => {
      try {
        // Load user data from localStorage
        const userData = {
          profile: JSON.parse(localStorage.getItem("lms-user") || "{}"),
          tasks: JSON.parse(localStorage.getItem("lms-tasks") || "[]"),
          summaries: JSON.parse(localStorage.getItem("lms-summaries") || "[]"),
          userInput: JSON.parse(localStorage.getItem("lms-user-data") || "{}")
        };
        
        setUserData(userData);
        
        // Update welcome message to personalize if user exists
        if (userData.profile && userData.profile.name) {
          setMessages([{
            id: "welcome",
            content: `Hallo ${userData.profile.name}! Ich bin dein KI-Tutor. Wie kann ich dir heute bei deinem Lernen helfen?`,
            role: "assistant",
            timestamp: new Date(),
          }]);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };
    
    loadUserData();
  }, []);

  useEffect(() => {
    // Check if API key is stored in localStorage
    const storedApiKey = localStorage.getItem("openai-api-key");
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Show dialog to enter API key if not found
      setShowApiKeyDialog(true);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("openai-api-key", apiKey.trim());
      setShowApiKeyDialog(false);
      toast({
        title: "API-Schlüssel gespeichert",
        description: "Der OpenAI API-Schlüssel wurde erfolgreich gespeichert.",
      });
    } else {
      toast({
        title: "Fehler",
        description: "Bitte gib einen gültigen API-Schlüssel ein.",
        variant: "destructive",
      });
    }
  };

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
      if (!apiKey) {
        setShowApiKeyDialog(true);
        throw new Error("API-Schlüssel fehlt");
      }

      // Call OpenAI API with enhanced context about the user data
      const systemPrompt = `
Du bist ein hilfreicher KI-Tutor, der Studierende in ihrem Lernprozess unterstützt. 
Antworte kurz, informativ und freundlich auf Deutsch.

${userData ? `
Hier sind die verfügbaren Informationen über den Nutzer:
- Name: ${userData.profile.name || 'Unbekannt'}
- Kurse: ${userData.profile.courses?.join(', ') || 'Keine Kursinformationen verfügbar'}
- Offene Aufgaben: ${userData.tasks?.length || 0}
- Erstellte Zusammenfassungen: ${userData.summaries?.length || 0}

Die neuesten Aufgaben sind:
${userData.tasks?.slice(0, 3).map((t: any) => `- ${t.title}`).join('\n') || 'Keine Aufgaben'}

Die neuesten Zusammenfassungen sind:
${userData.summaries?.slice(0, 3).map((s: any) => `- ${s.title}`).join('\n') || 'Keine Zusammenfassungen'}
`: ''}

Nutze diese Informationen, um personalisierte Hilfe zu geben. Wenn Informationen fehlen oder zu alt erscheinen, frage nach einer Aktualisierung.
      `;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: input
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Fehler bei der Kommunikation mit OpenAI");
      }

      const result = await response.json();
      const aiResponse = result.choices[0]?.message?.content || "Es tut mir leid, ich konnte keine Antwort generieren.";
      
      const aiMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("ChatGPT API Error:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Es gab ein Problem bei der Kommunikation mit dem KI-Tutor.",
        variant: "destructive",
      });

      // Fallback to simulated response if API fails
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
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    
    try {
      if (!apiKey) {
        setShowApiKeyDialog(true);
        throw new Error("API-Schlüssel fehlt");
      }

      // Call OpenAI API to generate quiz
      const prompt = `Erstelle ein Quiz zum Thema "${courseSelection}" mit ${questionCount} Fragen im Schwierigkeitsgrad "${difficulty}". Formatiere die Ausgabe so, dass jede Frage deutlich nummeriert ist.`;
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Du bist ein Bildungsexperte, der hochwertige Lernmaterialien erstellt. Erstelle ein Quiz im angegebenen Format."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Fehler bei der Kommunikation mit OpenAI");
      }

      const result = await response.json();
      const quizContent = result.choices[0]?.message?.content || "Es konnten keine Quiz-Fragen generiert werden.";
      
      const quizId = uuidv4();
      setGeneratedContent({
        id: quizId,
        title: `Quiz: ${courseSelection}`,
        content: quizContent,
        timestamp: new Date(),
        type: "quiz"
      });

      saveToTasks({
        id: quizId,
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
    } catch (error) {
      console.error("OpenAI API Error:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Es gab ein Problem bei der Generierung des Quiz.",
        variant: "destructive",
      });
      
      // Fallback to mock quiz if API fails
      const mockQuizContent = generateMockQuiz(courseSelection, parseInt(questionCount), difficulty);
      setGeneratedContent({
        id: uuidv4(),
        title: `Quiz: ${courseSelection}`,
        content: mockQuizContent,
        timestamp: new Date(),
        type: "quiz"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    
    try {
      if (!apiKey) {
        setShowApiKeyDialog(true);
        throw new Error("API-Schlüssel fehlt");
      }

      // Call OpenAI API to generate summary
      const prompt = `Erstelle eine ${summaryStyle} Zusammenfassung zum Thema "${courseSelection}" ${moduleSelection !== "Alle Module" ? `für das ${moduleSelection}` : ""}.`;
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "Du bist ein Bildungsexperte, der präzise und verständliche Zusammenfassungen erstellt. Formatiere die Ausgabe mit Markdown für bessere Lesbarkeit."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Fehler bei der Kommunikation mit OpenAI");
      }

      const result = await response.json();
      const summaryContent = result.choices[0]?.message?.content || "Es konnte keine Zusammenfassung generiert werden.";
      
      const summaryId = uuidv4();
      const summary = {
        id: summaryId,
        title: `Zusammenfassung: ${courseSelection} - ${moduleSelection}`,
        content: summaryContent,
        course: courseSelection,
        module: moduleSelection,
        createdAt: new Date()
      };
      
      // Save to summaries collection in localStorage
      const storedSummaries = localStorage.getItem("lms-summaries");
      const summaries = storedSummaries ? JSON.parse(storedSummaries) : [];
      summaries.push(summary);
      localStorage.setItem("lms-summaries", JSON.stringify(summaries));
      
      setGeneratedContent({
        id: summaryId,
        title: `Zusammenfassung: ${courseSelection} - ${moduleSelection}`,
        content: summaryContent,
        timestamp: new Date(),
        type: "summary"
      });
      
      toast({
        title: "Zusammenfassung generiert",
        description: "Eine Zusammenfassung deiner Kursunterlagen wurde erstellt und kann in der Zusammenfassungen-Sektion angesehen werden.",
      });
    } catch (error) {
      console.error("OpenAI API Error:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Es gab ein Problem bei der Generierung der Zusammenfassung.",
        variant: "destructive",
      });
      
      // Fallback to mock summary if API fails
      const mockSummaryContent = generateMockSummary(courseSelection, moduleSelection, summaryStyle);
      setGeneratedContent({
        id: uuidv4(),
        title: `Zusammenfassung: ${courseSelection} - ${moduleSelection}`,
        content: mockSummaryContent,
        timestamp: new Date(),
        type: "summary"
      });
    } finally {
      setIsLoading(false);
    }
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
  
  const handleNavigateToSummaries = () => {
    navigate("/summaries");
  };

  const handleNavigateToTasks = () => {
    navigate("/tasks");
  };

  const toggleUserDataDialog = () => {
    setShowUserDataDialog(!showUserDataDialog);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">KI-Tutor</h1>
        <Button variant="outline" size="sm" onClick={toggleUserDataDialog}>
          <Database className="h-4 w-4 mr-2" />
          Nutzerdaten-Status
        </Button>
      </div>
      
      <p className="text-muted-foreground">
        Stell Fragen zu deinen Kursinhalten, generiere Quizfragen oder lass dir bei Aufgaben helfen.
      </p>

      {/* User Data Status Dialog */}
      <Dialog open={showUserDataDialog} onOpenChange={setShowUserDataDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gespeicherte Nutzerdaten</DialogTitle>
            <DialogDescription>
              Diese Daten werden lokal in deinem Browser gespeichert und dem KI-Tutor zur Verfügung gestellt.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
            {userData ? (
              <>
                <div>
                  <h3 className="font-medium mb-1">Profil:</h3>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(userData.profile, null, 2)}
                  </pre>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Aufgaben ({userData.tasks?.length || 0}):</h3>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(userData.tasks?.slice(0, 3), null, 2)}
                    {userData.tasks?.length > 3 ? `\n... und ${userData.tasks.length - 3} weitere` : ""}
                  </pre>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Zusammenfassungen ({userData.summaries?.length || 0}):</h3>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(userData.summaries?.slice(0, 3), null, 2)}
                    {userData.summaries?.length > 3 ? `\n... und ${userData.summaries.length - 3} weitere` : ""}
                  </pre>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Gespeicherte Eingaben:</h3>
                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(userData.userInput, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <p>Keine Daten gefunden.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>OpenAI API-Schlüssel eingeben</DialogTitle>
            <DialogDescription>
              Um den KI-Tutor zu nutzen, benötigen wir deinen OpenAI API-Schlüssel. Der Schlüssel wird lokal in deinem Browser gespeichert.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                storeData={true}
                dataKey="openai-api-key"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Deinen API-Schlüssel findest du in deinem OpenAI-Konto unter <a href="https://platform.openai.com/account/api-keys" target="_blank" rel="noopener noreferrer" className="underline">platform.openai.com/account/api-keys</a>.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveApiKey}>
              Speichern und fortfahren
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Tabs */}
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
                      storeData={true}
                      dataKey="chat-last-message"
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
                  className="w-full border rounded p-2 dark:bg-secondary/80 dark:border-secondary dark:text-foreground"
                  value={courseSelection}
                  onChange={(e) => setCourseSelection(e.target.value)}
                  data-key="quiz-course"
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
                  className="w-full border rounded p-2 dark:bg-secondary/80 dark:border-secondary dark:text-foreground"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  data-key="quiz-count"
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
                  className="w-full border rounded p-2 dark:bg-secondary/80 dark:border-secondary dark:text-foreground"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  data-key="quiz-difficulty"
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
                  className="w-full border rounded p-2 dark:bg-secondary/80 dark:border-secondary dark:text-foreground"
                  value={courseSelection}
                  onChange={(e) => setCourseSelection(e.target.value)}
                  data-key="summary-course"
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
                  className="w-full border rounded p-2 dark:bg-secondary/80 dark:border-secondary dark:text-foreground"
                  value={moduleSelection}
                  onChange={(e) => setModuleSelection(e.target.value)}
                  data-key="summary-module"
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
                  className="w-full border rounded p-2 dark:bg-secondary/80 dark:border-secondary dark:text-foreground"
                  value={summaryStyle}
                  onChange={(e) => setSummaryStyle(e.target.value)}
                  data-key="summary-style"
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
                    <p className="text-sm text-green-700">Die Zusammenfassung wurde zu deinen Zusammenfassungen hinzugefügt.</p>
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
                  onClick={handleNavigateToSummaries}
                  variant="outline" 
                  className="w-full border-green-300 text-green-700 hover:bg-green-100"
                >
                  Zu meinen Zusammenfassungen gehen
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
