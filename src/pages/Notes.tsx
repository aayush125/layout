import NoteCard from "../components/NoteCard";
import AddNote from "../components/AddNoteCard";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../utils/firebase.utils";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

interface Note {
  id: string;
  title: string;
  timestamp: Timestamp | null;
  content: string;
}

export default function Notes() {
  const { user, loading } = useAuth();
  const [fetchingNotes, setFetchingNotes] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (user?.uid) {
        setFetchingNotes(true);
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
          }));
          setNotes(fetchedNotes);
          console.log(notes);
        } catch (error) {
          console.error("Error fetching notes:", error);
        } finally {
          setFetchingNotes(false);
        }
      }
    };

    fetchNotes();
  }, [user]);

  if (fetchingNotes) {
    return <LoadingSpinner />;
  }

  const onDelete = (noteID: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteID));
    console.log("note deleted");
  };

  const addNote = async (
    title: string,
    timestamp: Timestamp,
    content: string
  ) => {
    if (user?.uid) {
      try {
        const newNote = {
          title,
          timestamp,
          content,
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
    }
  };

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 sm:justify-start lg:justify-center">
          <div className="m-4">
            <AddNote onAddNote={addNote} />
          </div>
          {notes.map((note) => (
            <div key={note.id} className="m-4">
              <NoteCard
                props={{
                  id: note.id,
                  title: note.title,
                  timestamp: note.timestamp,
                  content: note.content,
                }}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
