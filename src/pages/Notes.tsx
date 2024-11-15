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
import { useEffect, useReducer } from "react";
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

enum NotesActions {
  SET_NOTES = "SET_NOTES",
  SET_DISPLAYED_NOTES = "SET_DISPLAYED_NOTES",
  SET_TAGS = "SET_TAGS",
  SET_SELECTED_TAG = "SET_SELECTED_TAG",
  ADD_NOTE = "ADD_NOTE",
  DELETE_NOTE = "DELETE_NOTE",
  SET_FETCHING_NOTES = "SET_FETCHING_NOTES",
  SET_SAVING = "SET_SAVING",
  SET_DELETED_TAGS = "SET_DELETED_TAGS",
  SET_MOD_TAGS = "SET_MOD_TAGS",
}

interface State {
  notes: Note[];
  displayedNotes: Note[];
  tags: string[];
  deletedTags: string[];
  modTags: string[];
  selectedTag: React.Key;
  fetchingNotes: boolean;
  saving: boolean;
}

const initialState: State = {
  notes: [],
  displayedNotes: [],
  tags: [],
  deletedTags: [],
  modTags: [],
  selectedTag: "",
  fetchingNotes: false,
  saving: false,
};

type Action =
  | { type: NotesActions.SET_NOTES; payload: Note[] }
  | { type: NotesActions.SET_DISPLAYED_NOTES; payload: Note[] }
  | { type: NotesActions.SET_TAGS; payload: string[] }
  | { type: NotesActions.SET_SELECTED_TAG; payload: React.Key }
  | { type: NotesActions.ADD_NOTE; payload: Note }
  | { type: NotesActions.DELETE_NOTE; payload: string }
  | { type: NotesActions.SET_FETCHING_NOTES; payload: boolean }
  | { type: NotesActions.SET_SAVING; payload: boolean }
  | { type: NotesActions.SET_DELETED_TAGS; payload: string[] }
  | { type: NotesActions.SET_MOD_TAGS; payload: string[] };

function notesReducer(state: typeof initialState, action: Action) {
  switch (action.type) {
    case NotesActions.SET_NOTES:
      return {
        ...state,
        notes: action.payload,
        displayedNotes: action.payload,
      };
    case NotesActions.SET_DISPLAYED_NOTES:
      return {
        ...state,
        displayedNotes: action.payload,
      };
    case NotesActions.SET_TAGS:
      return { ...state, tags: action.payload, modTags: action.payload };
    case NotesActions.SET_SELECTED_TAG:
      return { ...state, selectedTag: action.payload };
    case NotesActions.ADD_NOTE:
      return { ...state, notes: [action.payload, ...state.notes] };
    // Don't need DELETE_NOTE as there's already a dedicated function for it.
    // case NotesActions.DELETE_NOTE:
    //   return {
    //     ...state,
    //     notes: state.notes.filter((note) => note.id !== action.payload),
    //   };
    case NotesActions.SET_FETCHING_NOTES:
      return { ...state, fetchingNotes: action.payload };
    case NotesActions.SET_SAVING:
      return { ...state, saving: action.payload };
    case NotesActions.SET_DELETED_TAGS:
      return { ...state, deletedTags: action.payload };
    case NotesActions.SET_MOD_TAGS:
      return { ...state, modTags: action.payload };
    default:
      return state;
  }
}

