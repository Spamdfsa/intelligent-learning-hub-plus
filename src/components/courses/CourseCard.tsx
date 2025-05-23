
import { cn } from "@/lib/utils";
import { Course } from "@/types";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  course: Course;
  showProgress?: boolean;
}

const CourseCard = ({ course, showProgress = true, className, ...props }: CourseCardProps) => {
  // Use optional chaining to safely access the bannerColor property
  const bannerColorClass = course.bannerColor ? `bg-${course.bannerColor}-500` : "bg-blue-500";

  return (
    <div className={cn("course-card group", className)} {...props}>
      <div className={cn("course-card-banner", bannerColorClass)}></div>
      <div className="course-card-content">
        <h3 className="course-card-title">{course.title}</h3>
        <p className="course-card-description">
          {course.description}
        </p>
        <div className="flex items-center text-sm text-muted-foreground pt-2">
          <span>Dozent: {course.instructor || course.instructor_name || "Keine Angabe"}</span>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span>{course.level || "Alle Niveaus"}</span>
          <span>{course.duration || "Keine Angabe"}</span>
        </div>
        {course.progress !== undefined && showProgress && (
          <div className="mt-2 space-y-1">
            <Progress value={course.progress} className="h-1" />
            <div className="flex items-center justify-between text-xs">
              <span>{course.progress}% abgeschlossen</span>
            </div>
          </div>
        )}
      </div>
      <div className="course-card-footer">
        <Link to={`/courses/${course.id}`}>
          <Button variant="secondary" size="sm">Zum Kurs</Button>
        </Link>
        <div className="flex items-center text-xs text-muted-foreground">
          <span>{course.enrolledStudents || course.enrolled || course.student_count || 0} Teilnehmer</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
