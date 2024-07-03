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
} from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { doc, setDoc, addDoc, collection, Timestamp } from "firebase/firestore";
import { db } from "../utils/firebase.utils";
import { useAuth } from "../contexts/AuthContext";
import formatDate from "../utils/utils";
import { Spinner } from "@nextui-org/react";

interface Note {
  title: string;
  timestamp: Timestamp | null;
  content: string;
}

interface AddNoteCardProps {
  onAddNote: (
    title: string,
    timestamp: Timestamp,
    content: string
  ) => Promise<void>;
}

const AddNote: React.FC<AddNoteCardProps> = ({ onAddNote }) => {
  const { darkMode } = useTheme();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [submitting, setSubmitting] = React.useState(false);
  const [note, setNote] = React.useState<Note>({
    title: "",
    timestamp: null,
    content: "",
  });
  // const { user, loading } = useAuth();

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
    // try {
    //   const noteRef = await addDoc(collection(db, `users/${user?.uid}/notes`), {
    //     ...note,
    //   });
    //   console.log("Document written with ID: ", noteRef.id);
    // } catch (e) {
    //   console.error("Error adding document: ", e);
    // }
    try {
      await onAddNote(note.title, note.timestamp, note.content);
    } catch (e) {
      console.error("Error saving note: ", e);
    } finally {
      setSubmitting(false);
    }

    setNote({ title: "", timestamp: null, content: "" });
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
                <Input
                  type="text"
                  variant="underlined"
                  placeholder="Title"
                  value={note.title}
                  onChange={handleTitleChange}
                />
              </ModalHeader>
              <ModalBody>
                <Textarea
                  variant="bordered"
                  labelPlacement="outside"
                  placeholder="Enter your note here"
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
