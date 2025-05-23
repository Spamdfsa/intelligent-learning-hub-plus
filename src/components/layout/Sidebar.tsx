
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { User, UserRole } from "@/types";
import { 
  BarChart, 
  BookCheck, 
  BookOpen, 
  Calendar, 
  FileText, 
  GraduationCap, 
  LayoutDashboard, 
  MessageSquare, 
  Settings,
  User as UserIcon,
  Users
} from "lucide-react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className, ...props }: SidebarProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      const user: User = JSON.parse(storedUser);
      setUserRole(user.role);
    }
  }, []);

  // Define navigation items by role - using a Map for dynamic lookup
  const navigationItemsByRole = new Map<UserRole, Array<{ title: string; href: string; icon: JSX.Element }>>([
    ["admin", [
      { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      { title: "Kursverwaltung", href: "/courses/manage", icon: <BookOpen className="h-5 w-5" /> },
      { title: "Benutzerverwaltung", href: "/users", icon: <Users className="h-5 w-5" /> },
      { title: "Analytik", href: "/analytics", icon: <BarChart className="h-5 w-5" /> },
      { title: "Einstellungen", href: "/settings", icon: <Settings className="h-5 w-5" /> },
    ]],
    ["student", [
      { title: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
      { title: "Meine Kurse", href: "/courses", icon: <BookOpen className="h-5 w-5" /> },
      { title: "Materialien", href: "/materials", icon: <FileText className="h-5 w-5" /> },
      { title: "Aufgaben", href: "/tasks", icon: <BookCheck className="h-5 w-5" /> },
      { title: "Deadlines", href: "/deadlines", icon: <Calendar className="h-5 w-5" /> },
      { title: "Lernfortschritt", href: "/progress", icon: <BarChart className="h-5 w-5" /> },
      { title: "Abgeschlossene Module", href: "/modules", icon: <GraduationCap className="h-5 w-5" /> },
      { title: "Zusammenfassungen", href: "/summaries", icon: <FileText className="h-5 w-5" /> },
      { title: "KI-Tutor", href: "/ai-tutor", icon: <MessageSquare className="h-5 w-5" /> },
      { title: "Profil", href: "/profile", icon: <UserIcon className="h-5 w-5" /> },
      { title: "Einstellungen", href: "/settings", icon: <Settings className="h-5 w-5" /> },
    ]]
  ]);

  // Default to student nav items if role is not recognized or defined
  const navItems = userRole ? navigationItemsByRole.get(userRole) || navigationItemsByRole.get("student")! : [];

  return (
    <aside className={cn("pb-12 w-64 border-r h-screen flex flex-col", className)} {...props}>
      <div className="py-4 flex flex-col h-full">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Navigation
          </h2>
        </div>
        <div className="px-4 py-2 flex-1">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                {item.icon}
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
