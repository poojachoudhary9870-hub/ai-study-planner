// import { useEffect, useState } from "react";
// import {
//   getStudyPlans,
//   type StudyPlan,
// } from "../utils/studyPlanStorage";

// function Schedule() {
//   const [plans, setPlans] = useState<StudyPlan[]>([]);

//   useEffect(() => {
//     const loadPlans = () => {
//       setPlans(getStudyPlans());
//     };

//     loadPlans();

//     window.addEventListener("studyPlanUpdated", loadPlans);
//     window.addEventListener("focus", loadPlans);

//     return () => {
//       window.removeEventListener("studyPlanUpdated", loadPlans);
//       window.removeEventListener("focus", loadPlans);
//     };
//   }, []);

//   const today = new Date()
//     .toISOString()
//     .split("T")[0];

//   const todayTasks = plans.flatMap((plan) =>
//     plan.days
//       .filter((day) => day.date === today)
//       .flatMap((day) =>
//         day.tasks.map((task) => ({
//           ...task,
//           planGoal: plan.goal,
//         }))
//       )
//   );

//   return (
//     <div className="ml-64 min-h-screen bg-gray-100 p-8">

//       <h1 className="text-3xl font-bold text-gray-800">
//         Today's Schedule 📅
//       </h1>

//       <p className="mt-2 text-gray-500">
//         Here's your planned study schedule for today.
//       </p>

//       {plans.length === 0 ? (

//         <div className="mt-8 max-w-3xl rounded-xl bg-white p-8 shadow-sm">

//           <h2 className="text-xl font-bold text-gray-800">
//             No study plans yet
//           </h2>

//           <p className="mt-2 text-gray-500">
//             Create an AI study plan to see your tasks here.
//           </p>

//         </div>

//       ) : todayTasks.length === 0 ? (

//         <div className="mt-8 max-w-3xl rounded-xl bg-white p-8 shadow-sm">

//           <h2 className="text-xl font-bold text-gray-800">
//             No tasks scheduled for today
//           </h2>

//           <p className="mt-2 text-gray-500">
//             You have saved study plans, but no tasks are
//             scheduled for today.
//           </p>

//         </div>

//       ) : (

//         <div className="mt-8 max-w-4xl space-y-4">

//           {todayTasks.map((task) => (

//             <div
//               key={task.id}
//               className="flex items-center gap-6 rounded-xl bg-white p-5 shadow-sm"
//             >

//               <input
//                 type="checkbox"
//                 checked={task.completed}
//                 readOnly
//                 className="h-5 w-5"
//               />

//               <div className="flex-1">

//                 <p className="text-sm font-medium text-blue-600">
//                   {task.planGoal}
//                 </p>

//                 <h2
//                   className={`mt-1 font-semibold ${
//                     task.completed
//                       ? "text-gray-400 line-through"
//                       : "text-gray-800"
//                   }`}
//                 >
//                   {task.title}
//                 </h2>

//                 <p className="mt-1 text-sm text-gray-500">
//                   {task.details}
//                 </p>

//                 <div className="mt-2 flex gap-2">

//                   <span className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-600">
//                     {task.type}
//                   </span>

//                   <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
//                     {task.duration} min
//                   </span>

//                 </div>

//               </div>

//             </div>

//           ))}

//         </div>

//       )}

//     </div>
//   );
// }

// export default Schedule;
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "../firebase";

interface Task {
  id: string;
  title: string;
  duration: string;
  type: string;
  details: string;
  completed: boolean;
}

interface StudyDay {
  day: string;
  date: string;
  focus: string;
  tasks: Task[];
}

interface StudyPlan {
  id: string;
  goal: string;
  overview: string;
  totalDays: number;
  dailyHours: number;
  weeklyGoal: string;
  deadline: string;
  createdAt: string;
  days: StudyDay[];
}

interface TodayTask extends Task {
  planGoal: string;
  planId: string;
  dayDate: string;
}

