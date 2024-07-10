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

export function groupTasks(tasks: Task[]): GroupedTasks {
  let today = new Date();
  let tomorrow = new Date(today);
  let yesterday = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  yesterday.setDate(yesterday.getDate() - 1);
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);

  let tasksLater: Task[] = [];
  let tasksTomorrrow: Task[] = [];
  let tasksToday: Task[] = [];
  let tasksYesterday: Task[] = [];
  let tasksOlder: Task[] = [];

  tasks.forEach((task) => {
    let placeholder = task.due_date.toDate();
    placeholder.setHours(0, 0, 0, 0);

    if (placeholder.getTime() == today.getTime()) {
      tasksToday.push(task);
    } else if (placeholder.getTime() == tomorrow.getTime()) {
      tasksTomorrrow.push(task);
    } else if (placeholder.getTime() > tomorrow.getTime()) {
      tasksLater.push(task);
    } else if (placeholder.getTime() == yesterday.getTime()) {
      tasksYesterday.push(task);
    } else {
      tasksOlder.push(task);
    }
  });

  return {
    later: tasksLater,
    today: tasksToday,
    tomorrow: tasksTomorrrow,
    yesterday: tasksYesterday,
    older: tasksOlder,
  };
}
