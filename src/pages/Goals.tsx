// import { useEffect, useState } from "react";

// import {
//   collection,
//   addDoc,
//   deleteDoc,
//   doc,
//   onSnapshot,
//   query,
//   orderBy,
//   serverTimestamp,
// } from "firebase/firestore";

// import { auth, db } from "../firebase";

// interface Goal {
//   id: string;
//   title: string;
//   deadline: string;
//   hours: number;
//   createdAt?: string;
// }

// function Goals() {
//   const [goal, setGoal] = useState("");
//   const [deadline, setDeadline] = useState("");
//   const [hours, setHours] = useState("");

//   const [goals, setGoals] = useState<Goal[]>([]);
//   const [loading, setLoading] = useState(true);

//   // --------------------------------------------------
//   // LOAD USER'S GOALS FROM FIRESTORE
//   // --------------------------------------------------

//   useEffect(() => {
//     const user = auth.currentUser;

//     if (!user) {
//       setGoals([]);
//       setLoading(false);
//       return;
//     }

//     const goalsRef = collection(
//       db,
//       "users",
//       user.uid,
//       "goals"
//     );

//     const goalsQuery = query(
//       goalsRef,
//       orderBy("createdAt", "desc")
//     );

//     const unsubscribe = onSnapshot(
//       goalsQuery,
//       (snapshot) => {
//         const loadedGoals: Goal[] = snapshot.docs.map(
//           (goalDoc) => {
//             const data = goalDoc.data();

//             return {
//               id: goalDoc.id,
//               title: data.title,
//               deadline: data.deadline,
//               hours: Number(data.hours),
//               createdAt:
//                 data.createdAt?.toDate?.().toISOString() ||
//                 "",
//             };
//           }
//         );

//         setGoals(loadedGoals);
//         setLoading(false);
//       },
//       (error) => {
//         console.error(
//           "Could not load goals:",
//           error
//         );

//         setLoading(false);
//       }
//     );

//     return () => unsubscribe();
//   }, []);

//   // --------------------------------------------------
//   // ADD GOAL
//   // --------------------------------------------------

//   const addGoal = async () => {
//     // Validation
//     if (!goal.trim()) {
//       alert("Please enter a goal.");
//       return;
//     }

//     if (!deadline) {
//       alert("Please select a deadline.");
//       return;
//     }

//     if (!hours || Number(hours) <= 0) {
//       alert("Please enter valid weekly hours.");
//       return;
//     }

//     const user = auth.currentUser;

//     if (!user) {
//       alert("Please login first.");
//       return;
//     }

//     try {
//       await addDoc(
//         collection(
//           db,
//           "users",
//           user.uid,
//           "goals"
//         ),
//         {
//           title: goal.trim(),
//           deadline: deadline,
//           hours: Number(hours),
//           createdAt: serverTimestamp(),
//         }
//       );

//       // Clear form
//       setGoal("");
//       setDeadline("");
//       setHours("");
//     } catch (error) {
//       console.error(
//         "Could not add goal:",
//         error
//       );

//       alert(
//         "Could not save your goal. Please try again."
//       );
//     }
//   };

//   // --------------------------------------------------
//   // DELETE GOAL
//   // --------------------------------------------------

//   const deleteGoal = async (id: string) => {
//     const user = auth.currentUser;

//     if (!user) {
//       alert("Please login first.");
//       return;
//     }

//     try {
//       await deleteDoc(
//         doc(
//           db,
//           "users",
//           user.uid,
//           "goals",
//           id
//         )
//       );
//     } catch (error) {
//       console.error(
//         "Could not delete goal:",
//         error
//       );

//       alert(
//         "Could not delete the goal. Please try again."
//       );
//     }
//   };

//   // --------------------------------------------------
//   // UI
//   // --------------------------------------------------

//   return (
//     <div className="ml-64 min-h-screen bg-gray-100 p-8">

//       <h1 className="text-3xl font-bold text-gray-800">
//         My Goals 🎯
//       </h1>

//       <p className="mt-2 text-gray-500">
//         Add your study goals and let AI help you plan them.
//       </p>

//       {/* ADD GOAL */}

//       <div className="mt-8 max-w-2xl rounded-xl bg-white p-6 shadow-sm">

//         <h2 className="text-xl font-bold">
//           Add a New Goal
//         </h2>

//         <div className="mt-5 space-y-4">

//           {/* Goal */}

//           <div>
//             <label className="text-sm font-medium">
//               Goal
//             </label>

//             <input
//               type="text"
//               value={goal}
//               onChange={(e) =>
//                 setGoal(e.target.value)
//               }
//               placeholder="e.g. Complete DSA"
//               className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
//             />
//           </div>

//           {/* Deadline */}

//           <div>
//             <label className="text-sm font-medium">
//               Deadline
//             </label>

//             <input
//               type="date"
//               value={deadline}
//               onChange={(e) =>
//                 setDeadline(e.target.value)
//               }
//               className="mt-2 w-full rounded-lg border border-gray-300 p-3"
//             />
//           </div>

//           {/* Hours */}

//           <div>
//             <label className="text-sm font-medium">
//               Hours available per week
//             </label>

//             <input
//               type="number"
//               min="1"
//               value={hours}
//               onChange={(e) =>
//                 setHours(e.target.value)
//               }
//               placeholder="e.g. 10"
//               className="mt-2 w-full rounded-lg border border-gray-300 p-3"
//             />
//           </div>

//           <button
//             onClick={addGoal}
//             className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
//           >
//             + Add Goal
//           </button>

//         </div>
//       </div>

//       {/* GOALS LIST */}

//       <div className="mt-8 max-w-2xl">

