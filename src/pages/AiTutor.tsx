
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatMessage } from "@/types";
import { Send, Bot, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { toast } = useToast();

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
      // In a real app, this would be an API call to your AI service
      // Simulating AI response for demo
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
    
    // Simulate quiz generation
    setTimeout(() => {
      toast({
        title: "Quiz generiert",
        description: "Ein neues Quiz wurde basierend auf deinen Kursinhalten erstellt.",
      });
      setIsLoading(false);
    }, 2000);
  };

  const handleGenerateSummary = () => {
    setIsLoading(true);
    
    // Simulate summary generation
    setTimeout(() => {
      toast({
        title: "Zusammenfassung generiert",
        description: "Eine Zusammenfassung deiner Kursunterlagen wurde erstellt.",
      });
      setIsLoading(false);
    }, 2000);
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
                <select className="w-full border rounded p-2">
                  <option>Einführung in die Informatik</option>
                  <option>Datenbanksysteme</option>
                  <option>Machine Learning Grundlagen</option>
                  <option>Web-Entwicklung</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Anzahl der Fragen:</p>
                <select className="w-full border rounded p-2">
                  <option>5</option>
                  <option>10</option>
                  <option>15</option>
                  <option>20</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Schwierigkeitsgrad:</p>
                <select className="w-full border rounded p-2">
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
                <select className="w-full border rounded p-2">
                  <option>Einführung in die Informatik</option>
                  <option>Datenbanksysteme</option>
                  <option>Machine Learning Grundlagen</option>
                  <option>Web-Entwicklung</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Modul auswählen:</p>
                <select className="w-full border rounded p-2">
                  <option>Alle Module</option>
                  <option>Modul 1: Grundlagen</option>
                  <option>Modul 2: Fortgeschrittene Konzepte</option>
                  <option>Modul 3: Praxisprojekte</option>
                </select>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Zusammenfassungsstil:</p>
                <select className="w-full border rounded p-2">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AiTutor;
