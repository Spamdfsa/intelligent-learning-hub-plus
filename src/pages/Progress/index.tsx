import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, CompletedModule } from "@/types";
import { mockCourses } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";

const ProgressPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [completedModules, setCompletedModules] = useState<CompletedModule[]>([]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fortschritt</h1>
        <p className="text-muted-foreground">
          Dein Fortschritt in den Kursen
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCourses.map((course) => {
          const completed = Math.min(75 + Math.random() * 25, 100);
          return (
            <Card key={course.id}>
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Fortschritt
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {completed}%
                    </span>
                  </div>
                  <Progress value={completed} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Letzte Aktivität: {format(new Date(), "dd.MM.yyyy")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressPage;
