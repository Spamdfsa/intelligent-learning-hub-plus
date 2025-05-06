
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { User, CompletedModule, Course, Module } from "@/types";
import { mockCourses } from "@/data/mockData";
import { CheckCircle, Book, Calendar } from "lucide-react";

const ModulesPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [completedModules, setCompletedModules] = useState<CompletedModule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      const userData: User = JSON.parse(storedUser);
      setUser(userData);
      
      if (userData.role === "student") {
        // For demo, use the first 4 courses for the student
        const studentCourses = mockCourses.slice(0, 4);
        setCourses(studentCourses);
        
        // Generate completed modules based on the courses
        const modules: CompletedModule[] = [];
        studentCourses.forEach(course => {
          course.modules.forEach((module, index) => {
            if (index === 0 || Math.random() > 0.5) { // First module and some others are completed
              modules.push({
                id: `cm-${module.id}`,
                courseId: course.id,
                moduleId: module.id,
                title: module.title,
                completedDate: new Date(
                  Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
                ).toLocaleDateString(),
                grade: Math.floor(Math.random() * 30) + 70 // 70-100
              });
            }
          });
        });
        setCompletedModules(modules);
      }
    }
  }, []);

  const getInProgressModules = () => {
    const inProgressModules: Module[] = [];
    courses.forEach(course => {
      course.modules.forEach(module => {
        const isCompleted = completedModules.some(
          cm => cm.moduleId === module.id
        );
        if (!isCompleted) {
          inProgressModules.push({...module, courseId: course.id, courseName: course.title});
        }
      });
    });
    return inProgressModules;
  };

  const handleNavigateToModule = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (!user || user.role !== "student") {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <p>Diese Seite ist nur für Studenten verfügbar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Meine Module</h1>
        <p className="text-muted-foreground">
          Übersicht über deine abgeschlossenen und laufenden Module
        </p>
      </div>

      <Tabs defaultValue="completed">
        <TabsList>
          <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
          <TabsTrigger value="in-progress">In Bearbeitung</TabsTrigger>
        </TabsList>
        
        <TabsContent value="completed" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Abgeschlossene Module</CardTitle>
              <CardDescription>
                Module, die du bereits erfolgreich abgeschlossen hast
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titel</TableHead>
                    <TableHead>Kurs</TableHead>
                    <TableHead>Abgeschlossen am</TableHead>
                    <TableHead>Bewertung</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedModules.map((module) => {
                    const course = courses.find(c => c.id === module.courseId);
                    
                    return (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {module.title}
                        </TableCell>
                        <TableCell>{course?.title || "-"}</TableCell>
                        <TableCell>{module.completedDate}</TableCell>
                        <TableCell>
                          {module.grade ? (
                            <Badge variant={module.grade >= 80 ? "default" : "secondary"}>
                              {module.grade}%
                            </Badge>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleNavigateToModule(module.courseId)}
                          >
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  
                  {completedModules.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Book className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">Du hast noch keine Module abgeschlossen</p>
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => navigate("/courses")}
                          >
                            Zu den Kursen
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="in-progress" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Module in Bearbeitung</CardTitle>
              <CardDescription>
                Module, an denen du aktuell arbeitest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getInProgressModules().map((module: any) => {
                  const totalTasks = module.tasks.length;
                  const completedTasks = module.tasks.filter(t => t.completed).length;
                  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                  
                  return (
                    <div key={module.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{module.title}</h3>
                        <Badge variant="outline">{module.courseName}</Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{completedTasks} von {totalTasks} Aufgaben</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} />
                      </div>
                      <div className="pt-2 flex justify-between items-center">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Nächste Aufgabe in 2 Tagen</span>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleNavigateToModule(module.courseId)}
                        >
                          Fortsetzen
                        </Button>
                      </div>
                    </div>
                  );
                })}
                
                {getInProgressModules().length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-3">
                    <Book className="h-12 w-12 text-muted-foreground" />
                    <p>Keine Module in Bearbeitung</p>
                    <Button onClick={() => navigate("/courses")}>
                      Kurse entdecken
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModulesPage;
