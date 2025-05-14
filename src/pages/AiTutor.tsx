import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessage, QuizQuestion } from "@/types";
import { Send, Bot, Loader2, Check, ArrowRight, Key, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface GeneratedContent {
  id: string;
  title: string;
  type: "quiz" | "summary";
}

const AiTutor = () => {
  // ... keep existing code (message state, input state, loading state, etc.)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "Hallo! Ich bin dein KI-Tutor. Wie kann ich dir heute bei deinem Lernen helfen?",
      role: "assistant",
      sender: "ai",
      timestamp: new Date().toISOString(),
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

  // ... keep existing code (user data loading)
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
            sender: "ai",
            timestamp: new Date().toISOString(),
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

  // ... keep existing code (API key handling, send message function)
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
      sender: "student",
      timestamp: new Date().toISOString(),
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
        sender: "ai",
        timestamp: new Date().toISOString(),
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
          sender: "ai",
          timestamp: new Date().toISOString(),
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

      // Call OpenAI API to generate quiz with improved structure
      const prompt = `Erstelle ein interaktives Quiz zum Thema "${courseSelection}" mit ${questionCount} Fragen im Schwierigkeitsgrad "${difficulty}".
      
Erstelle einen Mix aus:
1. Multiple-Choice-Fragen (mit 3-4 Optionen)
2. Freitext-Fragen (mit erwarteter Antwort)
3. Wahr/Falsch-Fragen
      
Formatiere das Quiz als JSON-Array mit folgender Struktur:
[
  {
    "question": "Frage 1?", 
    "answerType": "multiple-choice",
    "options": ["Option A", "Option B", "Option C", "Option D"], 
    "correctOption": 0
  },
  {
    "question": "Frage 2 (Freitext)?",
    "answerType": "text",
    "correctAnswer": "Erwartete Antwort"
  },
  {
    "question": "Frage 3 (Wahr/Falsch): Aussage X ist korrekt.",
    "answerType": "true-false",
    "correctAnswer": "true"
  }
]

Bei Multiple-Choice ist "correctOption" der Index (beginnend mit 0) der korrekten Antwort im options-Array.
Bei Freitext-Fragen ist "correctAnswer" die erwartete Antwort (kurz und prägnant).
Bei Wahr/Falsch ist "correctAnswer" entweder "true" oder "false".

Formuliere die Fragen themenspezifisch, herausfordernd und so, dass sie wirklich das Verständnis prüfen.`;
      
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
              content: "Du bist ein Bildungsexperte, der hochwertige Lernmaterialien erstellt. Erstelle ein Quiz im angegebenen Format. Achte darauf, dass die JSON-Struktur korrekt ist und dass die Fragen eine Mischung aus verschiedenen Fragetypen enthalten."
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
      const quizContent = result.choices[0]?.message?.content || "Es konnten keine Quiz-Fragen generiert werden.";
      
      let parsedQuiz;
      let questions: QuizQuestion[] = [];
      let formattedDescription = '';

      try {
        // Try to extract JSON from the response
        const jsonMatch = quizContent.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedQuiz = JSON.parse(jsonMatch[0]);
          
          // Format questions for display in the task description
          formattedDescription = `# Quiz: ${courseSelection}\n\n**Schwierigkeitsgrad:** ${difficulty}\n\n`;
          parsedQuiz.forEach((q: any, idx: number) => {
            formattedDescription += `### Frage ${idx + 1}:\n${q.question}\n\n`;
            
            if (q.answerType === 'multiple-choice' && q.options) {
              q.options.forEach((opt: string, optIdx: number) => {
                formattedDescription += `- ${opt}\n`;
              });
              formattedDescription += '\n';
            }
          });
          
          // Create questions array for the task
          questions = parsedQuiz.map((q: any, idx: number) => ({
            id: `q-${Date.now()}-${idx}`,
            question: q.question,
            answerType: q.answerType,
            options: q.options,
            correctOption: q.correctOption,
            correctAnswer: q.correctAnswer
          }));
        } else {
          // Fallback if JSON parsing fails
          formattedDescription = quizContent;
        }
      } catch (error) {
        console.error("Failed to parse quiz JSON:", error);
        formattedDescription = quizContent;
      }
      
      const quizId = uuidv4();
      
      // Set minimal generated content state - just show success message, not the quiz content
      setGeneratedContent({
        id: quizId,
        title: `Quiz: ${courseSelection}`,
        type: "quiz"
      });

      // Save to tasks
      saveToTasks({
        id: quizId,
        title: `Quiz: ${courseSelection}`,
        description: formattedDescription,
        course: courseSelection,
        dueDate: getRandomDueDate(),
        status: "pending",
        type: "quiz",
        createdAt: new Date(),
        generatedBy: "ai",
        questions: questions
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
      
      // Don't use fallback to mock quiz if API fails
      if (!apiKey) {
        toast({
          title: "API-Schlüssel erforderlich",
          description: "Bitte füge einen OpenAI API-Schlüssel hinzu, um KI-generierte Quizze zu erstellen.",
        });
      }
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

      // Call OpenAI API to generate summary with improved markdown formatting
      const prompt = `Erstelle eine ${summaryStyle} Zusammenfassung zum Thema "${courseSelection}" ${moduleSelection !== "Alle Module" ? `für das ${moduleSelection}` : ""}.
      
Bitte verwende Markdown-Formatierung für bessere Lesbarkeit:
- Verwende # für Hauptüberschriften
- Verwende ## für Unterüberschriften
- Verwende Listen mit - oder 1. für nummerierte Listen
- Verwende **Text** für Fettschrift bei wichtigen Begriffen
- Füge Beispiele und Erläuterungen ein, wo sinnvoll
- Strukturiere die Zusammenfassung logisch mit Abschnitten

Die Zusammenfassung soll gut strukturiert und leicht verständlich sein, mit klaren Abschnitten und hervorgehobenen Schlüsselkonzepten.`;
      
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
              content: "Du bist ein Bildungsexperte, der präzise und verständliche Zusammenfassungen erstellt. Formatiere die Ausgabe mit Markdown für bessere Lesbarkeit und strukturiere die Inhalte sinnvoll."
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
        title: `Zusammenfassung: ${courseSelection}`,
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
      
      // Don't use fallback to mock summary if API fails
      if (!apiKey) {
        toast({
          title: "API-Schlüssel erforderlich",
          description: "Bitte füge einen OpenAI API-Schlüssel hinzu, um KI-generierte Zusammenfassungen zu erstellen.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ... keep existing code (utility functions)
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
  
  const generateMockQuiz = (course: string, count: number, difficulty: string) => {
    const quizQuestions = [
      { 
        question: "Was sind die Hauptkomponenten eines Von-Neumann-Rechners?", 
        answerType: "multiple-choice",
        options: [
          "Prozessor, Speicher, Ein-/Ausgabegeräte und Bus-System",
          "Motherboard, CPU und Grafikkarte",
          "Festplatte, RAM und Monitor",
          "Tastatur, Maus und Bildschirm"
        ],
        correctOption: 0 
      },
      { 
        question: "Erläutere kurz, was ein Betriebssystem ist und welche Hauptfunktion es erfüllt.", 
        answerType: "text",
        correctAnswer: "Ein Betriebssystem ist die Software, die die Hardware eines Computers verwaltet und grundlegende Dienste für Anwendungsprogramme bereitstellt."
      },
      { 
        question: "Aussage: Der Cache-Speicher ist langsamer als der Hauptspeicher (RAM).", 
        answerType: "true-false",
        correctAnswer: "false"
      },
      { 
        question: "Wie funktioniert das HTTP-Protokoll?", 
        answerType: "multiple-choice",
        options: [
          "Es ist ein Protokoll zur Verschlüsselung von Daten",
          "Es ist ein zustandsloses Protokoll für Client-Server-Kommunikation im Web",
          "Es ist ein Protokoll für Peer-to-Peer-Netzwerke",
          "Es ist ein Protokoll zur Ausführung von Skripten auf entfernten Servern"
        ],
        correctOption: 1 
      },
      { 
        question: "Erkläre in einem Satz, was ein Algorithmus ist.", 
        answerType: "text",
        correctAnswer: "Ein Algorithmus ist eine eindeutige, schrittweise Anleitung zur Lösung eines Problems oder einer Aufgabe."
      },
      { 
        question: "Aussage: Python ist eine kompilierte Programmiersprache.", 
        answerType: "true-false",
        correctAnswer: "false"
      },
      { 
        question: "Was ist der Unterschied zwischen Stack und Heap?", 
        answerType: "multiple-choice",
        options: [
          "Stack ist für lokale Variablen, Heap für dynamisch allozierte Objekte",
          "Stack ist für Klassendefinitionen, Heap für Instanzvariablen",
          "Stack ist für Bilder, Heap für Textdaten",
          "Es gibt keinen Unterschied, beide sind Synonyme"
        ],
        correctOption: 0 
      },
      { 
        question: "Definiere den Begriff 'Polymorphismus' in der objektorientierten Programmierung.", 
        answerType: "text",
        correctAnswer: "Polymorphismus beschreibt die Fähigkeit eines Objekts, in verschiedenen Formen aufzutreten und unterschiedliches Verhalten zu zeigen, abhängig vom Kontext, in dem es verwendet wird."
      },
      { 
        question: "Aussage: SQL ist eine prozedurale Programmiersprache.", 
        answerType: "true-false",
        correctAnswer: "false"
      },
      { 
        question: "Was sind die ACID-Eigenschaften in Datenbanktransaktionen?", 
        answerType: "multiple-choice",
        options: [
          "Asynchronität, Klarheit, Integration und Datensicherheit",
          "Atomarität, Konsistenz, Isolation und Dauerhaftigkeit",
          "Abstraktion, Kapselung, Vererbung und Polymorphismus",
          "Adaptivität, Komplexität, Innovation und Design"
        ],
        correctOption: 1 
      }
    ];
    
    // Select random questions based on count
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
    
    // Format questions for display in the quiz task
    let formattedDescription = `# Quiz: ${course}\n\n**Schwierigkeitsgrad:** ${difficulty}\n\n`;
    
    selectedQuestions.forEach((q, idx) => {
      formattedDescription += `### Frage ${idx + 1}:\n${q.question}\n\n`;
      
      if (q.answerType === 'multiple-choice' && q.options) {
        q.options.forEach((opt: string) => {
          formattedDescription += `- ${opt}\n`;
        });
        formattedDescription += '\n';
      }
    });
    
    // Create the questions array for the task
    const questions = selectedQuestions.map((q, idx) => ({
      id: `q-${Date.now()}-${idx}`,
      question: q.question,
      answerType: q.answerType,
      options: q.options,
      correctOption: q.correctOption,
      correctAnswer: q.correctAnswer
    }));
    
    return {
      formattedDescription,
      questions
    };
  };
  
  const generateMockSummary = (course: string, module: string, style: string): string => {
    // ... keep existing code (mock summary generation)
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

  // Available courses for selection
  const availableCourses = [
    "Einführung in die Informatik",
    "Programmierung mit Python",
    "Datenstrukturen und Algorithmen",
    "Webtechnologien",
    "Künstliche Intelligenz",
    "Datenbanksysteme",
    "Machine Learning"
  ];

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
                        className={`rounded-lg p-4 max-w-[80%] ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        {message.role !== "user" && (
                          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                            <Bot className="h-4 w-4" />
                            <span>KI-Tutor</span>
                          </div>
                        )}
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="rounded-lg p-4 bg-muted flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>KI-Tutor denkt nach...</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t p-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Stelle eine Frage zum Kursinhalt..."
                      className="min-h-12 flex-grow resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (input.trim()) handleSendMessage(e);
                        }
                      }}
                    />
                    <Button type="submit" disabled={!input.trim() || isLoading}>
                      <Send className="h-4 w-4" />
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
              <CardTitle>Quiz generieren</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course-selection">Kurs auswählen</Label>
                  <Select
                    value={courseSelection}
                    onValueChange={setCourseSelection}
                  >
                    <SelectTrigger id="course-selection" className="w-full">
                      <SelectValue placeholder="Kurs auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="question-count">Anzahl der Fragen</Label>
                  <Select
                    value={questionCount}
                    onValueChange={setQuestionCount}
                  >
                    <SelectTrigger id="question-count">
                      <SelectValue placeholder="Anzahl der Fragen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 Fragen</SelectItem>
                      <SelectItem value="5">5 Fragen</SelectItem>
                      <SelectItem value="10">10 Fragen</SelectItem>
                      <SelectItem value="15">15 Fragen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Schwierigkeitsgrad</Label>
                  <Select
                    value={difficulty}
                    onValueChange={setDifficulty}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Schwierigkeitsgrad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leicht">Leicht</SelectItem>
                      <SelectItem value="Mittel">Mittel</SelectItem>
                      <SelectItem value="Schwer">Schwer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {generatedContent && generatedContent.type === "quiz" ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-green-50 p-4 dark:bg-green-900">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="ml-2 text-green-700 dark:text-green-300">
                        Quiz wurde generiert und zu deinen Aufgaben hinzugefügt
                      </span>
                    </div>
                  </div>
                  <Button onClick={handleNavigateToTasks} className="w-full">
                    Zu meinen Aufgaben gehen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleGenerateQuiz}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Quiz wird generiert...
                    </>
                  ) : (
                    "Quiz generieren"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="summary" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Zusammenfassung generieren</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="summary-course">Kurs auswählen</Label>
                  <Select
                    value={courseSelection}
                    onValueChange={setCourseSelection}
                  >
                    <SelectTrigger id="summary-course">
                      <SelectValue placeholder="Kurs auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCourses.map((course) => (
                        <SelectItem key={course} value={course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="module-selection">Modul</Label>
                  <Select
                    value={moduleSelection}
                    onValueChange={setModuleSelection}
                  >
                    <SelectTrigger id="module-selection">
                      <SelectValue placeholder="Modul auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alle Module">Alle Module</SelectItem>
                      <SelectItem value="Modul 1">Modul 1</SelectItem>
                      <SelectItem value="Modul 2">Modul 2</SelectItem>
                      <SelectItem value="Modul 3">Modul 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="summary-style">Art der Zusammenfassung</Label>
                  <Select
                    value={summaryStyle}
                    onValueChange={setSummaryStyle}
                  >
                    <SelectTrigger id="summary-style">
                      <SelectValue placeholder="Art der Zusammenfassung" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kurz und prägnant">Kurz und prägnant</SelectItem>
                      <SelectItem value="Ausführlich mit Beispielen">Ausführlich mit Beispielen</SelectItem>
                      <SelectItem value="Fokus auf Definitionen">Fokus auf Definitionen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {generatedContent && generatedContent.type === "summary" ? (
                <div className="space-y-4">
                  <div className="rounded-md bg-green-50 p-4 dark:bg-green-900">
                    <div className="flex items-center">
                      <Check className="h-5 w-5 text-green-500" />
                      <span className="ml-2 text-green-700 dark:text-green-300">
                        Zusammenfassung wurde generiert und gespeichert
                      </span>
                    </div>
                  </div>
                  <Button onClick={handleNavigateToSummaries} className="w-full">
                    Zu meinen Zusammenfassungen gehen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleGenerateSummary}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Zusammenfassung wird generiert...
                    </>
                  ) : (
                    "Zusammenfassung generieren"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiTutor;
