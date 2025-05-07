
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from "recharts";
import { addDays, format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { de } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Course, CompletedModule } from "@/types";

const ProgressPage = () => {
  const [completedModules, setCompletedModules] = useState<CompletedModule[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);

  useEffect(() => {
    // Load courses from localStorage
    const storedCourses = localStorage.getItem("courses");
    if (storedCourses) {
      setCourses(JSON.parse(storedCourses));
    }

    // Generate mock completed modules data
    const mockCompletedModules: CompletedModule[] = [
      {
        id: "cm1",
        courseId: "course1",
        moduleId: "module1",
        title: "Einführung in die Programmierung",
        completedDate: "2022-05-12T15:30:00Z",
        grade: 85,
      },
      {
        id: "cm2",
        courseId: "course2",
        moduleId: "module1",
        title: "Grundlagen der Informatik",
        completedDate: "2022-05-15T10:45:00Z",
        grade: 92,
      },
      {
        id: "cm3",
        courseId: "course1",
        moduleId: "module2",
        title: "Datenstrukturen und Algorithmen",
        completedDate: "2022-05-18T14:20:00Z",
        grade: 78,
      },
      {
        id: "cm4",
        courseId: "course3",
        moduleId: "module1",
        title: "Webentwicklung Basics",
        completedDate: "2022-05-20T09:15:00Z",
        grade: 88,
      },
      {
        id: "cm5",
        courseId: "course2",
        moduleId: "module2",
        title: "Theorie der Berechenbarkeit",
        completedDate: "2022-05-22T16:50:00Z",
        grade: 75,
      },
      {
        id: "cm6",
        courseId: "course3",
        moduleId: "module2",
        title: "Fortgeschrittenes CSS",
        completedDate: "2022-05-25T11:30:00Z",
        grade: 90,
      },
      {
        id: "cm7",
        courseId: "course1",
        moduleId: "module3",
        title: "Objektorientierte Programmierung",
        completedDate: "2022-05-28T13:40:00Z",
        grade: 82,
      },
    ];

    // Generate activity data for the heat map
    const today = new Date();
    const startDate = subDays(today, 30);
    const endDate = today;
    const dates = eachDayOfInterval({ start: startDate, end: endDate });

    const randomActivities = dates.map(date => {
      const activity = Math.floor(Math.random() * 8); // 0-7 activities
      return {
        date: format(date, "yyyy-MM-dd"),
        value: activity,
        day: format(date, "EEE", { locale: de }),
        display: format(date, "dd.MM"),
      };
    });

    setActivityData(randomActivities);
    setCompletedModules(mockCompletedModules);
  }, []);

  const getCourseById = (id: string) => {
    return courses.find(course => course.id === id);
  };

  const getCompletionRate = () => {
    if (courses.length === 0) return 0;
    
    let totalModules = 0;
    courses.forEach(course => {
      totalModules += course.modules.length;
    });
    
    const completionRate = (completedModules.length / totalModules) * 100;
    return Math.round(completionRate);
  };

  const getAverageGrade = () => {
    if (completedModules.length === 0) return 0;
    
    const sum = completedModules.reduce((acc, module) => acc + (module.grade || 0), 0);
    return Math.round(sum / completedModules.length);
  };

  const getStrongestCourse = () => {
    if (completedModules.length === 0 || courses.length === 0) return null;
    
    const courseGrades: Record<string, { total: number; count: number }> = {};
    
    completedModules.forEach(module => {
      if (module.grade) {
        if (!courseGrades[module.courseId]) {
          courseGrades[module.courseId] = { total: 0, count: 0 };
        }
        courseGrades[module.courseId].total += module.grade;
        courseGrades[module.courseId].count += 1;
      }
    });
    
    let strongestCourseId = "";
    let highestAvg = 0;
    
    Object.entries(courseGrades).forEach(([courseId, data]) => {
      const avg = data.total / data.count;
      if (avg > highestAvg) {
        highestAvg = avg;
        strongestCourseId = courseId;
      }
    });
    
    return getCourseById(strongestCourseId);
  };

  // Function to generate color based on activity value
  const getActivityColor = (value: number) => {
    if (value === 0) return "#ebedf0";
    if (value <= 2) return "#c6e48b";
    if (value <= 4) return "#7bc96f";
    if (value <= 6) return "#239a3b";
    return "#196127";
  };

  // Custom tool tip for the activity chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-md p-2 shadow-sm">
          <p className="text-xs font-medium">{data.display}</p>
          <p className="text-xs">{`${data.value} Aktivitäten`}</p>
        </div>
      );
    }
    return null;
  };

  // Group activities by week for the bar chart
  const weeklyActivityData = activityData.reduce((acc: any[], curr, index) => {
    const weekIndex = Math.floor(index / 7);
    
    if (!acc[weekIndex]) {
      acc[weekIndex] = {
        name: `W${weekIndex + 1}`,
        activities: 0
      };
    }
    
    acc[weekIndex].activities += curr.value;
    return acc;
  }, []);

  const strongestCourse = getStrongestCourse();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lernfortschritt</h1>
        <p className="text-muted-foreground">
          Übersicht deiner Lernaktivitäten und Fortschritte
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossene Module</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedModules.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              von insgesamt {courses.reduce((acc, course) => acc + course.modules.length, 0)} Modulen
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Gesamtfortschritt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCompletionRate()}%</div>
            <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${getCompletionRate()}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Durchschnittsnote</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageGrade()}/100</div>
            <p className="text-xs text-muted-foreground mt-1">
              {getAverageGrade() >= 90 ? "Sehr gut" : 
               getAverageGrade() >= 80 ? "Gut" : 
               getAverageGrade() >= 70 ? "Befriedigend" : 
               getAverageGrade() >= 60 ? "Ausreichend" : "Nachbesserung nötig"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stärkster Kurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold line-clamp-1">
              {strongestCourse?.title || "Keine Daten"}
            </div>
            {strongestCourse && (
              <Badge variant="outline" className="mt-1">
                {strongestCourse.category}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Aktivitäten</TabsTrigger>
          <TabsTrigger value="modules">Abgeschlossene Module</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Aktivitätsübersicht</CardTitle>
              <CardDescription>
                Deine täglichen Lernaktivitäten der letzten 30 Tage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="h-64">
                <h3 className="text-lg font-medium mb-4">Wöchentliche Aktivitäten</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={weeklyActivityData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="activities" name="Aktivitäten" fill="#8884d8" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Aktivitäts-Heatmap</h3>
                <div className="overflow-x-auto pb-4">
                  <div className="flex min-w-max gap-1">
                    {activityData.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className="w-8 h-8 rounded-sm tooltip-trigger"
                          style={{ backgroundColor: getActivityColor(day.value) }}
                          title={`${day.display}: ${day.value} Aktivitäten`}
                        />
                        <span className="text-xs text-muted-foreground mt-1">
                          {index % 7 === 0 ? day.day : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Weniger</span>
                  {[0, 2, 4, 6, 8].map((value) => (
                    <div 
                      key={value}
                      className="w-4 h-4 rounded-sm"
                      style={{ backgroundColor: getActivityColor(value) }}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground">Mehr</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle>Abgeschlossene Module</CardTitle>
              <CardDescription>
                Übersicht aller abgeschlossenen Module
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedModules.length > 0 ? (
                  completedModules.map((module) => {
                    const course = getCourseById(module.courseId);
                    return (
                      <div key={module.id} className="flex items-center justify-between border-b pb-4">
                        <div>
                          <h3 className="font-medium">{module.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {course?.title || "Unbekannter Kurs"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {module.grade ? `${module.grade}/100` : "Keine Note"}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Abgeschlossen am {format(new Date(module.completedDate), "dd.MM.yyyy")}
                            </p>
                          </div>
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium"
                            style={{
                              backgroundColor: module.grade ? 
                                module.grade >= 90 ? "#22c55e" : 
                                module.grade >= 80 ? "#84cc16" : 
                                module.grade >= 70 ? "#eab308" : 
                                module.grade >= 60 ? "#f97316" : "#ef4444" : "#94a3b8",
                              color: module.grade && module.grade < 70 ? "#ffffff" : undefined
                            }}
                          >
                            {module.grade || "N/A"}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center py-8 text-muted-foreground">
                    Noch keine Module abgeschlossen.
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Deine durchschnittliche Note: <span className="font-medium">{getAverageGrade()}/100</span>
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
