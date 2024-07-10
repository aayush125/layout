import NoteCard from "../components/NoteCard";
import AddNote from "../components/AddNoteCard";
import {
  collection,
  query,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
  getDoc,
  doc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../utils/firebase.utils";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Tabs,
  Tab,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  ScrollShadow,
} from "@nextui-org/react";
import { MdModeEdit, MdDelete } from "react-icons/md";
import { useTheme } from "../contexts/ThemeContext";

interface Note {
  id: string;
  title: string;
  timestamp: Timestamp | null;
  content: string;
  edited: boolean;
  editedTimestamp: Timestamp | null;
  tag: string;
}

export default function Notes() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [displayedNotes, setDisplayedNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [deletedTags, setDeletedTags] = useState<string[]>([]);
  const [modTags, setModTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<React.Key>("");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedTag === "All notes") {
      setDisplayedNotes(notes);
    } else if (selectedTag === "Tagless Notes") {
      setDisplayedNotes(
        notes.filter((note) => note.tag === undefined || note.tag === "")
      );
    } else {
      setDisplayedNotes(notes.filter((note) => note.tag === selectedTag));
    }
  }, [notes, selectedTag]);

  useEffect(() => {
    const fetchNotes = async () => {
      setFetchingNotes(true);
      if (user?.uid) {
        try {
          const q = query(
            collection(db, `users/${user.uid}/notes/`),
            orderBy("timestamp", "desc")
          );
          const querySnapshot = await getDocs(q);
          const fetchedNotes: Note[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title,
            timestamp: doc.data().timestamp,
            content: doc.data().content,
            edited: doc.data().edited ? doc.data().edited : false,
            editedTimestamp: doc.data().editedTimestamp,
            tag: doc.data().tag,
          }));
          setNotes(fetchedNotes);
          setDisplayedNotes(fetchedNotes);
        } catch (error) {
          console.error("Error fetching notes:", error);
        } finally {
          setFetchingNotes(false);
        }
      }
    };

    const fetchTags = async () => {
      setFetchingNotes(true);
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", `${user.uid}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTags(docSnap.data().noteTags);
            setModTags(docSnap.data().noteTags);
          } else {
            console.log("No such document!");
          }
        } catch (e) {
          console.log("Error fetching user doc:", e);
        } finally {
          setFetchingNotes(false);
        }
      }
    };

    fetchTags();
    fetchNotes();
  }, []);

  if (fetchingNotes) {
    return <LoadingSpinner />;
  }

  const onDelete = async (noteID: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteID));
    console.log("note deleted");
  };

  const updateTags = async (updateNotes: boolean, tag?: string) => {
    let newtags = tags.filter((value) => !deletedTags.includes(value));
    if (tag && tag !== "") newtags.push(tag);
    setTags(newtags);
    setModTags(newtags);
    if (user) {
      try {
        const userRef = doc(db, "users", `${user?.uid}`);

        await updateDoc(userRef, { noteTags: newtags });

        if (updateNotes) {
          const notesRef = collection(db, `users/${user.uid}/notes`);
          const q = query(notesRef, where("tag", "in", deletedTags));
          const querySnapshot = await getDocs(q);

          const batch = writeBatch(db);
          querySnapshot.forEach((doc) => {
            batch.update(doc.ref, { tag: "" });
          });

          await batch.commit();

          console.log("Tags deleted and notes updated successfully!");
        }
      } catch (e) {
        console.error("Error updating tags:", e);
      }
    } else {
      console.error("'user' is somehow null!");
    }
  };

  const addNote = async (
    title: string,
    timestamp: Timestamp,
    content: string,
    edited: boolean,
    editedTimestamp: Timestamp | null,
    tag: string
  ) => {
    if (user?.uid) {
      try {
        const newNote = {
          title,
          timestamp,
          content,
          edited,
          editedTimestamp,
          tag,
        };
        const noteRef = await addDoc(
          collection(db, `users/${user?.uid}/notes`),
          newNote
        );
        setNotes((prevNotes) => [{ id: noteRef.id, ...newNote }, ...prevNotes]);
        console.log("Document written with ID: ", noteRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }

      if (!tags.includes(tag)) {
        await updateTags(false, tag);
      }
    }
  };

  const handleTagSave = async () => {
    await updateTags(true);
    setSaving(false);
    setDeletedTags([]);
  };

  const onModalClose = () => {
    setModTags(tags);
    setDeletedTags([]);
  };

  return (
    <>
      <div className="flex-grow">
        <div className="container mx-auto px-4">
          <div className="mt-4 ml-4">
            {tags.length === 0 ? null : (
              <div className="flex">
                <Button
                  className="mr-4 mt-1"
                  size="sm"
                  isIconOnly
                  aria-label="Edit Tags"
                  variant="faded"
                  color="default"
                  onPress={() => {
                    onOpen();
                  }}
                >
                  <MdModeEdit size={18} />
                </Button>
                <ScrollShadow
                  orientation="horizontal"
                  className="max-w-full max-h-[300px]"
                  hideScrollBar
                  offset={1}
                >
                  <Tabs
                    onSelectionChange={(key) => {
                      setSelectedTag(key);
                    }}
                  >
                    <Tab key="All notes" title="All notes"></Tab>
                    <Tab key="Tagless Notes" title="Tagless Notes"></Tab>
                    {tags.map((tag) => (
                      <Tab key={tag} title={tag}></Tab>
                    ))}
                  </Tabs>
                </ScrollShadow>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 sm:justify-start lg:justify-center">
            <div className="m-4">
              <AddNote onAddNote={addNote} tags={tags} />
            </div>
            {displayedNotes.map((note) => (
              <div key={note.id} className="m-4">
                <NoteCard
                  props={{
                    id: note.id,
                    title: note.title,
                    timestamp: note.timestamp,
                    content: note.content,
                    edited: note.edited,
                    editedTimestamp: note.editedTimestamp,
                    tag: note.tag,
                  }}
                  onDelete={onDelete}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        onClose={onModalClose}
        className={`${darkMode ? "dark" : ""} text-foreground bg-background`}
        hideCloseButton
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <p>Delete note tags</p>
              </ModalHeader>
              <ModalBody>
                <ScrollShadow
                  className="max-w-full max-h-[300px]"
                  hideScrollBar
                  offset={1}
                >
                  {modTags.map((tag, index) => (
                    <div className="flex my-2" key={tag}>
                      <p className="w-full">{tag}</p>
                      <Button
                        size="sm"
                        variant="bordered"
                        color="danger"
                        onPress={() => {
                          setDeletedTags((prevTags) => [...prevTags, tag]);
                          setModTags((prevTags) =>
                            prevTags.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <MdDelete size={15} />
                      </Button>
                    </div>
                  ))}
                </ScrollShadow>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button
                  color="primary"
                  isDisabled={deletedTags.length == 0}
                  variant="solid"
                  onPress={async () => {
                    setSaving(true);
                    await handleTagSave();
                    onClose();
                  }}
                  isLoading={saving}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
