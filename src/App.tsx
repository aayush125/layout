import "./App.css";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Notes from "./pages/Notes";
import TopNav from "./components/layout/TopNav";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import { useState } from "react";
import NotificationPopup from "./components/NotificationPopup";

function App() {
  const { loading } = useAuth();
  const [showNotification, setShowNotification] = useState(false);

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
