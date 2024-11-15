import { Button, Tab, Tabs, Select, SelectItem } from "@nextui-org/react";
import { MdAddTask } from "react-icons/md";
import TaskAcc from "../components/todo/TaskAcc";
import { FaTasks } from "react-icons/fa";
import AddTask from "../components/todo/AddTask";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import PersonalTasks from "../components/todo/PersonalTasks";
import TasksSidebar from "../components/todo/TasksSidebar";
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
import { GroupedTasks, Task } from "../utils/interfaces";
import Tasks from "../components/todo/Tasks";
import { Timestamp } from "firebase/firestore";
import { groupTasks, getTasksFor } from "../utils/utils";
import { useTheme } from "../contexts/ThemeContext";

const Todo = () => {
  const { darkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [assignedTasks, setAsignedTasks] = useState<Task[]>([]);
  const [personalTasks, setPersonalTasks] = useState<Task[]>([]);
  const { user } = useAuth();
  const [selectedGroup, setSelectedGroup] = useState<React.Key>("today");
  const [tasksToDisplay, setTasksToDisplay] = useState<Task[]>([]);

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
            id: doc.id,
            type: "assigned",
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
            id: doc.id,
            type: "personal",
          }));
          setPersonalTasks(fetchedTasks);
          changeDisplayedTasks(selectedGroup, fetchedTasks);
          // setGroupedTasks(groupTasks(fetchedTasks));
          // changeDisplayedTasks(selectedGroup);
        } catch (e) {
          console.error("Error fetching personal tasks:", e);
        }
      }
    };

    fetchAssignedTasks();
    fetchPersonalTasks();
  }, []);

  const onTaskDelete = async (id: string) => {
    try {
      console.log(personalTasks);
      const updatedTasks = personalTasks.filter((task) => task.id !== id);
      console.log(updatedTasks);
      setPersonalTasks(updatedTasks);
      setTasksToDisplay(updatedTasks);
      console.log("Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task: ", error);
    }
  };

  const changeDisplayedTasks = (key: React.Key, tasks: Task[] = []) => {
    setSelectedGroup(key);
    if (tasks.length == 0) {
      tasks = personalTasks;
    }
    let toDisplay = getTasksFor(key, tasks);
    setTasksToDisplay(toDisplay);
  };

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
            let id = taskRef.id;
            const taskToAppend = { ...taskToSubmit, id };
            setPersonalTasks((prevTasks) => [...prevTasks, taskToAppend]);
            let tasks = [taskToAppend, ...personalTasks];
            changeDisplayedTasks(selectedGroup, tasks);
            // if (groupedTasks) changeDisplayedTasks(selectedGroup);
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
      <div className="flex flex-col items-center justify-center">
        <div className="w-full md:w-10/12 lg:w-8/12 xl:w-6/12">
          <div className="mt-4">
            <div className="flex justify-between">
              <div className="pl-2">
                <Tabs
                  onSelectionChange={(key) => {
                    changeDisplayedTasks(key);
                  }}
                >
                  <Tab key="today" title="Today"></Tab>
                  <Tab key="pending" title="Pending"></Tab>
                  <Tab key="overdue" title="Overdue"></Tab>
                  <Tab key="completed" title="Completed"></Tab>
                </Tabs>
              </div>
            </div>
            <div className="w-full">
              <Button
                variant="bordered"
                startContent={<MdAddTask />}
                className="w-full sm:w-auto mt-3"
                onPress={openModal}
              >
                Add Task
              </Button>
              <AddTask
                isOpen={isOpen}
                onClose={closeModal}
                onSubmit={onTaskSubmit}
              />
              {tasksToDisplay.length !== 0 ? (
                <div className="flex flex-col font-normal">
                  {tasksToDisplay.map((task) => (
                    <div key={task.id} className="flex flex-row">
                      <TaskAcc task={task} onDelete={onTaskDelete} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="font-normal my-2">No tasks in this group.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/*
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
*/

export default Todo;
