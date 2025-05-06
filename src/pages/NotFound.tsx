
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-[80vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-bold">Seite nicht gefunden</h2>
      <p className="mt-2 max-w-md text-muted-foreground">
        Die angeforderte Seite existiert nicht oder ist nicht verfügbar.
      </p>
      <Button className="mt-6" onClick={() => navigate("/dashboard")}>
        Zurück zum Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
