
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/types";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would be an API call
      // Simulating login with mock data for demo
      setTimeout(() => {
        // Mock login logic
        if (email && password) {
          let userRole = role;
          
          if (email.includes('admin')) {
            userRole = 'admin';
          } else if (email.includes('lecturer')) {
            userRole = 'lecturer';
          } else if (email.includes('teacher')) {
            userRole = 'teacher';
          }
          
          // Store the user info in local storage for our mock authentication
          localStorage.setItem('lms-user', JSON.stringify({
            id: '1',
            name: email.split('@')[0],
            email,
            role: userRole,
            avatar: null
          }));
          
          toast({
            title: "Login erfolgreich",
            description: `Willkommen zurück, ${email.split('@')[0]}!`,
          });
          
          navigate('/dashboard');
        } else {
          toast({
            title: "Login fehlgeschlagen",
            description: "Bitte überprüfe deine Login-Daten.",
            variant: "destructive",
          });
        }
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Login fehlgeschlagen",
        description: "Ein Fehler ist aufgetreten. Bitte versuche es später erneut.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Anmeldung</CardTitle>
        <CardDescription>
          Melde dich mit deinen Zugangsdaten an, um fortzufahren.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Passwort</Label>
              <a href="#" className="text-sm text-primary hover:underline">
                Passwort vergessen?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rolle</Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Rolle auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Lehrkraft</SelectItem>
                <SelectItem value="lecturer">Dozent</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Anmeldung..." : "Anmelden"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Wähle eine Rolle und gib beliebige Anmeldedaten ein, um fortzufahren.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
