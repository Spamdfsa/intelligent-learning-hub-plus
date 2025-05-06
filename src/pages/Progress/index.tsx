
import { useEffect, useState } from "react";
import { User } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Calendar, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { addDays, format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { de } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { BarChart as BarChartIcon, LineChart } from "lucide-react";

// Generate random activity data for the heatmap
const generateActivityData = () => {
  const today = startOfDay(new Date());
  const sixMonthsAgo = subDays(today, 180);
  
  const daysInRange = eachDayOfInterval({
    start: sixMonthsAgo,
    end: today
  });
  
  return daysInRange.map(day => {
    // Generate random value between 0-5
    const value = Math.floor(Math.random() * 6);
    return {
      date: format(day, "yyyy-MM-dd"),
      value: value,
      tooltip: `${value} Lerneinheiten am ${format(day, "dd. MMMM", { locale: de })}`
    };
  });
};

// Generate random weekly progress data
const generateWeeklyData = () => {
  const weeks = [];
  for (let i = 12; i >= 0; i--) {
    weeks.push({
      name: `KW ${format(subDays(new Date(), i * 7), "w")}`,
      Kurse: Math.floor(Math.random() * 8) + 1,
      Aufgaben: Math.floor(Math.random() * 12) + 1,
      Lerneinheiten: Math.floor(Math.random() * 15) + 5
    });
  }
  return weeks;
};

// Generate random subject progress data
const generateSubjectData = () => [
  { name: "Python", progress: 85 },
  { name: "Machine Learning", progress: 67 },
  { name: "Web Development", progress: 72 },
  { name: "Datenbanken", progress: 45 },
  { name: "Mathematik", progress: 60 },
];

const ProgressPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Generate mock data
    setActivityData(generateActivityData());
    setWeeklyData(generateWeeklyData());
    setSubjectData(generateSubjectData());
  }, []);

  const getColorForValue = (value: number) => {
    if (value === 0) return "bg-gray-100";
    if (value === 1) return "bg-green-100";
    if (value === 2) return "bg-green-200";
    if (value === 3) return "bg-green-300";
    if (value === 4) return "bg-green-400";
    return "bg-green-500";
  };

  // Group days by month for the heatmap
  const groupedByMonth = activityData.reduce((acc, item) => {
    const month = item.date.substring(0, 7); // YYYY-MM
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(item);
    return acc;
  }, {} as Record<string, typeof activityData>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lernfortschritt</h1>
        <p className="text-muted-foreground">
          Visualisiere deinen Fortschritt und deine Lernaktivitäten
        </p>
      </div>

      <Tabs defaultValue="heatmap" className="space-y-6">
        <TabsList>
          <TabsTrigger value="heatmap">
            <Calendar className="h-4 w-4 mr-2" />
            Aktivitäts-Heatmap
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChartIcon className="h-4 w-4 mr-2" />
            Wöchentliche Statistiken
          </TabsTrigger>
          <TabsTrigger value="subjects">
            <LineChart className="h-4 w-4 mr-2" />
            Fortschritt nach Fächern
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lernaktivität</CardTitle>
              <CardDescription>
                Deine tägliche Lernaktivität der letzten 6 Monate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.entries(groupedByMonth).map(([month, days]) => {
                  const [year, monthNum] = month.split('-');
                  const monthName = format(new Date(parseInt(year), parseInt(monthNum) - 1, 1), "MMMM yyyy", { locale: de });
                  
                  return (
                    <div key={month} className="space-y-2">
                      <h3 className="text-lg font-medium capitalize">{monthName}</h3>
                      <div className="grid grid-cols-7 gap-1">
                        {days.map((day, index) => (
                          <div 
                            key={index}
                            className={`w-6 h-6 rounded-sm ${getColorForValue(day.value)}`}
                            title={day.tooltip}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
                
                <div className="flex items-center justify-end space-x-2">
                  <span className="text-xs text-muted-foreground">Weniger</span>
                  <div className="flex space-x-1">
                    <div className="w-4 h-4 rounded-sm bg-gray-100"></div>
                    <div className="w-4 h-4 rounded-sm bg-green-100"></div>
                    <div className="w-4 h-4 rounded-sm bg-green-200"></div>
                    <div className="w-4 h-4 rounded-sm bg-green-300"></div>
                    <div className="w-4 h-4 rounded-sm bg-green-400"></div>
                    <div className="w-4 h-4 rounded-sm bg-green-500"></div>
                  </div>
                  <span className="text-xs text-muted-foreground">Mehr</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Wöchentlicher Fortschritt</CardTitle>
              <CardDescription>
                Deine Lernaktivitäten der letzten 12 Wochen
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ChartContainer 
                className="h-[300px]"
                series={[
                  { name: "Kurse", color: "primary" },
                  { name: "Aufgaben", color: "amber" },
                  { name: "Lerneinheiten", color: "green" }
                ]}
                dataSource={weeklyData}
              >
                <ChartTooltip className="bg-background">
                  <ChartTooltipContent />
                </ChartTooltip>
                <BarChart />
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Fortschritt nach Fächern</CardTitle>
              <CardDescription>
                Dein aktueller Fortschritt in verschiedenen Fachgebieten
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subjectData.map((subject) => (
                  <div key={subject.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{subject.name}</div>
                      <div className="text-sm text-muted-foreground">{subject.progress}%</div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${subject.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;
