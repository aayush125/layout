import { FaChevronCircleRight } from "react-icons/fa";
import Carousel from "../components/Carousel";
import { handleSignIn } from "../components/layout/TopNav";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/notes");
    }
  }, [user, navigate]);

  return (
    <>
      <div className="mt-4 h-screen w-full fixed">
        <Carousel
          items={[
            { id: 1, image: "screenshots/notes.png", title: "Notes" },
            { id: 2, image: "screenshots/edit_notes.png", title: "Tasks" },
            { id: 3, image: "screenshots/tasks.png", title: "Tasks" },
            { id: 4, image: "screenshots/edit_task.png", title: "Notes" },
            { id: 5, image: "screenshots/detailed_tasks.png", title: "Tasks" },
            { id: 6, image: "screenshots/tag.png", title: "Tasks" },
          ]}
        />
        <div className="mt-8 flex justify-center items-center">
          <span className="font-semibold text-2xl mr-4">
            Sign in to start being organized
          </span>
          <button
            onClick={handleSignIn}
            className="hover:opacity-75 transition-opacity duration-200"
          >
            <FaChevronCircleRight size={22} />
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;
