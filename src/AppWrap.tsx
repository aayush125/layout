import App from "./App";
import { useTheme } from "./contexts/ThemeContext";

function AppWrap() {
  const { darkMode } = useTheme();
  return (
    <main
      className={`min-h-screen ${
        darkMode ? "dark text-foreground bg-background" : ""
      }`}
    >
      <App />
    </main>
  );
}

export default AppWrap;
