
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentChat, ChatMessage } from "@/types";
import { User } from "lucide-react";

const StudentChatsPage = () => {
  const [studentChats, setStudentChats] = useState<StudentChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Load chats from localStorage
    const chatsJson = localStorage.getItem("lms-student-chats");
    if (chatsJson) {
      const chats = JSON.parse(chatsJson);
      setStudentChats(chats);
      if (chats.length > 0) {
        setSelectedChat(chats[0].id);
      }
    } else {
      // Create mock data if none exists
      const mockChats: StudentChat[] = [
        {
          id: "chat1",
          student_id: "student1",
          student_name: "Max Mustermann",
          messages: [
            {
              id: "msg1",
              sender: "student",
              content: "Hallo! Ich habe eine Frage zur letzten Vorlesung.",
              timestamp: "2023-05-10T10:30:00Z"
            },
            {
              id: "msg2",
              sender: "ai",
              content: "Hallo Max! Natürlich, wie kann ich dir helfen?",
              timestamp: "2023-05-10T10:31:00Z"
            }
          ]
        },
        {
          id: "chat2",
          student_id: "student2",
          student_name: "Anna Schmidt",
          messages: [
            {
              id: "msg3",
              sender: "student",
              content: "Kann mir jemand bei der Übungsaufgabe 3.2 helfen?",
              timestamp: "2023-05-11T14:20:00Z"
            },
            {
              id: "msg4",
              sender: "ai",
              content: "Hallo Anna! Ich schaue mir die Aufgabe an. Was genau verstehst du nicht?",
              timestamp: "2023-05-11T14:21:00Z"
            }
          ]
        }
      ];
      setStudentChats(mockChats);
      setSelectedChat(mockChats[0].id);
      localStorage.setItem("lms-student-chats", JSON.stringify(mockChats));
    }
  }, []);

  const getCurrentChat = () => {
    return studentChats.find(chat => chat.id === selectedChat);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "ai", // Lecturer responses are stored as "ai" in this demo
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedChats = studentChats.map(chat => {
      if (chat.id === selectedChat) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage]
        };
      }
      return chat;
    });

    setStudentChats(updatedChats);
    localStorage.setItem("lms-student-chats", JSON.stringify(updatedChats));
    setMessage("");
  };

  const currentChat = getCurrentChat();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Studentenchats</h1>
        <p className="text-muted-foreground">Sieh dir die Chat-Verläufe der Studenten an und antworte</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Student List */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Studenten</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="p-4 space-y-2">
                {studentChats.map(chat => (
                  <Button
                    key={chat.id}
                    variant={selectedChat === chat.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedChat(chat.id)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    {chat.student_name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="md:col-span-9">
          {currentChat ? (
            <>
              <CardHeader>
                <CardTitle>Chat mit {currentChat.student_name}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col h-[calc(100vh-320px)]">
                  <ScrollArea className="flex-grow p-4">
                    <div className="space-y-4">
                      {currentChat.messages.map(msg => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender === "student" ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              msg.sender === "student"
                                ? "bg-secondary text-secondary-foreground"
                                : "bg-primary text-primary-foreground"
                            }`}
                          >
                            <div className="mb-1">{msg.content}</div>
                            <div className="text-xs opacity-70">{formatTimestamp(msg.timestamp)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    <div className="flex space-x-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Schreibe eine Antwort..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                      />
                      <Button onClick={handleSendMessage}>Senden</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                Wähle einen Studenten aus, um den Chat anzuzeigen
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentChatsPage;
