import React from "react";
import { useTheme } from "../contexts/ThemeContext";
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
import { ScrollShadow } from "@nextui-org/react";
import { Input } from "@nextui-org/react";
import { Timestamp, doc, setDoc, deleteDoc } from "firebase/firestore";
import formatDate from "../utils/utils";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../utils/firebase.utils";
import { Spinner } from "@nextui-org/react";
// const AddNote: React.FC<AddNoteCardProps> = ({ onAddNote }) => {

// export default function NoteCard(props: Note, onDelete) {

interface Note {
  id: string;
  title: string;
  timestamp: Timestamp | null;
  content: string;
}

interface NoteCardProps {
  props: Note;
  onDelete: (noteID: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ props, onDelete }) => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editing, setEditing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [note, setNote] = React.useState<Note>(props);
  const [editedNote, setEditedNote] = React.useState<Note>(props);
  const [saving, setSaving] = React.useState(false);

  const handleTitleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setEditedNote((prevNote: Note) => ({
      ...prevNote,
      title: event.target.value,
    }));
  };

  const handleContentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    setEditedNote((prevNote: Note) => ({
      ...prevNote,
      content: event.target.value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const noteRef = doc(db, `users/${user?.uid}/notes`, `${props.id}`);
      await setDoc(noteRef, {
        title: editedNote.title,
        timestamp: editedNote.timestamp,
        content: editedNote.content,
      });
      console.log("Edited and saved with id: ", noteRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    } finally {
      setSaving(false);
    }
    setNote(editedNote);
    setEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const noteRef = doc(db, `users/${user?.uid}/notes`, `${props.id}`);
      await deleteDoc(noteRef);
      console.log("Note deleted successfully.");
    } catch (e) {
      console.error("Error deleting note: ", e);
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = (): void => {
    setEditedNote(note);
    setEditing(false);
  };

  return (
    <>
      <button
        className={`max-w-sm rounded-xl shadow-md overflow-hidden relative
             ${darkMode ? "bg-[#18181b]" : "bg-white"}
             hover:${darkMode ? "bg-[#3f3f46]" : "bg-gray-100"}
             transition-all duration-300 ease-in-out
             flex items-center justify-center
             cursor-pointer
             focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
             ${
               darkMode
                 ? "focus-visible:ring-gray-400"
                 : "focus-visible:ring-gray-500"
             }
             group`}
        style={{ height: "248px", width: "100%" }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onOpen}
        aria-label="Note Card"
      >
        <div className="p-6 w-full h-full relative">
          <h2
            className={`text-xl font-semibold mb-2
                      ${darkMode ? "text-gray-100" : "text-gray-800"}
                      transition-colors duration-300 ease-in-out`}
          >
            {note.title}
          </h2>
          <p
            className={`text-sm mb-4
                     ${darkMode ? "text-gray-400" : "text-gray-600"}
                     transition-colors duration-300 ease-in-out`}
          >
            {note.timestamp ? formatDate(note.timestamp.toDate()) : ""}
          </p>
          <div className="h-32 overflow-hidden">
            <p
              className={`${darkMode ? "text-gray-300" : "text-gray-700"}
                         transition-colors duration-300 ease-in-out`}
            >
              {note.content}
            </p>
          </div>
          <div
            className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t
                       ${
                         darkMode
                           ? "from-[#18181b] to-transparent"
                           : "from-white to-transparent"
                       }
                       transition-all duration-300 ease-in-out`}
          ></div>
        </div>
      </button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        className={`${darkMode ? "dark" : ""} text-foreground bg-background`}
        hideCloseButton
        isKeyboardDismissDisabled={editing}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {editing ? (
                  <Input
                    type="text"
                    variant="underlined"
                    placeholder="Title"
                    value={editedNote.title}
                    onChange={handleTitleChange}
                  />
                ) : (
                  <p>{note.title}</p>
                )}
                <p
                  className={`text-sm font-thin
                           ${darkMode ? "text-gray-400" : "text-gray-600"}
                           transition-colors duration-300 ease-in-out`}
                >
                  {note.timestamp ? formatDate(note.timestamp.toDate()) : ""}
                </p>
              </ModalHeader>
              <ModalBody>
                {editing ? (
                  <Textarea
                    variant="bordered"
                    labelPlacement="outside"
                    placeholder="Enter your note here"
                    className="w-full"
                    minRows={8}
                    maxRows={15}
                    value={editedNote.content}
                    onChange={handleContentChange}
                  />
                ) : (
                  <ScrollShadow className="w-full max-h-[350px]">
                    <pre
                      className={`whitespace-pre-wrap break-words
                              ${darkMode ? "text-gray-300" : "text-gray-700"}
                              transition-colors duration-300 ease-in-out`}
                      style={{ fontFamily: "inherit" }}
                    >
                      {note.content}
                    </pre>
                  </ScrollShadow>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="light"
                  onPress={() => {
                    handleClose();
                    onClose();
                  }}
                >
                  Close
                </Button>
                <Button
                  onClick={async () => {
                    await handleDelete();
                    onDelete(props.id);
                    onClose();
                  }}
                  color="danger"
                  variant="light"
                >
                  {deleting ? <Spinner size="sm" color="danger" /> : "Delete"}
                </Button>
                <Button
                  color="primary"
                  onPress={async () => {
                    if (editing) {
                      await handleSave();
                    } else {
                      setEditing(true);
                    }
                  }}
                  isLoading={saving}
                >
                  {editing ? (saving ? "" : "Save") : "Edit"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default NoteCard;
