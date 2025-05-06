
import { useEffect, useState } from "react";
import { User, UserSetting } from "@/types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Bell, User as UserIcon, Shield, Palette } from "lucide-react";

const SettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSetting[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("lms-user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Mock settings
    const mockSettings: UserSetting[] = [
      // Appearance settings
      {
        id: "theme",
        name: "Erscheinungsbild",
        description: "Wähle das Erscheinungsbild der Anwendung",
        enabled: true,
        type: "select",
        options: ["System", "Hell", "Dunkel"],
        value: "System",
        category: "appearance"
      },
      {
        id: "compactMode",
        name: "Kompakter Modus",
        description: "Reduziere Abstände und Größen für mehr Inhalte",
        enabled: false,
        type: "toggle",
        category: "appearance"
      },
      
      // Notification settings
      {
        id: "emailNotifications",
        name: "E-Mail-Benachrichtigungen",
        description: "Erhalte Updates und Benachrichtigungen per E-Mail",
        enabled: true,
        type: "toggle",
        category: "notifications"
      },
      {
        id: "reminderFrequency",
        name: "Erinnerungen",
        description: "Wie oft möchtest du Erinnerungen erhalten?",
        enabled: true,
        type: "select",
        options: ["Täglich", "Wöchentlich", "Monatlich", "Nie"],
        value: "Wöchentlich",
        category: "notifications"
      },
      {
        id: "pushNotifications",
        name: "Push-Benachrichtigungen",
        description: "Erhalte Echtzeit-Updates im Browser",
        enabled: true,
        type: "toggle",
        category: "notifications"
      },
      
      // Privacy settings
      {
        id: "dataSharing",
        name: "Datenfreigabe",
        description: "Teile anonymisierte Nutzungsdaten für Verbesserungen",
        enabled: false,
        type: "toggle",
        category: "privacy"
      },
      {
        id: "profileVisibility",
        name: "Profil-Sichtbarkeit",
        description: "Wer kann dein Profil sehen?",
        enabled: true,
        type: "select",
        options: ["Alle", "Nur Dozenten", "Niemand"],
        value: "Alle",
        category: "privacy"
      },
      
      // Account settings
      {
        id: "language",
        name: "Sprache",
        description: "Wähle die Sprache der Anwendung",
        enabled: true,
        type: "select",
        options: ["Deutsch", "Englisch"],
        value: "Deutsch",
        category: "account"
      },
      {
        id: "timezone",
        name: "Zeitzone",
        description: "Wähle deine lokale Zeitzone",
        enabled: true,
        type: "select",
        options: ["Berlin (GMT+1)", "London (GMT+0)", "New York (GMT-5)"],
        value: "Berlin (GMT+1)",
        category: "account"
      },
    ];
    
    setSettings(mockSettings);
  }, []);

  const handleUpdateSetting = (id: string, value: boolean | string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === id 
          ? { ...setting, enabled: typeof value === 'boolean' ? value : setting.enabled, value: typeof value === 'string' ? value : setting.value }
          : setting
      )
    );
    
    toast({
      title: "Einstellung aktualisiert",
      description: "Deine Änderungen wurden gespeichert.",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "appearance":
        return <Palette className="h-5 w-5" />;
      case "notifications":
        return <Bell className="h-5 w-5" />;
      case "privacy":
        return <Shield className="h-5 w-5" />;
      case "account":
        return <UserIcon className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const renderSettingControl = (setting: UserSetting) => {
    if (setting.type === "toggle") {
      return (
        <Switch
          checked={setting.enabled}
          onCheckedChange={(value) => handleUpdateSetting(setting.id, value)}
        />
      );
    }
    
    if (setting.type === "select" && setting.options) {
      return (
        <Select
          value={setting.value}
          onValueChange={(value) => handleUpdateSetting(setting.id, value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={setting.value} />
          </SelectTrigger>
          <SelectContent>
            {setting.options.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    if (setting.type === "input") {
      return (
        <Input
          value={setting.value}
          onChange={(e) => handleUpdateSetting(setting.id, e.target.value)}
          className="max-w-[300px]"
        />
      );
    }
    
    return null;
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Einstellungen</h1>
        <p className="text-muted-foreground">
          Passe die Anwendung an deine Bedürfnisse an
        </p>
      </div>
      
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appearance">Erscheinungsbild</TabsTrigger>
          <TabsTrigger value="notifications">Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="account">Konto</TabsTrigger>
          <TabsTrigger value="privacy">Datenschutz</TabsTrigger>
        </TabsList>
        
        {["appearance", "notifications", "account", "privacy"].map(category => (
          <TabsContent value={category} key={category} className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <CardTitle className="capitalize">
                    {category === "appearance" && "Erscheinungsbild"}
                    {category === "notifications" && "Benachrichtigungen"}
                    {category === "account" && "Konto"}
                    {category === "privacy" && "Datenschutz"}
                  </CardTitle>
                </div>
                <CardDescription>
                  {category === "appearance" && "Passe das Erscheinungsbild der Anwendung an"}
                  {category === "notifications" && "Verwalte deine Benachrichtigungen"}
                  {category === "account" && "Verwalte deine Kontoeinstellungen"}
                  {category === "privacy" && "Verwalte deine Datenschutzeinstellungen"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {settings
                  .filter(setting => setting.category === category)
                  .map(setting => (
                    <div key={setting.id} className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor={setting.id}>{setting.name}</Label>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                        {renderSettingControl(setting)}
                      </div>
                      <Separator className="my-4" />
                    </div>
                  ))
                }
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Gefährliche Zone</CardTitle>
          <CardDescription>
            Diese Aktionen können nicht rückgängig gemacht werden
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alle Daten löschen</p>
              <p className="text-sm text-muted-foreground">Lösche alle deine Daten und Fortschritte</p>
            </div>
            <Button variant="destructive" onClick={() => 
              toast({
                title: "Warnung",
                description: "Diese Funktion ist in der Demo-Version nicht verfügbar.",
                variant: "destructive"
              })
            }>
              Daten löschen
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account löschen</p>
              <p className="text-sm text-muted-foreground">Lösche deinen Account dauerhaft</p>
            </div>
            <Button variant="destructive" onClick={() => 
              toast({
                title: "Warnung",
                description: "Diese Funktion ist in der Demo-Version nicht verfügbar.",
                variant: "destructive"
              })
            }>
              Account löschen
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
