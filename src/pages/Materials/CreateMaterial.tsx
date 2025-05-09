
import { useState, useEffect } from "react";
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
import { Material, User } from "@/types";

const CreateMaterial = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"pdf" | "document" | "video" | "link">("document");
  const [url, setUrl] = useState("");
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const userJson = localStorage.getItem("lms-user");
    if (userJson) {
      const userData = JSON.parse(userJson);
      setUser(userData);
    }

    // Load all available courses (including mock courses for demo)
    const allCourses = [];
    
    // Add courses from mockCourses (in a real app, this would be from an API)
    try {
      // Dynamically import mockCourses
      import("@/data/mockData").then(({ mockCourses }) => {
        // Filter courses to only include those created by the current user
        const filteredMockCourses = mockCourses.filter(course => {
          if (!userJson) return false;
          const userData = JSON.parse(userJson);
          return course.instructor_id === userData.id || course.instructorId === userData.id;
        });
        
        allCourses.push(...filteredMockCourses);
        
        // Load courses from localStorage
        const localCoursesJson = localStorage.getItem("lms-courses");
        if (localCoursesJson) {
          const localCourses = JSON.parse(localCoursesJson);
          
          // Filter courses to only include those created by the current user
          const filteredLocalCourses = localCourses.filter((course: any) => {
            if (!userJson) return false;
            const userData = JSON.parse(userJson);
            return course.instructor_id === userData.id || course.instructorId === userData.id;
          });
          
          allCourses.push(...filteredLocalCourses);
        }
        
        setCourses(allCourses);
        if (allCourses.length > 0) {
          setCourseId(allCourses[0].id);
        }
      });
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        toast({
          title: "Fehler",
          description: "Du musst angemeldet sein, um Material hinzuzufügen.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
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
              {courses.length > 0 ? (
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
              ) : (
                <div className="p-4 border rounded text-center">
                  <p className="text-muted-foreground mb-2">Du hast noch keine Kurse erstellt</p>
                  <Button variant="outline" onClick={() => navigate('/courses/create')}>
                    Kurs erstellen
                  </Button>
                </div>
              )}
            </div>
            
            {courseId && (
              <>
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
                  <Button type="submit" disabled={isLoading || courses.length === 0} className="w-full md:w-auto">
                    {isLoading ? "Wird hinzugefügt..." : "Material hinzufügen"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMaterial;
