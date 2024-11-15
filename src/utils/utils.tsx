import { ZonedDateTime } from "@internationalized/date";
import { Timestamp } from "firebase/firestore";
import { Task, GroupedTasks } from "./interfaces";

export function formatDate(date: Date) {
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };

  return date.toLocaleString("en-US", options).replace(",", "");
}

export function toFireStoreTimestamp(zonedDateTime: ZonedDateTime): Timestamp {
  const jsDate: Date = zonedDateTime.toDate();
  return Timestamp.fromDate(jsDate);
}

export function isValidEmail(email: string) {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

export function getTasksFor(key: React.Key, tasks: Task[]): Task[] {
  let returnTasks: Task[] = [];
  let today = new Date();
  let tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);

  switch (key) {
    case "today":
      tasks.forEach((task) => {
        let taskDate = task.due_date.toDate();
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() == today.getTime() && !task.complete_status) {
          returnTasks.push(task);
        }
      });
      break;

    case "pending":
      tasks.forEach((task) => {
        let taskDate = task.due_date.toDate();
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() >= tomorrow.getTime() && !task.complete_status) {
          returnTasks.push(task);
        }
      });
      break;

    case "overdue":
      tasks.forEach((task) => {
        let taskDate = task.due_date.toDate();
        taskDate.setHours(0, 0, 0, 0);

        if (taskDate.getTime() < today.getTime() && !task.complete_status) {
          returnTasks.push(task);
        }
      });
      break;

    case "completed":
      tasks.forEach((task) => {
        if (task.complete_status == true) {
          returnTasks.push(task);
        }
      });
      break;

    default:
      console.error("Invalid key provided!");
      break;
  }

  return returnTasks;
}

export function groupTasks(tasks: Task[]): GroupedTasks {
  let today = new Date();
  let tomorrow = new Date(today);
  let yesterday = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  yesterday.setDate(yesterday.getDate() - 1);
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  let tasksToday: Task[] = [];
  let tasksPending: Task[] = [];
  let tasksOverdue: Task[] = [];

  tasks.forEach((task) => {
    let placeholder = task.due_date.toDate();
    placeholder.setHours(0, 0, 0, 0);

    if (placeholder.getTime() == today.getTime()) {
      tasksToday.push(task);
    } else if (placeholder.getTime() >= tomorrow.getTime()) {
      tasksPending.push(task);
    } else {
      tasksOverdue.push(task);
    }
  });

  return {
    pending: tasksPending,
    today: tasksToday,
    overdue: tasksOverdue,
  };
}
