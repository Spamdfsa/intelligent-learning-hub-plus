
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
import { Link } from "react-router-dom";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const CoursesPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      const userData: User = JSON.parse(storedUser);
      setUser(userData);
    }

    // Get all courses including locally stored ones
    const allCourses = [...mockCourses];
    
    // Add locally created courses
    const localCoursesJSON = localStorage.getItem("lms-courses");
    if (localCoursesJSON) {
      const localCourses = JSON.parse(localCoursesJSON);
      allCourses.push(...localCourses);
    }
    
    setCourses(allCourses);
  }, []);

  // Filter courses based on role, selected filter, and search
  const filteredCourses = courses.filter((course) => {
    // Filter by user role
    if (user?.role === "teacher" || user?.role === "lecturer") {
      const instructorMatch = course.instructor_id === user.id || 
                             course.instructorId === user.id;
      if (!instructorMatch) {
        return false;
      }
    }
    
    // Filter by difficulty level
    const matchesFilter = filter === "all" || 
                         (filter === "beginner" && course.level === "Beginner") ||
                         (filter === "intermediate" && course.level === "Intermediate") ||
                         (filter === "advanced" && course.level === "Advanced");
    
    // Filter by search term
    const matchesSearch = searchQuery === "" ||
                         course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleSelect = (currentValue: string) => {
    setSearchQuery(currentValue);
    setOpen(false);
  };

  // Check if user is instructor/lecturer
  const canCreateCourse = user?.role === "teacher" || user?.role === "lecturer" || user?.role === "admin";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {(user?.role === "teacher" || user?.role === "lecturer") 
              ? "Meine Kurse" 
              : "Alle Kurse"}
          </h1>
          <p className="text-muted-foreground">
            {(user?.role === "teacher" || user?.role === "lecturer") 
              ? "Verwalte deine Kurse" 
              : "Entdecke und verwalte deine Kurse"}
          </p>
        </div>
        {canCreateCourse && (
          <Link to="/courses/create">
            <Button>Neuen Kurs erstellen</Button>
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Nach Kursen suchen..." 
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => setOpen(true)} 
                />
              </div>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[calc(100vw-2rem)] sm:w-[400px]" align="start">
              <Command>
                <CommandInput 
                  placeholder="Suche nach Kursname oder Beschreibung..." 
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>Keine Kurse gefunden</CommandEmpty>
                  <CommandGroup heading="Kurse">
                    {courses
                      .filter(course => 
                        course.title.toLowerCase().includes(search.toLowerCase()) || 
                        course.description.toLowerCase().includes(search.toLowerCase())
                      )
                      .slice(0, 5)
                      .map(course => (
                        <CommandItem 
                          key={course.id} 
                          value={course.title}
                          onSelect={handleSelect}
                        >
                          {course.title}
                        </CommandItem>
                      ))
                    }
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
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
              {canCreateCourse 
                ? "Du hast noch keine Kurse erstellt. Erstelle deinen ersten Kurs!" 
                : "Versuche andere Filterkriterien oder Suchbegriffe."}
            </p>
            {canCreateCourse && (
              <Link to="/courses/create" className="mt-4 inline-block">
                <Button>Kurs erstellen</Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
