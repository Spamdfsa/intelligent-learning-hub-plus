
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
import { Material } from "@/types";

const CreateMaterial = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"pdf" | "document" | "video" | "link">("document");
  const [url, setUrl] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useState(() => {
    // Load courses from localStorage
    const coursesJson = localStorage.getItem("lms-courses");
    if (coursesJson) {
      const parsedCourses = JSON.parse(coursesJson);
      setCourses(parsedCourses);
      if (parsedCourses.length > 0) {
        setCourseId(parsedCourses[0].id);
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get user info
      const userJson = localStorage.getItem("lms-user");
      if (!userJson) {
        toast({
          title: "Fehler",
          description: "Du musst angemeldet sein, um Material hinzuzufügen.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(userJson);
      
      // Create new material
      const newMaterial: Material = {
        id: uuidv4(),
        title,
        description,
        type,
        url,
        created_by: user.id,
        course_id: courseId,
        created_at: new Date().toISOString()
      };
      
      // Store material in localStorage
      const existingMaterialsJson = localStorage.getItem("lms-materials");
      const existingMaterials = existingMaterialsJson ? JSON.parse(existingMaterialsJson) : [];
      existingMaterials.push(newMaterial);
      localStorage.setItem("lms-materials", JSON.stringify(existingMaterials));
      
      toast({
        title: "Material hinzugefügt",
        description: "Das Material wurde erfolgreich hinzugefügt.",
      });
      
      // Navigate to the course detail page
      navigate(`/courses/${courseId}`);
      setIsLoading(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Hinzufügen des Materials ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kursmaterial hinzufügen</h1>
        <p className="text-muted-foreground">Füge neues Lernmaterial zu einem deiner Kurse hinzu</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Materialdetails</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course">Kurs auswählen</Label>
              <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger id="course">
                  <SelectValue placeholder="Kurs wählen" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Titel</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titel des Materials"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Beschreibe das Material..."
                rows={3}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Materialtyp</Label>
              <Select 
                value={type} 
                onValueChange={(value) => setType(value as "pdf" | "document" | "video" | "link")}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Typ wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Dokument</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">URL oder Pfad</Label>
              <Input
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="URL oder Pfad zum Material"
                required
              />
            </div>
            
            <div className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? "Wird hinzugefügt..." : "Material hinzufügen"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMaterial;
