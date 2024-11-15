import { Button } from "@nextui-org/button";
import { useTheme } from "../../contexts/ThemeContext";

export default function TasksSidebar() {
  const { darkMode } = useTheme();

  return (
    <>
      <div className="my-8 flex flex-col">
        <Button variant="light">Project 1</Button>
        <Button variant="light">Project 2</Button>
      </div>
    </>
  );
}
