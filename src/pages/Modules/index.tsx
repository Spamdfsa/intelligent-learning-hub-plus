import { useEffect, useState } from "react";
import { CompletedModule, User } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockCourses } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { format } from "date-fns";

const ModulesPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [completedModules, setCompletedModules] = useState<CompletedModule[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Mock completed modules data
    const mockCompletedModules: CompletedModule[] = [
      {
        id: "cm1",
        courseId: "course1",
        moduleId: "module1",
        title: "Einführung in Python",
        completedDate: "2025-04-28",
        grade: 95,
      },
      {
        id: "cm2",
        courseId: "course2",
        moduleId: "module3",
        title: "Grundlagen des Machine Learning",
        completedDate: "2025-04-25",
        grade: 88,
      },
      {
        id: "cm3",
        courseId: "course3",
        moduleId: "module2",
        title: "Datenstrukturen und Algorithmen",
        completedDate: "2025-04-20",
        grade: 92,
      },
      {
        id: "cm4",
        courseId: "course4",
        moduleId: "module1",
        title: "Web Development Basics",
        completedDate: "2025-04-15",
        grade: 85,
      },
    ];

    setCompletedModules(mockCompletedModules);
  }, []);

  const handleModuleClick = (module: CompletedModule) => {
    navigate(`/courses/${module.courseId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Abgeschlossene Module</h1>
        <p className="text-muted-foreground">
          Übersicht deiner erfolgreich abgeschlossenen Module
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {completedModules.map((module) => (
          <Card 
            key={module.id} 
            className="cursor-pointer hover:shadow-md transition-all"
            onClick={() => handleModuleClick(module)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{module.title}</CardTitle>
              <CardDescription>
                {mockCourses.find(c => c.id === module.courseId)?.title || "Unbekannter Kurs"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Abgeschlossen am {format(new Date(module.completedDate), "dd.MM.yyyy")}</span>
                </div>
                {module.grade && (
                  <Badge variant="secondary" className="text-primary">{module.grade}%</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {completedModules.length === 0 && (
          <div className="col-span-full py-12 text-center">
            <h3 className="text-lg font-medium">Noch keine Module abgeschlossen</h3>
            <p className="text-muted-foreground">
              Beginne mit deinen Kursen, um Module abzuschließen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulesPage;
