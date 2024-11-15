import {
  Accordion,
  AccordionItem,
  Checkbox,
  Chip,
  Button,
  RadioGroup,
  Radio,
  Textarea,
  DatePicker,
  Input,
  Spinner,
} from "@nextui-org/react";
import { Task } from "../../utils/interfaces";
import {
  formatDate,
  toFireStoreTimestamp,
  isValidEmail,
} from "../../utils/utils";
import { doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../utils/firebase.utils";
import { useAuth } from "../../contexts/AuthContext";
import { useState } from "react";
import {
  ZonedDateTime,
  getLocalTimeZone,
  fromDate,
  today,
} from "@internationalized/date";

export default function TaskAcc({
  task,
  onDelete,
}: {
  task: Task;
  onDelete: (id: string) => Promise<void>;
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [shownTask, setShownTask] = useState<Task>(task);
  const [saving, setSaving] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [editingTask, setEditingTask] = useState<Task>(task);
  const [deleting, setDeleting] = useState(false);
  const [deletePressed, setDeletePressed] = useState(false);
  const updateCompleteStatus = async (status: boolean) => {
    try {
      if (task.type == "personal") {
        const taskRef = doc(db, `users/${user?.uid}/tasks`, `${task.id}`);
        await updateDoc(taskRef, { complete_status: status });
        console.log("Updated complete status with (personal): ", status);
      } else if (task.type == "assigned") {
        const taskRef = doc(db, "assignedTasks", `${task.id}`);
        await updateDoc(taskRef, { complete_status: status });
        console.log("Update complete status with (assigned): ", status);
      }
    } catch (e) {
      console.error("Error updating task complete status:", e);
    }
  };

  const handleSave = async () => {
    if (editing) {
      setSaving(true);
      if (task.type == "personal") {
        try {
          console.log("Trying to save...");
          const taskRef = doc(db, `users/${user?.uid}/tasks`, `${task.id}`);
          await setDoc(taskRef, {
            name: editingTask.name,
            description: editingTask.description,
            priority: editingTask.priority,
            due_date: editingTask.due_date,
            complete_status: editingTask.complete_status,
          });
          console.log("Edited and saved with id: ", taskRef.id);
          setShownTask(editingTask);
        } catch (e) {
          console.error("Error adding document: ", e);
        } finally {
          setSaving(false);
        }
      } else if (task.type == "assigned") {
        try {
          const taskRef = doc(db, "assignedTasks", `${task.id}`);
          await setDoc(taskRef, {
            name: editingTask.name,
            description: editingTask.description,
            priority: editingTask.priority,
            due_date: editingTask.due_date,
            complete_status: editingTask.complete_status,
            assigned_by: editingTask.assigned_by,
            assigned_to: editingTask.assigned_to,
          });
          console.log("Edited and saved with id: ", taskRef.id);
          setShownTask(editingTask);
        } catch (e) {
          console.error("Error adding document: ", e);
        } finally {
          setSaving(false);
        }
      }
    }
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setEditingTask((prevTask: Task) => ({
      ...prevTask,
      description: event.target.value,
    }));
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const taskRef = doc(db, `users/${user?.uid}/tasks`, `${task.id}`);
      await deleteDoc(taskRef);
    } catch (e) {
      console.error("Error deleting task: ", e);
    } finally {
      setDeleting(false);
    }
  };

  const handleDateChange = (date: ZonedDateTime): void => {
    setEditingTask((prevTask: Task) => ({
      ...prevTask,
      due_date: toFireStoreTimestamp(date),
    }));
  };

  const handleAssignedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let email = event.target.value.trim().toLowerCase();
    setEditingTask((prevTask: Task) => ({
      ...prevTask,
      assigned_to: event.target.value,
    }));
    if (!isValidEmail(email)) {
      setEmailInvalid(true);
    } else {
      setEmailInvalid(false);
    }
  };

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setEditingTask((prevTask: Task) => ({
      ...prevTask,
      name: event.target.value,
    }));
  };

  return (
    <Accordion selectionMode="multiple" className="w-full">
      <AccordionItem
        startContent={
          <Checkbox
            defaultSelected={shownTask.complete_status}
            onValueChange={(isSelected: boolean) => {
              updateCompleteStatus(isSelected);
            }}
            isDisabled={editing}
            color="success"
          ></Checkbox>
        }
        key={shownTask.name}
        aria-label={shownTask.name}
        title={!editing ? shownTask.name : ""}
      >
        <div className="flex flex-col">
          {editing && (
            <Input
              type="text"
              variant="underlined"
              placeholder="Task name"
              value={editingTask.name}
              onChange={handleNameChange}
            />
          )}
          <div className="flex flex-row justify-between items-center">
            <div className="font-extralight">
              {!editing ? (
                <Chip
                  color={`${
                    shownTask.priority == "low"
                      ? "secondary"
                      : shownTask.priority == "medium"
                      ? "warning"
                      : "danger"
                  }`}
                >
                  {"Priority: " +
                    shownTask.priority.charAt(0).toUpperCase() +
                    shownTask.priority.slice(1)}
                </Chip>
              ) : (
                <RadioGroup
                  defaultValue={shownTask.priority}
                  label="Priority"
                  orientation="horizontal"
                  onValueChange={(value: string) => {
                    setEditingTask((prevTask: Task) => ({
                      ...prevTask,
                      priority: value,
                    }));
                  }}
                >
                  <Radio value="low">Low</Radio>
                  <Radio value="medium">Medium</Radio>
                  <Radio value="high">High</Radio>
                </RadioGroup>
              )}
            </div>
            <div className="flex flex-col font-extralight">
              <div style={{ overflow: "hidden" }}>
                {!editing ? (
                  "Due: " + formatDate(shownTask.due_date.toDate())
                ) : (
                  <DatePicker
                    variant="underlined"
                    label="Due date"
                    hideTimeZone
                    minValue={today(getLocalTimeZone())}
                    hourCycle={24}
                    defaultValue={fromDate(
                      shownTask.due_date.toDate(),
                      getLocalTimeZone()
                    )}
                    onChange={handleDateChange}
                  />
                )}
              </div>
              <div>
                {!editing
                  ? task.type == "assigned" &&
                    "Assigned to: " + shownTask.assigned_to
                  : task.type == "assigned" && (
                      <Input
                        type="email"
                        label="Assign to"
                        variant="underlined"
                        placeholder="Email"
                        isInvalid={emailInvalid}
                        value={
                          editingTask.assigned_to ? editingTask.assigned_to : ""
                        }
                        onChange={handleAssignedChange}
                      />
                    )}
              </div>
            </div>
          </div>
          <div className="flex flex-row justify-between">
            {!editing ? (
              <pre style={{ fontFamily: "inherit" }}>
                {shownTask.description}
              </pre>
            ) : (
              <Textarea
                variant="bordered"
                labelPlacement="outside"
                placeholder="Description"
                className="mt-1 max-w-xl"
                value={editingTask.description}
                minRows={8}
                maxRows={15}
                onChange={handleDescriptionChange}
              />
            )}
            <div className="ml-1">
              <Button
                size="sm"
                color="primary"
                variant="light"
                isLoading={saving}
                onPress={async () => {
                  await handleSave();
                  setEditing(!editing);
                  setEmailInvalid(false);
                }}
              >
                {editing ? (saving ? "" : "Save") : "Edit"}
              </Button>
              {!editing &&
                (!deletePressed ? (
                  <Button
                    onPress={() => {
                      setDeletePressed(true);
                      console.log("delete pressed");
                    }}
                    color="danger"
                    variant="light"
                  >
                    Delete
                  </Button>
                ) : (
                  <Button
                    onPress={async () => {
                      console.log("sure pressed");
                      await handleDelete();
                      task.id
                        ? onDelete(task.id)
                        : console.log("Task id is missing");
                    }}
                    color="danger"
                    variant="light"
                  >
                    {deleting ? <Spinner size="sm" color="danger" /> : "Sure?"}
                  </Button>
                ))}
              {editing && (
                <Button
                  size="sm"
                  color="default"
                  variant="light"
                  onPress={() => {
                    setEditingTask(shownTask);
                    setEditing(false);
                    setEmailInvalid(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>
      </AccordionItem>
    </Accordion>
  );
}
