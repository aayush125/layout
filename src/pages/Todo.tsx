import { Button } from "@nextui-org/react";
import { MdAddTask } from "react-icons/md";
import { FaTasks } from "react-icons/fa";
import TasksList from "../components/todo/TasksList";
import AddTask from "../components/todo/AddTask";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  addDoc,
  query,
  where,
  getDocs,
  collection,
  or,
  orderBy,
} from "firebase/firestore";
import { db } from "../utils/firebase.utils";
import { Task } from "../utils/interfaces";
import { Timestamp } from "firebase/firestore";

const Todo = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [assignedTasks, setAsignedTasks] = useState<Task[]>([]);
  const [personalTasks, setPersonalTasks] = useState<Task[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      if (user?.uid) {
        try {
          const userEmail = user.email;
          const q = query(
            collection(db, "assignedTasks"),
            or(
              where("assigned_to", "==", userEmail),
              where("assigned_by", "==", userEmail)
            )
          );

          const querySnapshot = await getDocs(q);
          const fetchedTasks: Task[] = querySnapshot.docs.map((doc) => ({
            name: doc.data().name,
            description: doc.data().description,
            priority: doc.data().priority,
            due_date: doc.data().due_date,
            complete_status: doc.data().complete_status,
            assigned_to: doc.data().assigned_to,
            assigned_by: doc.data().assigned_by,
          }));
          setAsignedTasks(fetchedTasks);
        } catch (e) {
          console.error("Error fetching assigned tasks:", e);
        }
      }
    };

    const fetchPersonalTasks = async () => {
      if (user?.uid) {
        try {
          const q = query(
            collection(db, `users/${user.uid}/tasks/`),
            orderBy("due_date", "desc")
          );
          const querySnapshot = await getDocs(q);
          const fetchedTasks: Task[] = querySnapshot.docs.map((doc) => ({
            name: doc.data().name,
            description: doc.data().description,
            priority: doc.data().priority,
            due_date: doc.data().due_date,
            complete_status: doc.data().complete_status,
          }));
          setPersonalTasks(fetchedTasks);
        } catch (e) {
          console.error("Error fetching personal tasks:", e);
        }
      }
    };

    fetchAssignedTasks();
    fetchPersonalTasks();
  }, []);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const onTaskSubmit = async (
    name: string,
    description: string,
    priority: string,
    due_date: Timestamp | null,
    complete_status: boolean,
    assigned_to: string | null
  ) => {
    if (due_date === null) {
      console.error("No due date provided!");
      return;
    }

    if (user?.uid) {
      try {
        if (!assigned_to) {
          const taskToSubmit = {
            name,
            description,
            priority,
            due_date,
            complete_status,
          };
          const taskRef = await addDoc(
            collection(db, `users/${user?.uid}/tasks`),
            taskToSubmit
          );

          if (taskRef.id) {
            console.log("Successfully submitted the task!");
            setPersonalTasks((prevTasks) => [...prevTasks, taskToSubmit]);
          } else {
            console.error("Error submitting task. Server response: ", taskRef);
          }
        } else {
          let assigned_by = user.email;
          const taskToSubmit = {
            name,
            description,
            priority,
            due_date,
            complete_status,
            assigned_to,
            assigned_by,
          };
          const taskRef = await addDoc(
            collection(db, `assignedTasks`),
            taskToSubmit
          );
          if (taskRef.id) {
            console.log("Successfully submitted the task!");
            setAsignedTasks((prevTasks) => [...prevTasks, taskToSubmit]);
          } else {
            console.error("Error submitting task. Server response: ", taskRef);
          }
        }
      } catch (e) {
        console.error("Error saving task:", e);
      }
    }
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center mt-10 w-full px-4">
        <div className="w-full md:w-10/12 lg:w-8/12 xl:w-6/12">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-4">
            <Button
              variant="bordered"
              startContent={<MdAddTask />}
              className="w-full sm:w-auto"
              onPress={openModal}
            >
              Add Task
            </Button>
            <AddTask
              isOpen={isOpen}
              onClose={closeModal}
              onSubmit={onTaskSubmit}
            />
            <Button
              variant="bordered"
              startContent={<FaTasks />}
              className="w-full sm:w-auto"
            >
              Start a new project
            </Button>
          </div>
          <h1 className="font-bold text-xl sm:text-2xl my-4">Personal tasks</h1>
          <div className="w-full">
            <TasksList tasks={personalTasks} />
          </div>
          <h1 className="font-bold text-xl sm:text-2xl my-4">Assignments</h1>
          <div className="w-full">
            <TasksList tasks={assignedTasks} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Todo;
