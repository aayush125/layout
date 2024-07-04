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
import { FaTag } from "react-icons/fa6";
import { Chip } from "@nextui-org/react";

interface Note {
  id: string;
  title: string;
  timestamp: Timestamp | null;
  content: string;
  edited: boolean;
  editedTimestamp: Timestamp | null;
  tag: string;
}

interface NoteCardProps {
  props: Note;
  onDelete: (noteID: string) => Promise<void>;
}

const NoteCard: React.FC<NoteCardProps> = ({ props, onDelete }) => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [editing, setEditing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [deletePressed, setDeletePressed] = React.useState(false);
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
        edited: true,
        editedTimestamp: Timestamp.now(),
        tag: editedNote.tag,
      });
      console.log("Edited and saved with id: ", noteRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    } finally {
      setSaving(false);
    }
    editedNote.edited = true;
    editedNote.editedTimestamp = Timestamp.now();
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
    setDeletePressed(false);
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
            {note.edited
              ? note.editedTimestamp
                ? "Edited: " + formatDate(note.editedTimestamp.toDate())
                : ""
              : note.timestamp
              ? formatDate(note.timestamp.toDate())
              : ""}
          </p>
          <div className="h-32 overflow-hidden">
            <pre
              className={`whitespace-pre-wrap break-words ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }
                         transition-colors duration-300 ease-in-out`}
              style={{ fontFamily: "inherit" }}
            >
              {note.content}
            </pre>
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
                  className={`whitespace-pre-wrap text-sm font-thin
                           ${darkMode ? "text-gray-400" : "text-gray-600"}
                           transition-colors duration-300 ease-in-out`}
                >
                  {note.edited
                    ? note.editedTimestamp
                      ? "Created: " +
                        (note.timestamp
                          ? formatDate(note.timestamp.toDate())
                          : "") +
                        "\nEdited: " +
                        formatDate(note.editedTimestamp.toDate())
                      : ""
                    : note.timestamp
                    ? formatDate(note.timestamp.toDate())
                    : ""}
                </p>
                <Chip
                  startContent={<FaTag />}
                  variant="solid"
                  color="primary"
                  size="sm"
                  radius="md"
                >
                  {note.tag}
                </Chip>
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
                  <ScrollShadow offset={1} className="w-full max-h-[350px]">
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
                {editing ? (
                  <Button
                    color="default"
                    variant="light"
                    onPress={() => {
                      handleClose();
                    }}
                  >
                    Cancel
                  </Button>
                ) : (
                  <>
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
                    {!deletePressed ? (
                      <Button
                        onPress={() => {
                          setDeletePressed(true);
                        }}
                        color="danger"
                        variant="light"
                      >
                        Delete
                      </Button>
                    ) : (
                      <Button
                        onPress={async () => {
                          await handleDelete();
                          await onDelete(props.id);
                          onClose();
                        }}
                        color="danger"
                        variant="light"
                      >
                        {deleting ? (
                          <Spinner size="sm" color="danger" />
                        ) : (
                          "Sure?"
                        )}
                      </Button>
                    )}
                  </>
                )}
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
