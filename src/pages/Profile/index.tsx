
import { useEffect, useState } from "react";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("Ich bin Student und interessiere mich für Maschinelles Lernen und Programmierung.");
  const [birthDate, setBirthDate] = useState<Date | undefined>(new Date("1995-05-15"));
  const [avatarUrl, setAvatarUrl] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setName(userData.name);
      setAvatarUrl(userData.avatar || "");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleSaveChanges = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name,
      avatar: avatarUrl,
      // Add bio and birthDate to the user object
      bio,
      birthDate: birthDate ? birthDate.toISOString() : undefined,
    };

    // Save to localStorage
    localStorage.setItem("lms-user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    toast({
      title: "Profil aktualisiert",
      description: "Deine Profilinformationen wurden erfolgreich gespeichert.",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mein Profil</h1>
        <p className="text-muted-foreground">
          Verwalte deine persönlichen Informationen
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Persönliche Informationen</CardTitle>
            <CardDescription>
              Aktualisiere deine persönlichen Daten
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Dein vollständiger Name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Über mich</Label>
              <Textarea 
                id="bio" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Erzähle etwas über dich"
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdate">Geburtsdatum</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, "dd.MM.yyyy") : "Datum auswählen"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={birthDate}
                    onSelect={setBirthDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveChanges}>Änderungen speichern</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profilbild</CardTitle>
            <CardDescription>
              Füge ein Profilbild hinzu oder ändere es
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarUrl} alt={name} />
                <AvatarFallback className="text-3xl">{getInitials(name)}</AvatarFallback>
              </Avatar>

              <div className="space-y-2 w-full">
                <Label htmlFor="avatar">Profilbild URL</Label>
                <Input 
                  id="avatar" 
                  value={avatarUrl} 
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg" 
                />
                <p className="text-xs text-muted-foreground">
                  Gib die URL zu einem Bild ein oder lasse das Feld leer, um die Initialen zu verwenden.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveChanges}>Änderungen speichern</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