export default function Notes() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [state, dispatch] = useReducer(notesReducer, initialState);

  useEffect(() => {
    let displayedNotes;
    if (state.selectedTag === "All notes") {
      displayedNotes = state.notes;
    } else if (state.selectedTag === "Tagless Notes") {
      displayedNotes = state.notes.filter(
        (note) => !note.tag || note.tag === ""
      );
    } else {
      displayedNotes = state.notes.filter(
        (note) => note.tag === state.selectedTag
      );
    }

    dispatch({
      type: NotesActions.SET_DISPLAYED_NOTES,
      payload: displayedNotes,
    });
  }, [state.notes, state.selectedTag]);

  useEffect(() => {
    const fetchNotes = async () => {
      dispatch({ type: NotesActions.SET_FETCHING_NOTES, payload: true });
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
          dispatch({ type: NotesActions.SET_NOTES, payload: fetchedNotes });
          dispatch({
            type: NotesActions.SET_DISPLAYED_NOTES,
            payload: fetchedNotes,
          });
        } catch (error) {
          console.error("Error fetching notes:", error);
        } finally {
          dispatch({ type: NotesActions.SET_FETCHING_NOTES, payload: false });
        }
      }
    };

    const fetchTags = async () => {
      dispatch({ type: NotesActions.SET_FETCHING_NOTES, payload: true });
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", `${user.uid}`);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            dispatch({
              type: NotesActions.SET_TAGS,
              payload: docSnap.data().noteTags,
            });
            dispatch({
              type: NotesActions.SET_MOD_TAGS,
              payload: docSnap.data().noteTags,
            });
          } else {
            console.log("No such document!");
          }
        } catch (e) {
          console.log("Error fetching user doc:", e);
        } finally {
          dispatch({ type: NotesActions.SET_FETCHING_NOTES, payload: false });
        }
      }
    };

    fetchTags();
    fetchNotes();
  }, []);

  if (state.fetchingNotes) {
    return <LoadingSpinner />;
  }

  const onDelete = async (noteID: string) => {
    dispatch({
      type: NotesActions.SET_NOTES,
      payload: state.notes.filter((note) => note.id != noteID),
    });
    console.log("note deleted");
  };

  const updateTags = async (updateNotes: boolean, tag?: string) => {
    let newtags = state.tags.filter(
      (value) => !state.deletedTags.includes(value)
    );
    if (tag && tag !== "") newtags.push(tag);
    dispatch({
      type: NotesActions.SET_TAGS,
      payload: newtags,
    });
    dispatch({
      type: NotesActions.SET_MOD_TAGS,
      payload: newtags,
    });
    if (user) {
      try {
        const userRef = doc(db, "users", `${user?.uid}`);

        await updateDoc(userRef, { noteTags: newtags });

        if (updateNotes) {
          const notesRef = collection(db, `users/${user.uid}/notes`);
          const q = query(notesRef, where("tag", "in", state.deletedTags));
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
        dispatch({
          type: NotesActions.SET_NOTES,
          payload: [{ id: noteRef.id, ...newNote }, ...state.notes],
        });
        console.log("Document written with ID: ", noteRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }

      if (!state.tags.includes(tag)) {
        await updateTags(false, tag);
      }
    }
  };

  const handleTagSave = async () => {
    await updateTags(true);
    dispatch({ type: NotesActions.SET_SAVING, payload: false });
    dispatch({ type: NotesActions.SET_DELETED_TAGS, payload: [] });
  };

  const onModalClose = () => {
    dispatch({ type: NotesActions.SET_MOD_TAGS, payload: state.tags });
    dispatch({ type: NotesActions.SET_DELETED_TAGS, payload: [] });
  };

  return (
    <>
      <div className="flex-grow">
        <div className="container mx-auto px-4">
          <div className="mt-4 ml-4">
            {state.tags.length === 0 ? null : (
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
                      dispatch({
                        type: NotesActions.SET_SELECTED_TAG,
                        payload: key,
                      });
                    }}
                  >
                    <Tab key="All notes" title="All notes"></Tab>
                    <Tab key="Tagless Notes" title="Tagless Notes"></Tab>
                    {state.tags.map((tag) => (
                      <Tab key={tag} title={tag}></Tab>
                    ))}
                  </Tabs>
                </ScrollShadow>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 sm:justify-start lg:justify-center">
            <div className="m-4">
              <AddNote onAddNote={addNote} tags={state.tags} />
            </div>
            {state.displayedNotes.map((note) => (
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
                  {state.modTags.map((tag, index) => (
                    <div className="flex my-2" key={tag}>
                      <p className="w-full">{tag}</p>
                      <Button
                        size="sm"
                        variant="bordered"
                        color="danger"
                        onPress={() => {
                          dispatch({
                            type: NotesActions.SET_DELETED_TAGS,
                            payload: [...state.deletedTags, tag],
                          });
                          dispatch({
                            type: NotesActions.SET_MOD_TAGS,
                            payload: state.modTags.filter(
                              (_, i) => i !== index
                            ),
                          });
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
                  isDisabled={state.deletedTags.length == 0}
                  variant="solid"
                  onPress={async () => {
                    dispatch({ type: NotesActions.SET_SAVING, payload: true });
                    await handleTagSave();
                    onClose();
                  }}
                  isLoading={state.saving}
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
