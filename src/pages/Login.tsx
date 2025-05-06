
import LoginForm from "@/components/auth/LoginForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = localStorage.getItem("lms-user");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">EduNova</h1>
          <p className="text-lg text-muted-foreground">
            Moderne Lernplattform mit KI-Unterstützung
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
