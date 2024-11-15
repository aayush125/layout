import { Select, SelectItem } from "@nextui-org/select";
import { useTheme } from "../../contexts/ThemeContext";

export default function PersonalTasks() {
  const { darkMode } = useTheme();

  return (
    <>
      <div className="flex flex-row justify-center">
        <div className="w-1/12">Sidebar</div>
        <div className="w-1/2">Content</div>
      </div>
    </>
  );
}
