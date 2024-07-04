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
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../utils/firebase.utils";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";
import { Tabs, Tab } from "@nextui-org/react";
import { ScrollShadow } from "@nextui-org/react";

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
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [displayedNotes, setDisplayedNotes] = useState<Note[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<React.Key>("");

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
          console.log("Path used: ", `users/${user.uid}/notes`);
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
          console.log(notes);
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
  }, [user]);

  if (fetchingNotes) {
    return <LoadingSpinner />;
  }

  const onDelete = async (noteID: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteID));
    console.log("note deleted");
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
        let newtags = tags;
        newtags.push(tag);
        try {
          const userRef = doc(db, "users", `${user.uid}`);

          await updateDoc(userRef, { noteTags: newtags });
        } catch (e) {
          console.error("Error updating tags:", e);
        }
      }
    }
  };

  return (
    <>
      <div className="flex-grow">
        <div className="container mx-auto px-4">
          <div className="mt-4 ml-4">
            {tags.length === 0 ? null : (
              <ScrollShadow
                orientation="horizontal"
                className="max-w-full max-h-[300px]"
                hideScrollBar
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
    </>
  );
}
