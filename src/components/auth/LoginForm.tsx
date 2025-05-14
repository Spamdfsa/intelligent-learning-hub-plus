
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowRight } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real app, we would make an API call here
    setTimeout(() => {
      try {
        if (isSignUp) {
          // Create new user
          const newUser = {
            id: uuidv4(),
            email,
            name,
            role,
            courses: [],
            createdAt: new Date().toISOString()
          };
          
          localStorage.setItem("lms-user", JSON.stringify(newUser));
          toast({
            title: "Registrierung erfolgreich",
            description: "Dein Konto wurde erstellt. Du wirst jetzt eingeloggt.",
          });
        } else {
          // Mock login (in a real app, we would verify credentials)
          const mockUser = {
            id: uuidv4(),
            email,
            name: email.split("@")[0],
            role,
            courses: [],
            createdAt: new Date().toISOString()
          };
          
          localStorage.setItem("lms-user", JSON.stringify(mockUser));
          toast({
            title: "Anmeldung erfolgreich",
            description: "Du wurdest erfolgreich angemeldet.",
          });
        }
        
        navigate("/dashboard");
      } catch (error) {
        toast({
          title: "Fehler",
          description: "Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">
          {isSignUp ? "Registrieren" : "Anmelden"}
        </CardTitle>
        <CardDescription>
          {isSignUp
            ? "Erstelle ein neues Konto für die Lernplattform"
            : "Melde dich mit deinen Zugangsdaten an"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              placeholder="deine.email@beispiel.de"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Dein Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Rolle</Label>
            <RadioGroup 
              defaultValue="student" 
              value={role}
              onValueChange={(value) => setRole(value as UserRole)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="student" id="student" />
                <Label htmlFor="student" className="font-normal">Student</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lecturer" id="lecturer" />
                <Label htmlFor="lecturer" className="font-normal">Dozent</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              "Wird verarbeitet..."
            ) : isSignUp ? (
              "Registrieren"
            ) : (
              "Anmelden"
            )}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          {isSignUp ? (
            <p>
              Bereits registriert?{" "}
              <button
                type="button"
                className="underline text-primary font-medium"
                onClick={() => setIsSignUp(false)}
              >
                Anmelden
              </button>
            </p>
          ) : (
            <p>
              Noch kein Konto?{" "}
              <button
                type="button"
                className="underline text-primary font-medium"
                onClick={() => setIsSignUp(true)}
              >
                Registrieren
              </button>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
