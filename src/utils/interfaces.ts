import { Timestamp } from "firebase/firestore";

export interface Task {
  name: string;
  description: string;
  priority: string;
  due_date: Timestamp;
  complete_status: boolean;
  assigned_to?: string | null;
  assigned_by?: string | null;
  id?: string;
  type?: string;
}

export interface GroupedTasks {
  pending: Task[];
  today: Task[];
  overdue: Task[];
}
