import { useTheme } from "../contexts/ThemeContext";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
} from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Timestamp } from "firebase/firestore";

interface Note {
  title: string;
  timestamp: Timestamp | null;
  content: string;
  edited: boolean;
  editedTimestamp: Timestamp | null;
  tag: string;
}

interface AddNoteCardProps {
  onAddNote: (
    title: string,
    timestamp: Timestamp,
    content: string,
    edited: boolean,
    editedTimestamp: Timestamp | null,
    tag: string
  ) => Promise<void>;
  tags: string[];
}

const AddNote: React.FC<AddNoteCardProps> = ({ onAddNote, tags }) => {
  const { darkMode } = useTheme();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [submitting, setSubmitting] = React.useState(false);
  const [note, setNote] = React.useState<Note>({
    title: "",
    timestamp: null,
    content: "",
    edited: false,
    editedTimestamp: null,
    tag: "",
  });
  const [selectedTag, setSelectedTag] = React.useState("");

  const handleTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNote((prevNote: Note) => ({ ...prevNote, title: event.target.value }));
  };

  const handleContentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setNote((prevNote: Note) => ({ ...prevNote, content: event.target.value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    console.log("Submitting note: ", note);
    console.log("Title: ", note.title);
    console.log("Content: ", note.content);
    note.timestamp = Timestamp.now();
    note.tag = selectedTag;
    try {
      await onAddNote(
        note.title,
        note.timestamp,
        note.content,
        note.edited,
        note.editedTimestamp,
        note.tag ? note.tag : ""
      );
    } catch (e) {
      console.error("Error saving note: ", e);
    } finally {
      setSubmitting(false);
    }

    setNote({
      title: "",
      timestamp: null,
      content: "",
      edited: false,
      editedTimestamp: null,
      tag: "",
    });
  };

  return (
    <>
      <button
        className={`max-w-sm rounded-xl shadow-md overflow-hidden relative
               ${
                 darkMode
                   ? "bg-[#18181b] hover:bg-[#3f3f46]"
                   : "bg-white hover:bg-gray-100"
               }
               transition-colors duration-300 ease-in-out
               flex items-center justify-center
               cursor-pointer
               focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
               ${darkMode ? "focus:ring-gray-400" : "focus:ring-gray-500"}`}
        style={{ height: "248px", width: "100%" }}
        onClick={onOpen}
        aria-label="Add new note"
      >
        <div className="p-6 w-full h-full flex items-center justify-center">
          <span
            className={`text-6xl font-bold
                  ${darkMode ? "text-gray-300" : "text-gray-600"}
                  transition-colors duration-300 ease-in-out`}
          >
            +
          </span>
        </div>
      </button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className={`${darkMode ? "dark" : ""} text-foreground bg-background`}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <p>Add a note</p>
                <div>
                  <Input
                    type="text"
                    variant="underlined"
                    placeholder="Title"
                    value={note.title}
                    onChange={handleTitleChange}
                  />
                  <Autocomplete
                    variant="bordered"
                    className={`mt-2 ${
                      darkMode ? "dark" : ""
                    } text-foreground bg-background`}
                    aria-label="Select Tag"
                    placeholder="Select or create a tag"
                    allowsCustomValue
                    onInputChange={(value) => {
                      setSelectedTag(value);
                    }}
                    popoverProps={{
                      className: darkMode
                        ? "dark text-foreground bg-background"
                        : "text-foreground bg-background",
                    }}
                  >
                    {tags.map((tag) => (
                      <AutocompleteItem key={tag}>{tag}</AutocompleteItem>
                    ))}
                  </Autocomplete>
                </div>
              </ModalHeader>
              <ModalBody>
                <Textarea
                  variant="bordered"
                  labelPlacement="outside"
                  placeholder="Write your note here"
                  className="max-w-xl"
                  value={note.content}
                  minRows={8}
                  maxRows={15}
                  onChange={handleContentChange}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  isDisabled={note.title === ""}
                  color="primary"
                  type="submit"
                  onPress={async () => {
                    await handleSubmit();
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

export default AddNote;
