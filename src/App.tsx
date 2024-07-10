import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import Todo from "./pages/Todo";
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

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }

    return () => {
      document.body.classList.remove("dark");
    };
  }, [darkMode]);

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
