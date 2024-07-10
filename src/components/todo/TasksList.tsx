import { Accordion, AccordionItem, Checkbox } from "@nextui-org/react";
import { Task } from "../../utils/interfaces";
import { groupTasks } from "../../utils/utils";
import TaskAcc from "./TaskAcc";
import { FaFolderOpen, FaHourglassEnd } from "react-icons/fa6";
import { LuClock10 } from "react-icons/lu";
import { IoIosToday } from "react-icons/io";
import { MdWatchLater } from "react-icons/md";

export default function TasksList({ tasks }: { tasks: Task[] }) {
  let groupedTasks = groupTasks(tasks);

  return (
    <Accordion
      selectionMode="multiple"
      defaultExpandedKeys={["today"]}
      className="w-full font-semibold text-sm sm:text-base"
    >
      <AccordionItem
        startContent={<MdWatchLater size={18} color="green" />}
        key="later"
        aria-label="Later"
        title="Later"
      >
        {groupedTasks.later.length !== 0 ? (
          <div className="flex flex-col font-normal">
            {groupedTasks.later.map((task) => (
              <div className="flex flex-row">
                <TaskAcc task={task} />
              </div>
            ))}
          </div>
        ) : (
          <div className="font-normal">No tasks scheduled for later.</div>
        )}
      </AccordionItem>
      <AccordionItem
        startContent={<FaHourglassEnd size={18} color="orange" />}
        key="tomorrow"
        aria-label="Tomorrow"
        title="Tomorrow"
      >
        {groupedTasks.tomorrow.length !== 0 ? (
          <div className="flex flex-col font-normal">
            {groupedTasks.tomorrow.map((task) => (
              <div className="flex flex-row">
                <TaskAcc task={task} />
              </div>
            ))}
          </div>
        ) : (
          <div className="font-normal">No tasks scheduled for tomorrow.</div>
        )}
      </AccordionItem>
      <AccordionItem
        startContent={<IoIosToday size={18} color="#0364d3" />}
        key="today"
        aria-label="Today"
        title="Today"
      >
        {groupedTasks.today.length !== 0 ? (
          <div className="flex flex-col font-normal">
            {groupedTasks.today.map((task) => (
              <div className="flex flex-row">
                <TaskAcc task={task} />
              </div>
            ))}
          </div>
        ) : (
          <div className="font-normal">No tasks scheduled for today.</div>
        )}
      </AccordionItem>
      <AccordionItem
        startContent={<LuClock10 size={18} color="#CD853F" />}
        key="yesterday"
        aria-label="Yesterday"
        title="Yesterday"
      >
        {groupedTasks.yesterday.length !== 0 ? (
          <div className="flex flex-col font-normal">
            {groupedTasks.yesterday.map((task) => (
              <div className="flex flex-row">
                <TaskAcc task={task} />
              </div>
            ))}
          </div>
        ) : (
          <div className="font-normal">
            There were no tasks scheduled yesterday.
          </div>
        )}
      </AccordionItem>
      <AccordionItem
        startContent={<FaFolderOpen size={18} color="#704747" />}
        key="older"
        aria-label="Older"
        title="Older"
      >
        {groupedTasks.older.length !== 0 ? (
          <div className="flex flex-col font-normal">
            {groupedTasks.older.map((task) => (
              <div className="flex flex-row">
                <TaskAcc task={task} />
              </div>
            ))}
          </div>
        ) : (
          <div className="font-normal">No older tasks.</div>
        )}
      </AccordionItem>
    </Accordion>
  );
}
