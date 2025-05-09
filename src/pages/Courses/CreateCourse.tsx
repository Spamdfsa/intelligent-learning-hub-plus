
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { v4 as uuidv4 } from "uuid";

const CreateCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get user info
      const userJson = localStorage.getItem("lms-user");
      if (!userJson) {
        toast({
          title: "Fehler",
          description: "Du musst angemeldet sein, um einen Kurs zu erstellen.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(userJson);
      
      // Create new course
      const newCourse = {
        id: uuidv4(),
        title,
        description,
        instructor: user.name,
        instructor_id: user.id,
        instructorId: user.id, // Adding both versions for compatibility
        level,
        progress: 0,
        enrolled: 0,
        enrolledStudents: 0, // Adding both versions for compatibility
        image: "/placeholder.svg",
        created_at: new Date().toISOString(),
        bannerColor: "blue", // Default banner color
        category: "Other", // Default category
        duration: "Self-paced", // Default duration
        modules: [] // Empty modules array
      };
      
      // Store course in localStorage
      const existingCoursesJson = localStorage.getItem("lms-courses");
      const existingCourses = existingCoursesJson ? JSON.parse(existingCoursesJson) : [];
      existingCourses.push(newCourse);
      localStorage.setItem("lms-courses", JSON.stringify(existingCourses));
      
      toast({
        title: "Kurs erstellt",
        description: "Dein Kurs wurde erfolgreich erstellt.",
      });
      
      navigate('/courses/teaching');
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Erstellen des Kurses ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Neuen Kurs erstellen</h1>
        <p className="text-muted-foreground">Fülle das Formular aus, um einen neuen Kurs zu erstellen</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Kursdetails</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Kurstitel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titel des Kurses"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Kursbeschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibe den Kurs..."
                rows={5}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Schwierigkeitsgrad</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="level">
                  <SelectValue placeholder="Schwierigkeitsgrad wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Anfänger</SelectItem>
                  <SelectItem value="Intermediate">Fortgeschritten</SelectItem>
                  <SelectItem value="Advanced">Experte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? "Wird erstellt..." : "Kurs erstellen"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCourse;
