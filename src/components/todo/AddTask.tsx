import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  DatePicker,
  RadioGroup,
  Radio,
} from "@nextui-org/react";
import { useTheme } from "../../contexts/ThemeContext";
import { useState } from "react";
import {
  now,
  getLocalTimeZone,
  ZonedDateTime,
  today,
} from "@internationalized/date";
import { toFireStoreTimestamp, isValidEmail } from "../../utils/utils";
import { Timestamp } from "firebase/firestore";
import { Task } from "../../utils/interfaces";

export interface AddTaskProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    name: string,
    description: string,
    priority: string,
    due_date: Timestamp | null,
    complete_status: boolean,
    assigned_to: string | null
  ) => Promise<void>;
}

const AddTask: React.FC<AddTaskProps> = ({ isOpen, onClose, onSubmit }) => {
  const { darkMode } = useTheme();
  const [submitting, setSubmitting] = useState(false);
  const [dateChanged, setDateChanged] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [task, setTask] = useState<Task>({
    name: "",
    description: "",
    priority: "medium",
    due_date: Timestamp.now(),
    complete_status: false,
    assigned_to: null,
    id: "",
  });

  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setTask((prevTask: Task) => ({ ...prevTask, name: event.target.value }));
  };

  const handleDateChange = (date: ZonedDateTime): void => {
    setDateChanged(true);
    setTask((prevTask: Task) => ({
      ...prevTask,
      due_date: toFireStoreTimestamp(date),
    }));
  };

  const handleAssignedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let email = event.target.value.trim().toLowerCase();
    setTask((prevTask: Task) => ({
      ...prevTask,
      assigned_to: email,
    }));
    if (!isValidEmail(email)) {
      setEmailInvalid(true);
    } else {
      setEmailInvalid(false);
    }
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setTask((prevTask: Task) => ({
      ...prevTask,
      description: event.target.value,
    }));
  };

  const handleTaskSubmit = async () => {
    setSubmitting(true);
    await onSubmit(
      task.name,
      task.description,
      task.priority,
      task.due_date ? task.due_date : null,
      task.complete_status,
      task.assigned_to ? task.assigned_to : null
    );
    setSubmitting(false);
  };

  const onTaskModalClose = () => {
    setTask({
      name: "",
      description: "",
      priority: "medium",
      due_date: Timestamp.now(),
      complete_status: false,
      assigned_to: null,
      id: "",
    });
    setDateChanged(false);
    setEmailInvalid(false);
    onClose();
  };

  return (
    <>
      <Modal
        className={`${darkMode ? "dark" : ""} text-foreground bg-background`}
        hideCloseButton
        isOpen={isOpen}
        onClose={onTaskModalClose}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <p>Add a note</p>
                <div className="flex flex-col">
                  <Input
                    type="text"
                    variant="underlined"
                    placeholder="Task name"
                    value={task.name}
                    onChange={handleNameChange}
                  />
                  <div
                    className={`${
                      darkMode ? "dark" : ""
                    } bg-background text-foreground flex flex-row my-2 gap-2`}
                  >
                    <DatePicker
                      variant="underlined"
                      label="Due date"
                      hideTimeZone
                      minValue={today(getLocalTimeZone())}
                      hourCycle={24}
                      defaultValue={now(getLocalTimeZone())}
                      onChange={handleDateChange}
                    />
                  </div>
                  <RadioGroup
                    defaultValue={task.priority}
                    onValueChange={(value: string) => {
                      setTask((prevTask: Task) => ({
                        ...prevTask,
                        priority: value,
                      }));
                    }}
                    label="Priority"
                    orientation="horizontal"
                  >
                    <Radio value="low">Low</Radio>
                    <Radio value="medium">Medium</Radio>
                    <Radio value="high">High</Radio>
                  </RadioGroup>
                </div>
              </ModalHeader>
              <ModalBody>
                <Textarea
                  variant="bordered"
                  labelPlacement="outside"
                  placeholder="Description"
                  className="max-w-xl"
                  value={task.description}
                  minRows={8}
                  maxRows={15}
                  onChange={handleDescriptionChange}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  isDisabled={task.name === "" || !dateChanged}
                  color="primary"
                  type="submit"
                  onPress={async () => {
                    await handleTaskSubmit();
                    onClose();
                  }}
                  isLoading={submitting}
                >
                  {submitting ? "" : "Save"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddTask;
