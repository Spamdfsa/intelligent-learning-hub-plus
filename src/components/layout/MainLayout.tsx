
import { Outlet } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const MainLayout = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("lms-user");
    if (!user) {
      navigate("/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