//         <h2 className="text-xl font-bold">
//           Your Goals
//         </h2>

//         {loading ? (

//           <p className="mt-4 text-gray-500">
//             Loading your goals...
//           </p>

//         ) : goals.length === 0 ? (

//           <p className="mt-4 text-gray-500">
//             No goals added yet.
//           </p>

//         ) : (

//           <div className="mt-4 space-y-3">

//             {goals.map((item) => (

//               <div
//                 key={item.id}
//                 className="rounded-xl bg-white p-5 shadow-sm"
//               >

//                 <div className="flex items-start justify-between gap-4">

//                   <div>

//                     <p className="font-semibold text-gray-800">
//                       🎯 {item.title}
//                     </p>

//                     <p className="mt-2 text-sm text-gray-500">
//                       Deadline: {item.deadline}
//                     </p>

//                     <p className="text-sm text-gray-500">
//                       Weekly hours: {item.hours}
//                     </p>

//                   </div>

//                   <button
//                     onClick={() =>
//                       deleteGoal(item.id)
//                     }
//                     className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
//                   >
//                     Delete
//                   </button>

//                 </div>

//               </div>

//             ))}

//           </div>

//         )}

//       </div>

//     </div>
//   );
// }

// export default Goals;
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";

interface Goal {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt?: any;
}

function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // GET CURRENT USER'S GOALS
  // --------------------------------------------------

  const loadGoals = async (userId: string) => {
    try {
      setLoading(true);
      setError("");

      const goalsRef = collection(
        db,
        "users",
        userId,
        "goals"
      );

      const snapshot = await getDocs(goalsRef);

      const loadedGoals: Goal[] = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Goal, "id">),
      }));

      setGoals(loadedGoals);
    } catch (err) {
      console.error("Error loading goals:", err);
      setError("Failed to load your goals.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // CHECK AUTHENTICATION
  // --------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadGoals(user.uid);
      } else {
        setGoals([]);
        setLoading(false);
        setError("Please login to view your goals.");
      }
    });

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------
  // ADD GOAL
  // --------------------------------------------------

  const handleAddGoal = async () => {
    setError("");

    if (!title.trim()) {
      setError("Please enter a goal.");
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in to add a goal.");
      return;
    }

    try {
      setSaving(true);

      const goalsRef = collection(
        db,
        "users",
        user.uid,
        "goals"
      );

      const newGoal = {
        title: title.trim(),
        description: description.trim(),
        completed: false,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(goalsRef, newGoal);

      const goalToAdd: Goal = {
        id: docRef.id,
        title: title.trim(),
        description: description.trim(),
        completed: false,
      };

      setGoals((prev) => [...prev, goalToAdd]);

      // Clear form
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error adding goal:", err);
      setError("Failed to add goal.");
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // TOGGLE GOAL
  // --------------------------------------------------

  const handleToggleGoal = async (
    goalId: string,
    currentStatus: boolean
  ) => {
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    try {
      const goalRef = doc(
        db,
        "users",
        user.uid,
        "goals",
        goalId
      );

      await updateDoc(goalRef, {
        completed: !currentStatus,
      });

      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                completed: !currentStatus,
              }
            : goal
        )
      );
    } catch (err) {
      console.error("Error updating goal:", err);
      setError("Failed to update goal.");
    }
  };

  // --------------------------------------------------
  // DELETE GOAL
  // --------------------------------------------------

  const handleDeleteGoal = async (goalId: string) => {
    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    try {
      const goalRef = doc(
        db,
        "users",
        user.uid,
        "goals",
        goalId
      );

      await deleteDoc(goalRef);

      setGoals((prev) =>
        prev.filter((goal) => goal.id !== goalId)
      );
    } catch (err) {
      console.error("Error deleting goal:", err);
      setError("Failed to delete goal.");
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading goals...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            My Goals 🎯
          </h1>

          <p className="mt-2 text-gray-500">
            Set your study goals and track your progress.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ADD GOAL */}

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">

          <h2 className="mb-4 text-xl font-semibold text-gray-800">
            Add New Goal
          </h2>

          <div className="space-y-4">

            {/* TITLE */}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Goal
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Complete DSA"
                className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Add some details about your goal..."
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* BUTTON */}

            <button
              onClick={handleAddGoal}
              disabled={saving}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Adding Goal..." : "Add Goal"}
            </button>

          </div>
        </div>

        {/* GOALS */}

        <div className="space-y-4">

          {goals.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">
                No goals yet.
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Add your first study goal above.
              </p>
            </div>
          ) : (
            goals.map((goal) => (
              <div
                key={goal.id}
                className={`rounded-2xl bg-white p-5 shadow-sm ${
                  goal.completed
                    ? "opacity-70"
                    : ""
                }`}
              >

                <div className="flex items-start justify-between gap-4">

                  {/* GOAL CONTENT */}

                  <div className="flex items-start gap-3">

                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() =>
                        handleToggleGoal(
                          goal.id,
                          goal.completed
                        )
                      }
                      className="mt-1 h-5 w-5 cursor-pointer"
                    />

                    <div>

                      <h3
                        className={`text-lg font-semibold ${
                          goal.completed
                            ? "text-gray-400 line-through"
                            : "text-gray-800"
                        }`}
                      >
                        {goal.title}
                      </h3>

                      {goal.description && (
                        <p
                          className={`mt-1 text-sm ${
                            goal.completed
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        >
                          {goal.description}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* DELETE */}

                  <button
                    onClick={() =>
                      handleDeleteGoal(goal.id)
                    }
                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))
          )}

        </div>

      </div>
    </div>
  );
}

export default Goals;