function Schedule() {
  const [plans, setPlans] = useState<StudyPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // LOAD CURRENT USER'S PLANS FROM FIRESTORE
  // --------------------------------------------------

  const loadPlans = async (userId: string) => {
    try {
      setLoading(true);
      setError("");

      const plansRef = collection(
        db,
        "users",
        userId,
        "plans"
      );

      const snapshot = await getDocs(plansRef);

      const loadedPlans: StudyPlan[] = snapshot.docs.map(
        (item) => ({
          id: item.id,
          ...(item.data() as Omit<StudyPlan, "id">),
        })
      );

      setPlans(loadedPlans);
    } catch (err) {
      console.error("Error loading study plans:", err);
      setError("Failed to load your schedule.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadPlans(user.uid);
      } else {
        setPlans([]);
        setLoading(false);
        setError("Please login to view your schedule.");
      }
    });

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------
  // TODAY'S DATE
  // --------------------------------------------------

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // --------------------------------------------------
  // GET TODAY'S TASKS
  // --------------------------------------------------

  const todayTasks: TodayTask[] = plans.flatMap(
    (plan) =>
      Array.isArray(plan.days)
        ? plan.days
            .filter((day) => day.date === today)
            .flatMap((day) =>
              Array.isArray(day.tasks)
                ? day.tasks.map((task) => ({
                    ...task,
                    planGoal: plan.goal,
                    planId: plan.id,
                    dayDate: day.date,
                  }))
                : []
            )
        : []
  );

  // --------------------------------------------------
  // TOGGLE TASK COMPLETION
  // --------------------------------------------------

  const handleToggleTask = async (
    task: TodayTask
  ) => {
    const user = auth.currentUser;

    if (!user) {
      setError("Please login again.");
      return;
    }

    try {
      const plan = plans.find(
        (item) => item.id === task.planId
      );

      if (!plan) return;

      const updatedDays = plan.days.map((day) => {
        if (day.date !== task.dayDate) {
          return day;
        }

        return {
          ...day,
          tasks: day.tasks.map((item) =>
            item.id === task.id
              ? {
                  ...item,
                  completed: !item.completed,
                }
              : item
          ),
        };
      });

      const planRef = doc(
        db,
        "users",
        user.uid,
        "plans",
        task.planId
      );

      await updateDoc(planRef, {
        days: updatedDays,
      });

      // Update local state immediately
      setPlans((prevPlans) =>
        prevPlans.map((item) =>
          item.id === task.planId
            ? {
                ...item,
                days: updatedDays,
              }
            : item
        )
      );
    } catch (err) {
      console.error("Error updating task:", err);
      setError("Failed to update task.");
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="ml-64 flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Loading your schedule...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="ml-64 min-h-screen bg-gray-100 p-8">

      {/* HEADER */}

      <h1 className="text-3xl font-bold text-gray-800">
        Today's Schedule 📅
      </h1>

      <p className="mt-2 text-gray-500">
        Here's your planned study schedule for today.
      </p>

      {/* ERROR */}

      {error && (
        <div className="mt-5 max-w-4xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* NO PLANS */}

      {plans.length === 0 ? (

        <div className="mt-8 max-w-3xl rounded-xl bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold text-gray-800">
            No study plans yet
          </h2>

          <p className="mt-2 text-gray-500">
            Create an AI study plan to see your tasks here.
          </p>

        </div>

      ) : todayTasks.length === 0 ? (

        <div className="mt-8 max-w-3xl rounded-xl bg-white p-8 shadow-sm">

          <h2 className="text-xl font-bold text-gray-800">
            No tasks scheduled for today
          </h2>

          <p className="mt-2 text-gray-500">
            You have saved study plans, but no tasks are
            scheduled for today.
          </p>

        </div>

      ) : (

        <div className="mt-8 max-w-4xl space-y-4">

          {todayTasks.map((task) => (

            <div
              key={`${task.planId}-${task.id}`}
              className="flex items-center gap-6 rounded-xl bg-white p-5 shadow-sm"
            >

              {/* CHECKBOX */}

              <input
                type="checkbox"
                checked={task.completed}
                onChange={() =>
                  handleToggleTask(task)
                }
                className="h-5 w-5 cursor-pointer"
              />

              {/* TASK */}

              <div className="flex-1">

                <p className="text-sm font-medium text-blue-600">
                  {task.planGoal}
                </p>

                <h2
                  className={`mt-1 font-semibold ${
                    task.completed
                      ? "text-gray-400 line-through"
                      : "text-gray-800"
                  }`}
                >
                  {task.title}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {task.details}
                </p>

                <div className="mt-2 flex gap-2">

                  <span className="rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-600">
                    {task.type}
                  </span>

                  <span className="rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {task.duration} min
                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Schedule;