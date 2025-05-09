
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types";

const AssignmentsPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load tasks from localStorage
    const tasksJson = localStorage.getItem("lms-tasks");
    if (tasksJson) {
      setTasks(JSON.parse(tasksJson));
    }
  }, []);

  const handleReviewTask = (task: Task) => {
    setSelectedTask(task);
    setFeedback(task.feedback || "");
    setGrade(task.grade || "");
    setIsReviewOpen(true);
  };

  const handleSaveReview = () => {
    if (!selectedTask) return;

    // Update task with feedback and grade
    const updatedTask = {
      ...selectedTask,
      status: "graded" as const,
      feedback,
      grade,
    };

    // Update task in the tasks array
    const updatedTasks = tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    );
    
    // Save updated tasks to localStorage
    localStorage.setItem("lms-tasks", JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
    
    toast({
      title: "Bewertung gespeichert",
      description: "Die Aufgabenbewertung wurde erfolgreich gespeichert.",
    });
    
    setIsReviewOpen(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Ausstehend</Badge>;
      case "submitted":
        return <Badge variant="secondary">Eingereicht</Badge>;
      case "graded":
        return <Badge variant="default">Bewertet</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Aufgabenbewertung</h1>
        <p className="text-muted-foreground">Bewerte eingereichte Aufgaben und gib Feedback</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eingereichte Aufgaben</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aufgabe</TableHead>
                  <TableHead>Kurs</TableHead>
                  <TableHead>Fälligkeitsdatum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks
                  .filter(task => task.status !== "pending")
                  .map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.course_id}</TableCell>
                      <TableCell>{new Date(task.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReviewTask(task)}
                        >
                          {task.status === "graded" ? "Bewertung anzeigen" : "Bewerten"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Keine Aufgaben zur Bewertung vorhanden</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedTask?.title} - Bewertung
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Eingereichte Antwort:</h3>
              <div className="rounded-md bg-muted p-3">
                <p>{selectedTask?.submission}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grade">Note</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger id="grade">
                  <SelectValue placeholder="Note wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1,0">1,0 - Sehr gut</SelectItem>
                  <SelectItem value="1,3">1,3 - Sehr gut -</SelectItem>
                  <SelectItem value="1,7">1,7 - Gut +</SelectItem>
                  <SelectItem value="2,0">2,0 - Gut</SelectItem>
                  <SelectItem value="2,3">2,3 - Gut -</SelectItem>
                  <SelectItem value="2,7">2,7 - Befriedigend +</SelectItem>
                  <SelectItem value="3,0">3,0 - Befriedigend</SelectItem>
                  <SelectItem value="3,3">3,3 - Befriedigend -</SelectItem>
                  <SelectItem value="3,7">3,7 - Ausreichend +</SelectItem>
                  <SelectItem value="4,0">4,0 - Ausreichend</SelectItem>
                  <SelectItem value="5,0">5,0 - Nicht ausreichend</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Gib dem Studenten Feedback zu seiner Einreichung..."
                rows={5}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveReview}>
              Bewertung speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentsPage;
