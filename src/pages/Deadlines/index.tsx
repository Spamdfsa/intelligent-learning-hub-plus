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
          module.tasks.forEach((task: any) => {
            // Check both due_date and dueDate for compatibility
            if (task.due_date || task.dueDate) {
              allTasks.push({
                ...task,
                due_date: task.due_date || task.dueDate, // Ensure due_date is always set
                course_id: task.course_id || task.courseId || course.id, // Ensure course_id is always set
                moduleId: task.moduleId || module.id // Keep moduleId for navigation
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
        const dueDateStr = task.due_date || task.dueDate;
        if (!dueDateStr) return false;
        const dueDate = parseISO(dueDateStr);
        return (
          dueDate.getDate() === selectedDate.getDate() &&
          dueDate.getMonth() === selectedDate.getMonth() &&
          dueDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : tasks;

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dueDateA = a.due_date || a.dueDate;
    const dueDateB = b.due_date || b.dueDate;
    if (!dueDateA || !dueDateB) return 0;
    return parseISO(dueDateA).getTime() - parseISO(dueDateB).getTime();
  });

  const tasksWithStatus = sortedTasks.map((task) => ({
    ...task,
    status: (task.status as string) || ((task.due_date || task.dueDate) ? getDeadlineStatus(task.due_date || task.dueDate as string) : "upcoming"),
  }));

  const handleTaskClick = (task: Task) => {
    const courseId = task.course_id || task.courseId;
    if (courseId) {
      navigate(`/courses/${courseId}`);
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
                  <Card key={task.id} className="cursor-pointer" onClick={() => handleTaskClick(task as Task)}>
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
                          <Badge variant={getBadgeVariant(task.status as string)}>
                            {getStatusLabel(task.status as string)}
                          </Badge>
                          {(task.due_date || task.dueDate) && (
                            <span className="text-xs text-muted-foreground">
                              Fällig am: {format(parseISO(task.due_date || task.dueDate as string), "dd.MM.yyyy", { locale: de })}
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
