import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Todo from "./pages/Todo";
import Teams from "./pages/Teams";
import TopNav from "./components/layout/TopNav";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import { useState, useEffect } from "react";
import NotificationPopup from "./components/NotificationPopup";
import { useTheme } from "./contexts/ThemeContext";

function App() {
  const { loading } = useAuth();
  const [showNotification, setShowNotification] = useState(false);
  const { darkMode } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const { search } = location;
    const params = new URLSearchParams(search);
    const teamId = params.get("teamId");
    const teamName = params.get("teamName");
    const joinToken = params.get("joinToken");

    // Incomplete: 'teams' feature
    if (teamId && teamName && joinToken) {
      // call to handle join team
    }

    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    return () => {
      document.body.classList.remove("dark");
    };
  }, [darkMode, location]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const handleUnauthorizedAccess = () => {
    setShowNotification(true);
  };

  return (
    <>
      <TopNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          element={
            <ProtectedRoute onUnauthorizedAccess={handleUnauthorizedAccess} />
          }
        >
          <Route path="/notes" element={<Notes />} />
          <Route path="/todo" element={<Todo />} />
          <Route path="/teams" element={<Teams />} />
        </Route>
      </Routes>
      <NotificationPopup
        message="Please sign in to access this page"
        isVisible={showNotification}
        onClose={() => setShowNotification(false)}
      />
    </>
  );
}

export default App;
