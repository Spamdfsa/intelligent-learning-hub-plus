
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FileText, 
  FilePlus, 
  Trash, 
  ExternalLink, 
  Download, 
  FileIcon 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { User, Material } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MaterialsPage = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Material | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get user from localStorage
    const userJson = localStorage.getItem("lms-user");
    if (userJson) {
      const userData = JSON.parse(userJson);
      setUser(userData);
    }

    // Load materials
    loadMaterials();
  }, []);

  const loadMaterials = () => {
    const materialsJson = localStorage.getItem("lms-materials");
    if (materialsJson) {
      const allMaterials = JSON.parse(materialsJson);
      setMaterials(allMaterials);
    }
  };

  const handleCreateMaterial = () => {
    navigate("/materials/create");
  };

  const handleDeleteMaterial = (material: Material) => {
    setConfirmDelete(material);
  };

  const confirmDeleteMaterial = () => {
    if (!confirmDelete) return;
    
    try {
      const updatedMaterials = materials.filter(m => m.id !== confirmDelete.id);
      localStorage.setItem("lms-materials", JSON.stringify(updatedMaterials));
      setMaterials(updatedMaterials);
      
      toast({
        title: "Material gelöscht",
        description: "Das Material wurde erfolgreich gelöscht."
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Das Material konnte nicht gelöscht werden.",
        variant: "destructive"
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'pdf': return 'PDF';
      case 'document': return 'Dokument';
      case 'video': return 'Video';
      case 'link': return 'Link';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      case 'video': return <FileText className="h-4 w-4" />;
      case 'link': return <ExternalLink className="h-4 w-4" />;
      default: return <FileIcon className="h-4 w-4" />;
    }
  };

  // Get materials created by the current user
  const userMaterials = user 
    ? materials.filter(m => m.created_by === user.id) 
    : [];

  // Get materials for courses where the user is enrolled
  const enrolledCourseMaterials = user && user.courses 
    ? materials.filter(m => user.courses!.includes(m.course_id)) 
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Kursmaterialien</h1>
          <p className="text-muted-foreground">
            Alle Lernunterlagen und Materialien für deine Kurse
          </p>
        </div>
        {user && (user.role === "lecturer" || user.role === "teacher" || user.role === "admin") && (
          <Button onClick={handleCreateMaterial}>
            <FilePlus className="mr-2 h-4 w-4" />
            Material hinzufügen
          </Button>
        )}
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Alle Materialien</TabsTrigger>
          {user && (user.role === "lecturer" || user.role === "teacher" || user.role === "admin") && (
            <TabsTrigger value="my-materials">Meine Materialien</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {enrolledCourseMaterials.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {enrolledCourseMaterials.map(material => (
                <Card key={material.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{material.title}</CardTitle>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getTypeIcon(material.type)}
                        {getTypeLabel(material.type)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {material.description}
                    </p>
                    <div className="flex justify-between gap-2">
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => window.open(material.url, "_blank")}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Öffnen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Keine Materialien verfügbar</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Für deine Kurse wurden noch keine Materialien hinzugefügt oder du hast dich noch nicht für Kurse eingeschrieben.
              </p>
            </div>
          )}
        </TabsContent>

        {user && (user.role === "lecturer" || user.role === "teacher" || user.role === "admin") && (
          <TabsContent value="my-materials" className="space-y-4 mt-4">
            {userMaterials.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userMaterials.map(material => (
                  <Card key={material.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                        <Badge variant="outline" className="flex items-center gap-1">
                          {getTypeIcon(material.type)}
                          {getTypeLabel(material.type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {material.description}
                      </p>
                      <div className="flex justify-between gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1" 
                          onClick={() => window.open(material.url, "_blank")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Öffnen
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          onClick={() => handleDeleteMaterial(material)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <h3 className="mt-4 text-lg font-medium">Keine eigenen Materialien</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Du hast noch keine Materialien erstellt. Klicke auf "Material hinzufügen", um dein erstes Material zu erstellen.
                </p>
                <Button className="mt-4" onClick={handleCreateMaterial}>
                  <FilePlus className="mr-2 h-4 w-4" />
                  Material hinzufügen
                </Button>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={(open) => !open && setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Material löschen</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du das Material "{confirmDelete?.title}" löschen möchtest?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>
              Abbrechen
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMaterial}>
              Löschen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MaterialsPage;
