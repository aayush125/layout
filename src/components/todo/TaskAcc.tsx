import { Accordion, AccordionItem, Checkbox, Chip } from "@nextui-org/react";
import { Task } from "../../utils/interfaces";
import { formatDate } from "../../utils/utils";

export default function TaskAcc({ task }: { task: Task }) {
  return (
    <Accordion selectionMode="multiple" className="w-full">
      <AccordionItem
        startContent={
          <Checkbox checked={task.complete_status} color="success"></Checkbox>
        }
        key={task.name}
        aria-label={task.name}
        title={task.name}
      >
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <div className="font-extralight">
              <Chip
                color={`${
                  task.priority == "low"
                    ? "secondary"
                    : task.priority == "medium"
                    ? "warning"
                    : "danger"
                }`}
              >
                Priority:{" "}
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Chip>
            </div>
            <div className="font-extralight">
              Due: {formatDate(task.due_date.toDate())}
            </div>
          </div>
          <div>{task.description}</div>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
