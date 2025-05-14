import { Course } from "@/types";

// Helper function to ensure all modules have the required properties
const ensureModuleProperties = (modules: any[], courseId: string) => {
  return modules.map((module, index) => {
    return {
      ...module,
      course_id: module.course_id || courseId,
      order: module.order !== undefined ? module.order : index + 1
    };
  });
};

export const mockCourses: Course[] = [
  {
    id: "course-1",
    title: "Einführung in die Informatik",
    description: "Ein umfassender Kurs, der die Grundlagen der Informatik und Programmierung abdeckt.",
    instructor: "Prof. Dr. Schmidt",
    instructorId: "1",
    instructor_id: "1", // Adding this to match the interface
    created_at: "2024-01-01", // Adding this to match the interface
    bannerColor: "blue",
    enrolledStudents: 128,
    progress: 75,
    category: "Informatik",
    level: "Beginner",
    duration: "8 Wochen",
    modules: ensureModuleProperties([
      {
        id: "module-1-1",
        title: "Einführung in Algorithmen",
        description: "Grundlegende Konzepte der Algorithmen und Problemlösung.",
        course_id: "course-1", // Already has this property
        order: 1, // Already has this property
        tasks: [
          {
            id: "task-1-1-1",
            title: "Was sind Algorithmen?",
            type: "reading",
            completed: true,
            description: "Algorithmen sind Schritt-für-Schritt-Anweisungen zur Lösung eines Problems. Sie bestehen aus einer endlichen Folge von wohldefinierten Anweisungen und bilden die Grundlage der Informatik. In dieser Lektion lernen Sie die grundlegenden Konzepte von Algorithmen und wie sie unser tägliches Leben beeinflussen.",
            course: "course-1", // Adding course reference
            status: "graded", // Adding default status
            dueDate: "2025-04-15", // Adding default dueDate
            createdAt: new Date("2024-03-01"), // Adding default createdAt
          },
          {
            id: "task-1-1-2",
            title: "Algorithmen im Alltag",
            type: "video",
            completed: true,
            description: "Dieses Video zeigt, wie Algorithmen in alltäglichen Situationen Anwendung finden - von Navigationsapps bis hin zu Social-Media-Feeds.",
            course: "course-1", // Adding course reference
            status: "graded", // Adding default status
            dueDate: "2025-04-18", // Adding default dueDate
            createdAt: new Date("2024-03-02"), // Adding default createdAt
          },
          {
            id: "task-1-1-3",
            title: "Quiz zu Algorithmen",
            type: "quiz",
            completed: true,
            description: "Testen Sie Ihr Verständnis der grundlegenden Algorithmenkonzepte mit diesem Quiz.",
            course: "course-1", // Adding course reference
            status: "graded", // Adding default status
            dueDate: "2025-04-20", // Adding default dueDate
            createdAt: new Date("2024-03-05"), // Adding default createdAt
            questions: [
              {
                id: "q-1-1-3-1",
                question: "Was ist die Haupteigenschaft eines Algorithmus?",
                options: [
                  "Er muss in Python geschrieben sein",
                  "Er muss eine endliche Anzahl von Schritten haben",
                  "Er muss auf einem Computer laufen",
                  "Er muss mathematische Formeln enthalten"
                ],
                correctOption: 1,
                answerType: "multiple-choice"
              },
              {
                id: "q-1-1-3-2",
                question: "Wofür steht die Zeitkomplexität eines Algorithmus?",
                options: [
                  "Wie lange es dauert, den Algorithmus zu programmieren",
                  "Wie viel Speicher der Algorithmus benötigt",
                  "Wie die Laufzeit mit der Eingabegröße wächst",
                  "Das Alter des Algorithmus in der Informatikgeschichte"
                ],
                correctOption: 2,
                answerType: "multiple-choice"
              }
            ]
          },
          {
            id: "task-1-1-4",
            title: "Einfache Algorithmen implementieren",
            type: "assignment",
            completed: false,
            dueDate: "2025-05-20",
            description: "Implementieren Sie die folgenden Algorithmen in einer Programmiersprache Ihrer Wahl: Lineares Suchen, Binäres Suchen, Bubble Sort.",
            course: "course-1", // Adding course reference
            status: "pending", // Adding default status
            createdAt: new Date("2024-03-10"), // Adding default createdAt
          },
        ],
      },
      {
        id: "module-1-2",
        title: "Datenstrukturen",
        description: "Einführung in grundlegende Datenstrukturen und deren Anwendungen.",
        course_id: "course-1", // Already has this property
        order: 2, // Already has this property
        tasks: [
          {
            id: "task-1-2-1",
            title: "Arrays und Listen",
            type: "reading",
            completed: true,
            description: "Arrays und Listen sind fundamentale Datenstrukturen, die eine Sammlung von Elementen speichern. Dieser Artikel beschreibt ihre Eigenschaften, Unterschiede und typische Anwendungsfälle.",
            course: "course-1", // Adding course reference
            status: "graded", // Adding default status
            dueDate: "2025-04-25", // Adding default dueDate
            createdAt: new Date("2024-03-15"), // Adding default createdAt
          },
          {
            id: "task-1-2-2",
            title: "Einsatz von Datenstrukturen",
            type: "video",
            completed: false,
            description: "Dieses Video erklärt, wie verschiedene Datenstrukturen in realen Szenarien eingesetzt werden und welche Vor- und Nachteile sie bieten.",
            course: "course-1", // Adding course reference
            status: "pending", // Adding default status
            dueDate: "2025-04-28", // Adding default dueDate
            createdAt: new Date("2024-03-18"), // Adding default createdAt
          },
          {
            id: "task-1-2-3",
            title: "Quiz zu Datenstrukturen",
            type: "quiz",
            completed: false,
            description: "Überprüfen Sie Ihr Wissen zu den verschiedenen Datenstrukturen mit diesem Quiz.",
            course: "course-1", // Adding course reference
            status: "pending", // Adding default status
            dueDate: "2025-05-02", // Adding default dueDate
            createdAt: new Date("2024-03-20"), // Adding default createdAt
            questions: [
              {
                id: "q-1-2-3-1",
                question: "Welche Datenstruktur bietet konstante Zugriffszeit für Elemente?",
                options: [
                  "Verkettete Liste",
                  "Array",
                  "Binärbaum",
                  "Hashtabelle"
                ],
                correctOption: 1,
                answerType: "multiple-choice"
              },
              {
                id: "q-1-2-3-2",
                question: "Was ist ein Hauptvorteil einer verketteten Liste gegenüber einem Array?",
                options: [
                  "Schnellerer Zugriff auf Elemente",
                  "Dynamische Größe",
                  "Bessere Cache-Lokalität",
                  "Weniger Speicherverbrauch"
                ],
                correctOption: 1,
                answerType: "multiple-choice"
              }
            ]
          },
        ],
      },
    ], "course-1"),
  },
  {
    id: "course-2",
    title: "Datenbanksysteme",
    description: "Erlernen Sie die Grundlagen von Datenbanksystemen und SQL.",
    instructor: "Dr. Müller",
    instructorId: "2",
    instructor_id: "2", // Adding this to match the interface
    created_at: "2024-01-15", // Adding this to match the interface
    bannerColor: "green",
    enrolledStudents: 95,
    progress: 35,
    category: "Datenbanken",
    level: "Intermediate",
    duration: "10 Wochen",
    modules: ensureModuleProperties([
      {
        id: "module-2-1",
        title: "Grundlagen relationaler Datenbanken",
        description: "Einführung in die Konzepte relationaler Datenbanken.",
        tasks: [
          {
            id: "task-2-1-1",
            title: "Das relationale Modell",
            type: "reading",
            completed: true,
            description: "Das relationale Modell ist ein Ansatz zur Verwaltung von Daten mit Beziehungen. Diese Lektion erklärt die Grundprinzipien, Tabellen, Beziehungen und die Bedeutung von Schlüsseln.",
            course: "course-2",
            status: "graded",
            dueDate: "2025-05-05",
            createdAt: new Date("2024-03-25"),
          },
          {
            id: "task-2-1-2",
            title: "Entitäten und Beziehungen",
            type: "video",
            completed: true,
            description: "Dieses Video erklärt Entity-Relationship-Modelle (ER-Modelle) und wie sie zur Planung von Datenbankstrukturen verwendet werden.",
            course: "course-2",
            status: "graded",
            dueDate: "2025-05-08",
            createdAt: new Date("2024-03-28"),
          },
          {
            id: "task-2-1-3",
            title: "Normalisierung verstehen",
            type: "reading",
            completed: false,
            description: "Normalisierung ist ein Prozess zur Organisation von Daten in Datenbanken, um Redundanz zu reduzieren und die Datenkonsistenz zu verbessern. In dieser Lektion werden die Normalformen 1NF bis 3NF erklärt.",
            course: "course-2",
            status: "pending",
            dueDate: "2025-05-12",
            createdAt: new Date("2024-04-01"),
          },
          {
            id: "task-2-1-4",
            title: "Quiz zu relationalen Datenbanken",
            type: "quiz",
            completed: false,
            description: "Überprüfen Sie Ihr Verständnis der grundlegenden Konzepte relationaler Datenbanken.",
            course: "course-2",
            status: "pending",
            dueDate: "2025-05-15",
            createdAt: new Date("2024-04-05"),
            questions: [
              {
                id: "q-2-1-4-1",
                question: "Was ist ein Primärschlüssel?",
                options: [
                  "Das erste Feld in einer Tabelle",
                  "Ein Feld, das eindeutige Werte für jede Zeile garantiert",
                  "Die Haupteingabemethode für Datenbankabfragen",
                  "Ein Schlüssel, der von der Datenbank automatisch erstellt wird"
                ],
                correctOption: 1,
                answerType: "multiple-choice"
              },
              {
                id: "q-2-1-4-2",
                question: "Was beschreibt eine Eins-zu-Viele-Beziehung?",
                options: [
                  "Ein Datensatz in Tabelle A ist mit genau einem Datensatz in Tabelle B verbunden",
                  "Ein Datensatz in Tabelle A ist mit mehreren Datensätzen in Tabelle B verbunden",
                  "Mehrere Datensätze in Tabelle A sind mit mehreren Datensätzen in Tabelle B verbunden",
                  "Es gibt keine Verbindung zwischen den Tabellen"
                ],
                correctOption: 1,
                answerType: "multiple-choice"
              }
            ]
          },
        ],
      },
      {
        id: "module-2-2",
        title: "SQL Grundlagen",
        description: "Einführung in die SQL-Abfragesprache.",
        tasks: [
          {
            id: "task-2-2-1",
            title: "SELECT-Anweisungen",
            type: "reading",
            completed: false,
            description: "SELECT-Anweisungen sind der Grundbaustein für das Abrufen von Daten aus SQL-Datenbanken. Diese Lektion erklärt die Syntax und verschiedene Optionen für Datenabfragen.",
            course: "course-2",
            status: "pending",
            dueDate: "2025-05-18",
            createdAt: new Date("2024-04-10"),
          },
          {
            id: "task-2-2-2",
            title: "SQL-Übungen",
            type: "assignment",
            completed: false,
            dueDate: "2025-05-25",
            description: "Führen Sie die folgenden SQL-Abfragen aus und interpretieren Sie die Ergebnisse. Die Übungen umfassen SELECT, WHERE, JOIN und GROUP BY-Anweisungen.",
            course: "course-2",
            status: "pending",
            createdAt: new Date("2024-04-15"),
          },
          {
            id: "task-2-2-3",
            title: "Datenbankabfragen optimieren",
            type: "video",
            completed: false,
            description: "Dieses Video zeigt Techniken zur Optimierung von SQL-Abfragen für bessere Performance, einschließlich Index-Nutzung und Query-Planung.",
            course: "course-2",
            status: "pending",
            dueDate: "2025-05-28",
            createdAt: new Date("2024-04-18"),
          }
        ],
      },
    ], "course-2"),
  },
  {
    id: "course-3",
    title: "Machine Learning Grundlagen",
    description: "Einführung in maschinelles Lernen und künstliche Intelligenz.",
    instructor: "Prof. Dr. Becker",
    instructorId: "3",
    instructor_id: "3", // Adding this
    created_at: "2024-01-30", // Adding this
    bannerColor: "purple",
    enrolledStudents: 210,
    progress: 15,
    category: "Künstliche Intelligenz",
    level: "Intermediate",
    duration: "12 Wochen",
    modules: ensureModuleProperties([
      {
        id: "module-3-1",
        title: "Einführung in Machine Learning",
        description: "Grundlegende Konzepte des maschinellen Lernens.",
        tasks: [
          {
            id: "task-3-1-1",
            title: "Was ist maschinelles Lernen?",
            type: "reading",
            completed: true,
            description: "Maschinelles Lernen ist ein Teilbereich der künstlichen Intelligenz, bei dem Systeme aus Daten lernen, ohne explizit programmiert zu werden. Diese Lektion gibt einen Überblick über die Geschichte, Anwendungen und grundlegenden Konzepte.",
            course: "course-3", // Adding these required fields to satisfy TypeScript
            status: "graded",
            dueDate: "2025-05-05",
            createdAt: new Date("2024-03-01"),
          },
          {
            id: "task-3-1-2",
            title: "Überwachtes vs. unüberwachtes Lernen",
            type: "video",
            completed: false,
            description: "Dieses Video erklärt die Unterschiede zwischen den beiden Hauptkategorien des maschinellen Lernens: überwachtes und unüberwachtes Lernen, sowie deren typische Anwendungen.",
            course: "course-3", // Adding course reference
            status: "pending",
            dueDate: "2025-05-08",
            createdAt: new Date("2024-03-04"),
          },
          {
            id: "task-3-1-3",
            title: "Datenaufbereitung für ML",
            type: "reading",
            completed: false,
            description: "Die Qualität der Daten ist entscheidend für den Erfolg von Machine Learning-Modellen. Diese Lektion behandelt Techniken zur Datenreinigung, -transformation und -normalisierung.",
            course: "course-3", // Adding course reference
            status: "pending",
            dueDate: "2025-05-12",
            createdAt: new Date("2024-03-07"),
          },
          {
            id: "task-3-1-4",
            title: "Quiz zu Machine Learning-Grundlagen",
            type: "quiz",
            completed: false,
            description: "Überprüfen Sie Ihr Verständnis der Machine Learning-Grundlagen.",
            course: "course-3", // Adding course reference
            status: "pending",
            dueDate: "2025-05-15",
            createdAt: new Date("2024-03-10"),
            questions: [
              {
                id: "q-3-1-4-1",
                question: "Was ist ein Beispiel für überwachtes Lernen?",
                options: [
                  "K-Means Clustering",
                  "Principal Component Analysis",
                  "Entscheidungsbäume mit gelabelten Daten",
                  "Autoencoders"
                ],
                correctOption: 2,
                answerType: "multiple-choice"
              },
              {
                id: "q-3-1-4-2",
                question: "Was ist Overfitting?",
                options: [
                  "Wenn ein Modell zu viele Trainingsdaten hat",
                  "Wenn ein Modell zu komplex ist und nur die Trainingsdaten gut vorhersagt",
                  "Wenn ein Modell zu einfach ist und keine Muster erkennt",
                  "Wenn ein Modell mehrere Epochen trainiert wird"
                ],
                correctOption: 1,
                answerType: "multiple-choice"
              }
            ]
          },
        ],
      },
      {
        id: "module-3-2",
        title: "Neural Networks und Deep Learning",
        description: "Grundlagen neuronaler Netze und Deep Learning-Techniken.",
        tasks: [
          {
            id: "task-3-2-1",
            title: "Aufbau neuronaler Netze",
            type: "reading",
            completed: false,
            description: "Diese Lektion erklärt die Struktur neuronaler Netze, einschließlich Neuronen, Schichten, Aktivierungsfunktionen und Backpropagation.",
            course: "course-3",
            status: "pending",
            dueDate: "2025-05-20",
            createdAt: new Date("2024-03-15"),
          },
          {
            id: "task-3-2-2",
            title: "Deep Learning Frameworks",
            type: "video",
            completed: false,
            description: "Ein Überblick über populäre Deep Learning Frameworks wie TensorFlow, PyTorch und Keras, ihre Vor- und Nachteile sowie typische Anwendungsfälle.",
            course: "course-3",
            status: "pending",
            dueDate: "2025-05-23",
            createdAt: new Date("2024-03-18"),
          },
          {
            id: "task-3-2-3",
            title: "Einfaches neuronales Netz implementieren",
            type: "assignment",
            completed: false,
            dueDate: "2025-05-28",
            description: "Implementieren Sie ein einfaches neuronales Netz zur Bilderkennung mit einem Framework Ihrer Wahl und trainieren Sie es mit dem MNIST-Datensatz.",
            course: "course-3",
            status: "pending",
            createdAt: new Date("2024-03-20"),
          },
        ],
      },
    ], "course-3"),
  },
  {
    id: "course-4",
    title: "Web-Entwicklung",
    description: "Lernen Sie moderne Webentwicklung mit HTML, CSS und JavaScript.",
    instructor: "Sarah Wagner",
    instructorId: "4",
    instructor_id: "4", // Adding this to match the interface
    created_at: "2024-01-20", // Adding this to match the interface
    bannerColor: "orange",
    enrolledStudents: 175,
    progress: 50,
    category: "Webentwicklung",
    level: "Beginner",
    duration: "8 Wochen",
    modules: ensureModuleProperties([
      {
        id: "module-4-1",
        title: "HTML und CSS Grundlagen",
        description: "Die Basis der Webentwicklung verstehen.",
        tasks: [
          {
            id: "task-4-1-1",
            title: "HTML-Struktur",
            type: "reading",
            completed: true,
            description: "HTML ist die Grundsprache des Webs. Diese Lektion behandelt grundlegende Tags, Dokumentstruktur und semantisches HTML5.",
            course: "course-4", // Adding course reference
            status: "graded",
            dueDate: "2025-04-15",
            createdAt: new Date("2024-03-01"),
          },
          {
            id: "task-4-1-2",
            title: "CSS-Styling",
            type: "video",
            completed: true,
            description: "Dieses Video zeigt, wie CSS verwendet wird, um Webseiten zu gestalten, einschließlich Selektoren, Box-Modell und Responsive Design.",
            course: "course-4", // Adding course reference
            status: "graded",
            dueDate: "2025-04-18",
            createdAt: new Date("2024-03-02"),
          },
          {
            id: "task-4-1-3",
            title: "Flexbox und Grid",
            type: "reading",
            completed: false,
            description: "Moderne CSS-Layout-Techniken mit Flexbox und CSS Grid für responsive und komplexe Layouts.",
            course: "course-4", // Adding course reference
            status: "pending",
            dueDate: "2025-04-25",
            createdAt: new Date("2024-03-05"),
          },
          {
            id: "task-4-1-4",
            title: "Einfache Webseite erstellen",
            type: "assignment",
            completed: false,
            dueDate: "2025-05-15",
            description: "Erstellen Sie eine persönliche Portfolio-Webseite mit HTML und CSS unter Verwendung von Flexbox oder Grid für das Layout.",
            course: "course-4", // Adding course reference
            status: "pending",
            createdAt: new Date("2024-03-10"),
          },
        ],
      },
      {
        id: "module-4-2",
        title: "JavaScript Grundlagen",
        description: "Einführung in JavaScript und DOM-Manipulation.",
        tasks: [
          {
            id: "task-4-2-1",
            title: "JavaScript Syntax",
            type: "reading",
            completed: false,
            description: "Diese Lektion führt in die grundlegende Syntax von JavaScript ein, einschließlich Variablen, Datentypen, Funktionen und Kontrollstrukturen.",
            course: "course-4", // Adding course reference
            status: "pending",
            dueDate: "2025-04-25",
            createdAt: new Date("2024-03-15"),
          },
          {
            id: "task-4-2-2",
            title: "DOM-Manipulation",
            type: "video",
            completed: false,
            description: "Dieses Video erklärt, wie JavaScript verwendet wird, um HTML-Elemente dynamisch zu ändern, zu erstellen und zu entfernen.",
            course: "course-4", // Adding course reference
            status: "pending",
            dueDate: "2025-04-28",
            createdAt: new Date("2024-03-18"),
          },
          {
            id: "task-4-2-3",
            title: "Quiz zu JavaScript",
            type: "quiz",
            completed: false,
            description: "Testen Sie Ihre JavaScript-Kenntnisse mit diesem Quiz.",
            course: "course-4", // Adding course reference
            status: "pending",
            dueDate: "2025-05-02",
            createdAt: new Date("2024-03-20"),
            questions: [
              {
                id: "q-4-2-3-1",
                question: "Was ist der Unterschied zwischen let und var in JavaScript?",
                options: [
                  "Es gibt keinen Unterschied",
                  "let hat Block-Scope, var hat Funktions-Scope",
                  "var ist moderner als let",
                  "let kann nur für Zahlen verwendet werden"
                ],
                correctOption: 1,
                answerType: "multiple-choice"
              },
              {
                id: "q-4-2-3-2",
                question: "Was ist Closure in JavaScript?",
                options: [
                  "Eine Methode zum Schließen von Browserfenstern",
                  "Eine Funktion, die auf Variablen außerhalb ihres Scopes zugreifen kann",
                  "Ein Framework für die Frontendentwicklung",
                  "Ein Fehlerbehandlungsmechanismus"
                ],
                correctOption: 1,
                answerType: "multiple-choice"
              }
            ]
          },
        ],
      },
    ], "course-4"),
  },
  {
    id: "course-5",
    title: "Fortgeschrittende Programmierung",
    description: "Vertiefen Sie Ihre Programmierkenntnisse mit fortgeschrittenen Konzepten.",
    instructor: "Dr. Fischer",
    instructorId: "5",
    instructor_id: "5", // Adding this to match the interface
    created_at: "2024-01-25", // Adding this to match the interface
    bannerColor: "red",
    enrolledStudents: 63,
    category: "Programmierung",
    level: "Advanced",
    duration: "10 Wochen",
    modules: ensureModuleProperties([
      {
        id: "module-5-1",
        title: "Objektorientierte Programmierung",
        description: "Fortgeschrittene OOP-Konzepte und Design Patterns.",
        tasks: [
          {
            id: "task-5-1-1",
            title: "Design Patterns",
            type: "reading",
            completed: false,
            description: "Ein Überblick über gängige Design Patterns wie Factory, Singleton, Observer und ihre Anwendungen in der Softwareentwicklung.",
            course: "course-5", 
            status: "pending",
            dueDate: "2025-05-10",
            createdAt: new Date("2024-04-01"),
          },
          {
            id: "task-5-1-2",
            title: "SOLID-Prinzipien",
            type: "video",
            completed: false,
            description: "Dieses Video erklärt die fünf SOLID-Prinzipien der objektorientierten Programmierung und wie sie zu besserem Code führen.",
            course: "course-5", 
            status: "pending",
            dueDate: "2025-05-15",
            createdAt: new Date("2024-04-05"),
          }
        ],
      },
      {
        id: "module-5-2",
        title: "Funktionale Programmierung",
        description: "Einführung in funktionale Programmierkonzepte.",
        tasks: [
          {
            id: "task-5-2-1",
            title: "Grundkonzepte funktionaler Programmierung",
            type: "reading",
            completed: false,
            description: "Diese Lektion behandelt Pure Functions, Immutability, Higher-Order Functions und andere grundlegende Konzepte der funktionalen Programmierung.",
            course: "course-5", 
            status: "pending",
            dueDate: "2025-05-20",
            createdAt: new Date("2024-04-10"),
          },
          {
            id: "task-5-2-2",
            title: "Funktionale Programmierung in der Praxis",
            type: "assignment",
            completed: false,
            dueDate: "2025-06-01",
            description: "Implementieren Sie eine kleine Anwendung unter Verwendung funktionaler Programmierparadigmen in einer Sprache Ihrer Wahl.",
            course: "course-5", 
            status: "pending",
            createdAt: new Date("2024-04-15"),
          }
        ],
      }
    ], "course-5"),
  },
  {
    id: "course-6",
    title: "Cybersicherheit",
    description: "Lernen Sie die Grundlagen der IT-Sicherheit und schützen Sie sich vor Cyberbedrohungen.",
    instructor: "Prof. Dr. Hoffmann",
    instructorId: "6",
    instructor_id: "6", // Adding this to match the interface
    created_at: "2024-01-30", // Adding this to match the interface
    bannerColor: "blue",
    enrolledStudents: 89,
    category: "Sicherheit",
    level: "Intermediate",
    duration: "6 Wochen",
    modules: ensureModuleProperties([
      {
        id: "module-6-1",
        title: "Grundlagen der Cybersicherheit",
        description: "Einführung in die wichtigsten Konzepte der IT-Sicherheit.",
        tasks: [
          {
            id: "task-6-1-1",
            title: "Bedrohungsmodelle verstehen",
            type: "reading",
            completed: false,
            description: "Diese Lektion behandelt verschiedene Arten von Cyberbedrohungen, Angriffsvektoren und wie man Risiken einschätzt.",
            course: "course-6", // Adding course reference
            status: "graded",
            dueDate: "2025-04-15",
            createdAt: new Date("2024-03-01"),
          },
          {
            id: "task-6-1-2",
            title: "Kryptografie-Grundlagen",
            type: "video",
            completed: false,
            description: "Ein Überblick über Verschlüsselungsmethoden, Hash-Funktionen und ihre Rolle in der IT-Sicherheit.",
            course: "course-6", // Adding course reference
            status: "graded",
            dueDate: "2025-04-18",
            createdAt: new Date("2024-03-02"),
          }
        ],
      },
      {
        id: "module-6-2",
        title: "Netzwerksicherheit",
        description: "Schutz von Netzwerken vor unbefugtem Zugriff.",
        tasks: [
          {
            id: "task-6-2-1",
            title: "Firewalls und IDS",
            type: "reading",
            completed: false,
            description: "Diese Lektion erklärt die Funktionsweise von Firewalls und Intrusion Detection Systemen zum Schutz von Netzwerken.",
            course: "course-6", // Adding course reference
            status: "pending",
            dueDate: "2025-04-25",
            createdAt: new Date("2024-03-05"),
          },
          {
            id: "task-6-2-2",
            title: "Netzwerk-Pentest durchführen",
            type: "assignment",
            completed: false,
            dueDate: "2025-06-05",
            description: "Führen Sie einen einfachen Penetrationstest auf einem kontrollierten Netzwerk durch und dokumentieren Sie Ihre Ergebnisse.",
            course: "course-6", // Adding course reference
            status: "pending",
            createdAt: new Date("2024-03-10"),
          }
        ],
      }
    ], "course-6"),
  },
  {
    id: "course-7",
    title: "Cloud Computing",
    description: "Einführung in Cloud-Technologien und deren Implementierung.",
    instructor: "Dr. Schneider",
    instructorId: "7",
    instructor_id: "7", // Adding this to match the interface
    created_at: "2024-01-35", // Adding this to match the interface
    bannerColor: "green",
    enrolledStudents: 124,
    category: "IT-Infrastruktur",
    level: "Intermediate",
    duration: "9 Wochen",
    modules: ensureModuleProperties([
      {
        id: "module-7-1",
        title: "Cloud-Grundlagen",
        description: "Einführung in Cloud-Computing-Konzepte und -Dienste.",
        tasks: [
          {
            id: "task-7-1-1",
            title: "Cloud-Servicemodelle",
            type: "reading",
            completed: false,
            description: "Diese Lektion erklärt die verschiedenen Cloud-Servicemodelle (IaaS, PaaS, SaaS) und ihre jeweiligen Anwendungsfälle.",
            course: "course-7", // Adding course reference
            status: "graded",
            dueDate: "2025-05-05",
            createdAt: new Date("2024-03-25"),
          },
          {
            id: "task-7-1-2",
            title: "Cloud-Anbieter im Vergleich",
            type: "video",
            completed: false,
            description: "Ein Überblick über die führenden Cloud-Anbieter wie AWS, Azure und Google Cloud, ihre Stärken und Unterschiede.",
            course: "course-7", // Adding course reference
            status: "graded",
            dueDate: "2025-05-08",
            createdAt: new Date("2024-03-28"),
          }
        ],
      },
      {
        id: "module-7-2",
        title: "Serverless Computing",
        description: "Entwicklung von Anwendungen ohne Serveradministration.",
        tasks: [
          {
            id: "task-7-2-1",
            title: "Serverless-Architektur",
            type: "reading",
            completed: false,
            description: "Diese Lektion behandelt die Grundlagen von Serverless-Architekturen und ihre Vor- und Nachteile gegenüber traditionellen Ansätzen.",
            course: "course-7", // Adding course reference
            status: "pending",
            dueDate: "2025-05-12",
            createdAt: new Date("2024-04-01"),
          },
          {
            id: "task-7-2-2",
            title: "Serverless-Funktion implementieren",
            type: "assignment",
            completed: false,
            dueDate: "2025-06-10",
            description: "Erstellen und implementieren Sie eine einfache Serverless-Funktion auf AWS Lambda oder einer ähnlichen Plattform.",
            course: "course-7", // Adding course reference
            status: "pending",
            createdAt: new Date("2024-04-10"),
          }
        ],
      }
    ], "course-7"),
  },
  {
    id: "course-8",
    title: "Künstliche Intelligenz in der Praxis",
    description: "Praktische Anwendungen von KI-Technologien in verschiedenen Branchen.",
    instructor: "Prof. Dr. Becker",
    instructorId: "3",
    instructor_id: "3", // Adding this to match the interface
    created_at: "2024-01-40", // Adding this to match the interface
    bannerColor: "purple",
    enrolledStudents: 157,
    category: "Künstliche Intelligenz",
    level: "Advanced",
    duration: "14 Wochen",
    modules: ensureModuleProperties([
      {
        id: "module-8-1",
        title: "Natural Language Processing",
        description: "Verarbeitung und Verständnis natürlicher Sprache durch KI.",
        tasks: [
          {
            id: "task-8-1-1",
            title: "NLP-Grundlagen",
            type: "reading",
            completed: false,
            description: "Diese Lektion führt in die Grundkonzepte des Natural Language Processing ein, einschließlich Tokenisierung, POS-Tagging und Named Entity Recognition.",
            course: "course-8", // Adding course reference
            status: "graded",
            dueDate: "2025-04-15",
            createdAt: new Date("2024-03-01"),
          },
          {
            id: "task-8-1-2",
            title: "Moderne NLP-Modelle",
            type: "video",
            completed: false,
            description: "Ein Überblick über moderne Transformer-basierte Modelle wie BERT, GPT und ihre Anwendungen.",
            course: "course-8", // Adding course reference
            status: "graded",
            dueDate: "2025-04-18",
            createdAt: new Date("2024-03-02"),
          }
        ],
      },
      {
        id: "module-8-2",
        title: "Computer Vision",
        description: "Bildverarbeitung und -erkennung mit KI-Methoden.",
        tasks: [
          {
            id: "task-8-2-1",
            title: "Grundlagen der Bildverarbeitung",
            type: "reading",
            completed: false,
            description: "Diese Lektion behandelt grundlegende Techniken der digitalen Bildverarbeitung und wie sie in Computer Vision angewendet werden.",
            course: "course-8", // Adding course reference
            status: "pending",
            dueDate: "2025-04-25",
            createdAt: new Date("2024-03-05"),
          },
          {
            id: "task-8-2-2",
            title: "Convolutional Neural Networks",
            type: "video",
            completed: false,
            description: "Eine Einführung in CNNs und ihre Architektur für Bilderkennungsaufgaben.",
            course: "course-8", // Adding course reference
            status: "pending",
            dueDate: "2025-04-28",
            createdAt: new Date("2024-03-08"),
          },
          {
            id: "task-8-2-3",
            title: "Objekterkennung implementieren",
            type: "assignment",
            completed: false,
            dueDate: "2025-06-15",
            description: "Implementieren Sie ein einfaches Objekterkennungssystem mit einem vortrainierten Modell wie YOLO oder SSD.",
            course: "course-8", // Adding course reference
            status: "pending",
            createdAt: new Date("2024-03-15"),
          }
        ],
      }
    ], "course-8"),
  },
];
