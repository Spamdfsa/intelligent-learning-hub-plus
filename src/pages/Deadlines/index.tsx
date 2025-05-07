
import { useEffect, useState } from "react";
import { format, parseISO, isBefore } from "date-fns";
import { de } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";

const DeadlinesPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch tasks with due dates from localStorage or API
    const fetchTasks = () => {
      const storedCourses = localStorage.getItem("courses");
      if (!storedCourses) return [];

      const courses = JSON.parse(storedCourses);
      const allTasks: Task[] = [];

      courses.forEach((course: any) => {
        course.modules.forEach((module: any) => {
          module.tasks.forEach((task: Task) => {
            if (task.dueDate) {
              allTasks.push({
                ...task,
                courseId: course.id,
                moduleId: module.id
              });
            }
          });
        });
      });

      return allTasks;
    };

    setTasks(fetchTasks());
  }, []);

  const getDeadlineStatus = (dueDate: string) => {
    const today = new Date();
    const deadline = parseISO(dueDate);
    const isPastDue = isBefore(deadline, today);

    if (isPastDue) {
      return "overdue";
    } else {
      const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        return "soon";
      } else {
        return "upcoming";
      }
    }
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "overdue":
        return "destructive";
      case "soon":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "overdue":
        return "Überfällig";
      case "soon":
        return "Bald fällig";
      default:
        return "Anstehend";
    }
  };

  const filteredTasks = selectedDate
    ? tasks.filter((task) => {
        if (!task.dueDate) return false;
        const dueDate = parseISO(task.dueDate);
        return (
          dueDate.getDate() === selectedDate.getDate() &&
          dueDate.getMonth() === selectedDate.getMonth() &&
          dueDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : tasks;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.dueDate || !b.dueDate) return 0;
    return parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime();
  });

  const tasksWithStatus = sortedTasks.map((task) => ({
    ...task,
    status: task.dueDate ? getDeadlineStatus(task.dueDate) : "upcoming",
  }));

  const handleTaskClick = (task: Task) => {
    if (task.courseId && task.moduleId) {
      navigate(`/courses/${task.courseId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deadlines</h1>
        <p className="text-muted-foreground">
          Übersicht deiner anstehenden Abgabetermine
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Alle</TabsTrigger>
              <TabsTrigger value="upcoming">Anstehend</TabsTrigger>
              <TabsTrigger value="overdue">Überfällig</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {tasksWithStatus.length > 0 ? (
                tasksWithStatus.map((task) => (
                  <Card key={task.id} className="cursor-pointer" onClick={() => handleTaskClick(task)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {task.description?.substring(0, 100)}
                            {task.description && task.description.length > 100 ? "..." : ""}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={getBadgeVariant(task.status)}>
                            {getStatusLabel(task.status)}
                          </Badge>
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              Fällig am: {format(parseISO(task.dueDate), "dd.MM.yyyy", { locale: de })}
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Keine Deadlines für das ausgewählte Datum gefunden.
                </p>
              )}
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              {tasksWithStatus.filter(t => t.status !== "overdue").length > 0 ? (
                tasksWithStatus
                  .filter(t => t.status !== "overdue")
                  .map((task) => (
                    <Card key={task.id} className="cursor-pointer" onClick={() => handleTaskClick(task)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {task.description?.substring(0, 100)}
                              {task.description && task.description.length > 100 ? "..." : ""}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant={getBadgeVariant(task.status)}>
                              {getStatusLabel(task.status)}
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Fällig am: {format(parseISO(task.dueDate), "dd.MM.yyyy", { locale: de })}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Keine anstehenden Deadlines gefunden.
                </p>
              )}
            </TabsContent>

            <TabsContent value="overdue" className="space-y-4">
              {tasksWithStatus.filter(t => t.status === "overdue").length > 0 ? (
                tasksWithStatus
                  .filter(t => t.status === "overdue")
                  .map((task) => (
                    <Card key={task.id} className="cursor-pointer" onClick={() => handleTaskClick(task)}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {task.description?.substring(0, 100)}
                              {task.description && task.description.length > 100 ? "..." : ""}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant="destructive">
                              Überfällig
                            </Badge>
                            {task.dueDate && (
                              <span className="text-xs text-muted-foreground">
                                Fällig am: {format(parseISO(task.dueDate), "dd.MM.yyyy", { locale: de })}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Keine überfälligen Deadlines gefunden.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Kalender</CardTitle>
              <CardDescription>
                Wähle ein Datum, um die entsprechenden Deadlines anzuzeigen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                locale={de}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DeadlinesPage;
