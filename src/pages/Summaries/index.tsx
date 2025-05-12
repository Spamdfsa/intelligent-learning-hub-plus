
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Calendar, Download } from "lucide-react";

interface Summary {
  id: string;
  title: string;
  content: string;
  course: string;
  createdAt: Date;
  module?: string;
}

const SummariesPage = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [activeSummary, setActiveSummary] = useState<Summary | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Get summaries from localStorage
    const storedSummaries = localStorage.getItem("lms-summaries");
    let loadedSummaries: Summary[] = [];
    
    if (storedSummaries) {
      loadedSummaries = JSON.parse(storedSummaries);
    }
    
    // Add mock summaries only if no summaries exist
    if (loadedSummaries.length === 0) {
      const mockSummaries = [
        {
          id: "1",
          title: "Grundlagen der Informatik",
          content: `# Grundlagen der Informatik\n\nDie Informatik befasst sich mit der automatischen Verarbeitung von Informationen. Sie umfasst sowohl theoretische als auch praktische Aspekte der Datenverarbeitung. Zentrale Konzepte sind Algorithmen (Verfahren zur Lösung von Problemen), Datenstrukturen (Organisationsformen für Daten) und Programmiersprachen (formale Sprachen zur Formulierung von Algorithmen).\n\nWichtige Teilgebiete:\n- Theoretische Informatik: Automatentheorie, Berechenbarkeitstheorie, Komplexitätstheorie\n- Praktische Informatik: Programmierung, Softwareentwicklung, Datenbanken\n- Technische Informatik: Rechnerarchitektur, Betriebssysteme, Netzwerke\n\nDie Bedeutung der Informatik erstreckt sich heute auf nahezu alle Lebensbereiche, von der Kommunikation über die Medizin bis hin zur Wirtschaft.`,
          course: "Einführung in die Informatik",
          createdAt: new Date(2025, 3, 15),
          module: "Modul 1: Grundlagen"
        },
        {
          id: "2",
          title: "Objektorientierte Programmierung",
          content: `# Objektorientierte Programmierung\n\nDie objektorientierte Programmierung (OOP) ist ein Programmierparadigma, das auf dem Konzept von "Objekten" basiert, die Daten und Verhalten kombinieren. Die Grundprinzipien der OOP sind:\n\n1. **Kapselung**: Daten und Methoden werden in Objekten zusammengefasst, wobei der interne Zustand vor externem Zugriff geschützt ist.\n\n2. **Vererbung**: Neue Klassen können von vorhandenen Klassen abgeleitet werden und deren Eigenschaften und Methoden erben.\n\n3. **Polymorphismus**: Objekte können in verschiedenen Formen auftreten, abhängig vom Kontext.\n\n4. **Abstraktion**: Komplexe Details werden verborgen, und nur relevante Funktionen werden nach außen zugänglich gemacht.\n\nBeispiele für objektorientierte Programmiersprachen sind Java, C++, Python und C#.`,
          course: "Einführung in die Informatik",
          createdAt: new Date(2025, 3, 20),
          module: "Modul 2: Fortgeschrittene Konzepte"
        },
        {
          id: "3",
          title: "Relationale Datenbanken",
          content: `# Relationale Datenbanken\n\nRelationale Datenbanken organisieren Daten in Tabellen (Relationen) mit Zeilen und Spalten. Jede Zeile repräsentiert einen Datensatz, und jede Spalte repräsentiert ein Attribut des Datensatzes. Die Structured Query Language (SQL) dient zur Verwaltung und Abfrage relationaler Datenbanken.\n\nSchlüsselkonzepte:\n\n1. **Primärschlüssel**: Ein eindeutiger Identifikator für jeden Datensatz.\n\n2. **Fremdschlüssel**: Ein Feld, das auf einen Primärschlüssel in einer anderen Tabelle verweist und so Beziehungen zwischen Tabellen herstellt.\n\n3. **Normalisierung**: Ein Prozess zur Minimierung von Datenredundanz und Verbesserung der Datenintegrität.\n\n4. **Transaktionen**: Eine Folge von Datenbankoperationen, die als eine Einheit betrachtet werden.\n\nBeispiele für relationale Datenbankmanagementsysteme sind MySQL, PostgreSQL, Oracle und Microsoft SQL Server.`,
          course: "Datenbanksysteme",
          createdAt: new Date(2025, 4, 5),
          module: "Modul 1: Grundlagen"
        }
      ];
      
      loadedSummaries = mockSummaries;
      // Store mock summaries
      localStorage.setItem("lms-summaries", JSON.stringify(mockSummaries));
    }
    
    setSummaries(loadedSummaries);
  }, []);

  const filteredSummaries = summaries.filter(summary => 
    summary.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    summary.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (summary.module && summary.module.toLowerCase().includes(searchQuery.toLowerCase())) ||
    summary.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDownloadPDF = (summary: Summary) => {
    // In a real application, this would generate and download a PDF
    alert(`PDF für "${summary.title}" würde jetzt heruntergeladen werden.`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Zusammenfassungen</h1>
      <p className="text-muted-foreground">
        Alle KI-generierten Zusammenfassungen deiner Kursinhalte an einem Ort.
      </p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Durchsuche alle Zusammenfassungen..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSummaries.length > 0 ? (
          filteredSummaries.map(summary => (
            <Card key={summary.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveSummary(summary)}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{summary.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{summary.course}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(summary.createdAt)}</span>
                  </div>
                </div>
                <p className="text-sm line-clamp-3 mb-3">
                  {summary.content.replace(/[#*_]/g, '').substring(0, 150)}...
                </p>
                <Button size="sm" variant="outline" className="w-full">
                  Zusammenfassung anzeigen
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-muted p-6">
              <BookOpen className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Keine Zusammenfassungen gefunden</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Es wurden keine Zusammenfassungen gefunden, die zu deiner Suche passen.
            </p>
          </div>
        )}
      </div>

      {activeSummary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">{activeSummary.title}</h2>
              <Button variant="outline" size="sm" onClick={() => setActiveSummary(null)}>
                Schließen
              </Button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>{activeSummary.course}</span>
                {activeSummary.module && (
                  <span>• {activeSummary.module}</span>
                )}
                <span>• {formatDate(activeSummary.createdAt)}</span>
              </div>
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-base">{activeSummary.content}</pre>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <Button onClick={() => handleDownloadPDF(activeSummary)}>
                <Download className="mr-2 h-4 w-4" />
                Als PDF herunterladen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummariesPage;
