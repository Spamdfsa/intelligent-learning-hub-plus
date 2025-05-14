import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from 'uuid';
import { User, StudentChat, ChatMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

const StudentChatsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [studentChats, setStudentChats] = useState<StudentChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<StudentChat | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Mock student chats data
    const mockStudentChats: StudentChat[] = [
      {
        id: "chat1",
        student_id: "student1",
        student_name: "Max Mustermann",
        messages: [
          {
            id: uuidv4(),
            sender: "student",
            content: "Hallo, ich habe eine Frage zur Aufgabe 1.",
            timestamp: new Date().toISOString(),
            role: "user", // Added missing role property
          },
          {
            id: uuidv4(),
            sender: "ai",
            content: "Hallo Max, natürlich! Was ist deine Frage?",
            timestamp: new Date().toISOString(),
            role: "assistant", // Added missing role property
          },
        ],
      },
      {
        id: "chat2",
        student_id: "student2",
        student_name: "Anna Schmidt",
        messages: [
          {
            id: uuidv4(),
            sender: "student",
            content: "Ich verstehe das Konzept von Polymorphismus nicht ganz.",
            timestamp: new Date().toISOString(),
            role: "user", // Added missing role property
          },
          {
            id: uuidv4(),
            sender: "ai",
            content: "Kein Problem, Anna! Polymorphismus bedeutet, dass ein Objekt viele Formen annehmen kann.",
            timestamp: new Date().toISOString(),
            role: "assistant", // Added missing role property
          },
        ],
      },
    ];

    setStudentChats(mockStudentChats);
    setSelectedChat(mockStudentChats[0]); // Select the first chat by default
  }, []);

  useEffect(() => {
    // Scroll to bottom when a new message is added
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
  
    const newMsg: ChatMessage = {
      id: uuidv4(),
      sender: "student",
      content: newMessage,
      timestamp: new Date().toISOString(),
      role: "user", // Added missing role property
    };
  
    // Update the selected chat with the new message
    setSelectedChat(prevChat => {
      if (prevChat) {
        const updatedMessages = [...prevChat.messages, newMsg];
        // Update the studentChats state as well
        setStudentChats(prevChats =>
          prevChats.map(chat =>
            chat.id === prevChat.id ? { ...chat, messages: updatedMessages } : chat
          )
        );
        return { ...prevChat, messages: updatedMessages };
      }
      return prevChat;
    });
  
    setNewMessage("");
  
    // Simulate AI response after a short delay
    setTimeout(() => {
      handleAiResponse(newMessage);
    }, 500);
  };

  const handleAiResponse = async (userMessage: string) => {
    // Basic AI response logic (can be replaced with actual API call)
    const aiResponse = `KI Antwort: Ich habe deine Nachricht erhalten: "${userMessage}".`;
  
    const responseMessage: ChatMessage = {
      id: uuidv4(),
      sender: "ai",
      content: aiResponse,
      timestamp: new Date().toISOString(),
      role: "assistant", // Added missing role property
    };
  
    setSelectedChat(prevChat => {
      if (prevChat) {
        const updatedMessages = [...prevChat.messages, responseMessage];
        // Update the studentChats state as well
        setStudentChats(prevChats =>
          prevChats.map(chat =>
            chat.id === prevChat.id ? { ...chat, messages: updatedMessages } : chat
          )
        );
        return { ...prevChat, messages: updatedMessages };
      }
      return prevChat;
    });
  };

  const handleChatSelect = (chat: StudentChat) => {
    setSelectedChat(chat);
  };

  return (
    <div className="flex h-full">
      {/* Chat List */}
      <div className="w-1/4 border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Studenten Chats</h2>
        <ScrollArea className="rounded-md border h-[calc(100vh-150px)]">
          <div className="space-y-2">
            {studentChats.map((chat) => (
              <Card
                key={chat.id}
                className={`cursor-pointer ${selectedChat?.id === chat.id ? "bg-secondary" : ""}`}
                onClick={() => handleChatSelect(chat)}
              >
                <CardContent className="flex items-center space-x-4 p-3">
                  <Avatar>
                    <AvatarImage src={`https://avatar.vercel.sh/${chat.student_name}.png`} />
                    <AvatarFallback>{chat.student_name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <span>{chat.student_name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      {selectedChat ? (
        <div className="w-3/4 p-4 flex flex-col">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>{selectedChat.student_name}</CardTitle>
            </CardHeader>
            <CardContent className="relative h-[calc(100vh-250px)]">
              <ScrollArea className="rounded-md h-[calc(100vh-250px)]">
                <div className="space-y-4 p-4">
                  {selectedChat.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "student" ? "items-end" : "items-start"
                        }`}
                    >
                      <div
                        className={`rounded-lg p-2 max-w-sm ${msg.sender === "student" ? "bg-primary text-primary-foreground" : "bg-secondary"
                          }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(msg.timestamp), "dd.MM.yyyy HH:mm")}
                      </span>
                    </div>
                  ))}
                  <div ref={chatBottomRef} /> {/* Scroll anchor */}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  placeholder="Nachricht eingeben..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage}>Senden</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <div className="w-3/4 flex items-center justify-center">
          <p className="text-muted-foreground">Wähle einen Chat aus, um die Konversation anzuzeigen.</p>
        </div>
      )}
    </div>
  );
};

export default StudentChatsPage;
