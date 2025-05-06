
import { useEffect, useState } from "react";
import { mockCourses } from "@/data/mockData";
import { Course, User } from "@/types";
import CourseCard from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const CoursesPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      const userData: User = JSON.parse(storedUser);
      setUser(userData);
    }

    // Set courses
    setCourses(mockCourses);
  }, []);

  // Filter courses based on selected filter and search
  const filteredCourses = courses.filter((course) => {
    const matchesFilter = filter === "all" || 
                          (filter === "beginner" && course.level === "Beginner") ||
                          (filter === "intermediate" && course.level === "Intermediate") ||
                          (filter === "advanced" && course.level === "Advanced");
    
    const matchesSearch = search === "" ||
                          course.title.toLowerCase().includes(search.toLowerCase()) ||
                          course.description.toLowerCase().includes(search.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{user?.role === "student" ? "Meine Kurse" : "Alle Kurse"}</h1>
          <p className="text-muted-foreground">
            {user?.role === "student" 
              ? "Entdecke und verwalte deine Kurse" 
              : "Übersicht aller verfügbaren Kurse"}
          </p>
        </div>
        {user?.role === "teacher" || user?.role === "admin" ? (
          <Button>Neuen Kurs erstellen</Button>
        ) : null}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Nach Kursen suchen..." 
            className="pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kurse</SelectItem>
            <SelectItem value="beginner">Anfänger</SelectItem>
            <SelectItem value="intermediate">Fortgeschritten</SelectItem>
            <SelectItem value="advanced">Experte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <h3 className="text-lg font-medium">Keine Kurse gefunden</h3>
            <p className="text-muted-foreground">
              Versuche andere Filterkriterien oder Suchbegriffe.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
