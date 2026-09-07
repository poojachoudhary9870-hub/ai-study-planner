// import { useEffect, useState } from "react";

// import {
//   deleteStudyPlan,
//   getPlanProgress,
//   getPlanTaskCounts,
//   getStudyPlans,
//   type StudyPlan,
// } from "../utils/studyPlanStorage";


// function Progress() {

//   const [plans, setPlans] =
//     useState<StudyPlan[]>([]);


//   useEffect(() => {

//     const loadPlans = () => {
//       setPlans(getStudyPlans());
//     };


//     loadPlans();


//     window.addEventListener(
//       "focus",
//       loadPlans
//     );


//     return () => {

//       window.removeEventListener(
//         "focus",
//         loadPlans
//       );

//     };

//   }, []);


//   const activePlans =
//     plans.filter(
//       (plan) =>
//         getPlanProgress(plan) < 100
//     );


//   const completedPlans =
//     plans.filter(
//       (plan) =>
//         getPlanProgress(plan) === 100
//     );


//   const totalTasks =
//     plans.reduce(
//       (total, plan) =>
//         total +
//         getPlanTaskCounts(plan).total,
//       0
//     );


//   const completedTasks =
//     plans.reduce(
//       (total, plan) =>
//         total +
//         getPlanTaskCounts(plan).completed,
//       0
//     );


//   const overallProgress =
//     totalTasks > 0
//       ? Math.round(
//           (completedTasks /
//             totalTasks) *
//             100
//         )
//       : 0;


//   const removePlan = (
//     planId: string
//   ) => {

//     const confirmed =
//       window.confirm(
//         "Delete this study plan?"
//       );


//     if (!confirmed) {
//       return;
//     }


//     deleteStudyPlan(
//       planId
//     );


//     setPlans(
//       getStudyPlans()
//     );
//   };


//   return (

//     <div className="ml-64 min-h-screen bg-gray-100 p-8">

//       <div className="mx-auto max-w-6xl">

//         {/* Header */}

//         <h1 className="text-3xl font-bold text-gray-900">
//           Progress
//         </h1>

//         <p className="mt-2 text-gray-500">
//           Track all your learning goals in one place.
//         </p>


//         {/* Overall Stats */}

//         <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">


//           <div className="rounded-xl bg-white p-6 shadow-sm">

//             <p className="text-sm text-gray-500">
//               Overall Progress
//             </p>

//             <p className="mt-2 text-3xl font-bold">
//               {overallProgress}%
//             </p>


//             <div className="mt-4 h-2 rounded-full bg-gray-200">

//               <div
//                 className="h-2 rounded-full bg-blue-600 transition-all"
//                 style={{
//                   width: `${overallProgress}%`,
//                 }}
//               />

//             </div>

//           </div>


//           <div className="rounded-xl bg-white p-6 shadow-sm">

//             <p className="text-sm text-gray-500">
//               Active Plans
//             </p>

//             <p className="mt-2 text-3xl font-bold">
//               {activePlans.length}
//             </p>

//           </div>


//           <div className="rounded-xl bg-white p-6 shadow-sm">

//             <p className="text-sm text-gray-500">
//               Completed Plans
//             </p>

//             <p className="mt-2 text-3xl font-bold">
//               {completedPlans.length}
//             </p>

//           </div>

//         </div>


//         {/* In Progress */}

//         <div className="mt-10">

//           <h2 className="text-2xl font-bold text-gray-900">
//             Plans in Progress
//           </h2>

//           <p className="mt-1 text-sm text-gray-500">
//             These are the goals you are currently working on.
//           </p>


//           {activePlans.length === 0 ? (

//             <div className="mt-5 rounded-xl bg-white p-8 text-center shadow-sm">

//               <p className="font-medium text-gray-700">
//                 No active study plans.
//               </p>

//               <p className="mt-1 text-sm text-gray-500">
//                 Generate a plan from the AI Planner to get started.
//               </p>

//             </div>

//           ) : (

//             <div className="mt-5 space-y-5">

//               {activePlans.map(
//                 (plan) => {

//                   const progress =
//                     getPlanProgress(
//                       plan
//                     );


//                   const counts =
//                     getPlanTaskCounts(
//                       plan
//                     );


//                   return (

//                     <div
//                       key={plan.id}
//                       className="rounded-xl bg-white p-6 shadow-sm"
//                     >

//                       <div className="flex flex-col justify-between gap-4 md:flex-row">

//                         <div>

//                           <h3 className="text-xl font-bold text-gray-900">
//                             {plan.goal}
//                           </h3>

//                           <p className="mt-1 text-sm text-gray-500">
//                             Deadline: {plan.deadline}
//                           </p>

//                         </div>


//                         <span className="h-fit rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
//                           In Progress
//                         </span>

//                       </div>


//                       {/* Progress */}

//                       <div className="mt-6">

//                         <div className="mb-2 flex justify-between">

//                           <span className="text-sm font-medium text-gray-600">
//                             Progress
//                           </span>

//                           <span className="text-sm font-semibold text-blue-600">
//                             {progress}%
//                           </span>

//                         </div>


//                         <div className="h-3 rounded-full bg-gray-200">

//                           <div
//                             className="h-3 rounded-full bg-blue-600 transition-all"
//                             style={{
//                               width: `${progress}%`,
//                             }}
//                           />

//                         </div>

//                       </div>


//                       <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">

//                         <div className="rounded-lg bg-gray-50 p-4">

//                           <p className="text-xs text-gray-500">
//                             Daily time
//                           </p>

//                           <p className="mt-1 font-bold">
//                             {plan.dailyHours} hrs
//                           </p>

//                         </div>


//                         <div className="rounded-lg bg-gray-50 p-4">

//                           <p className="text-xs text-gray-500">
//                             Plan length
//                           </p>

//                           <p className="mt-1 font-bold">
//                             {plan.totalDays} days
//                           </p>

//                         </div>


//                         <div className="rounded-lg bg-gray-50 p-4">

//                           <p className="text-xs text-gray-500">
//                             Completed
//                           </p>

//                           <p className="mt-1 font-bold">
//                             {counts.completed}
//                           </p>

//                         </div>


//                         <div className="rounded-lg bg-gray-50 p-4">

//                           <p className="text-xs text-gray-500">
//                             Remaining
//                           </p>

//                           <p className="mt-1 font-bold">
//                             {counts.total -
//                               counts.completed}
//                           </p>

//                         </div>

//                       </div>


//                       <div className="mt-5 flex justify-end">

//                         <button
//                           onClick={() =>
//                             removePlan(
//                               plan.id
//                             )
//                           }
//                           className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
//                         >
//                           Delete Plan
//                         </button>

//                       </div>

//                     </div>

//                   );

//                 }
//               )}

//             </div>

//           )}

//         </div>


//         {/* Completed Plans */}

//         {completedPlans.length > 0 && (

//           <div className="mt-10">

//             <h2 className="text-2xl font-bold text-gray-900">
//               Completed Plans 🎉
//             </h2>


//             <div className="mt-5 space-y-4">

//               {completedPlans.map(
//                 (plan) => (

//                   <div
//                     key={plan.id}
//                     className="rounded-xl border border-green-200 bg-green-50 p-6"
//                   >

//                     <div className="flex items-center justify-between">

//                       <div>

//                         <h3 className="font-bold text-gray-900">
//                           {plan.goal}
//                         </h3>

//                         <p className="mt-1 text-sm text-green-700">
//                           All tasks completed ✓
//                         </p>

//                       </div>


//                       <button
//                         onClick={() =>
//                           removePlan(
//                             plan.id
//                           )
//                         }
//                         className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600"
//                       >
//                         Delete
//                       </button>

//                     </div>

//                   </div>

//                 )
//               )}

//             </div>

//           </div>

//         )}

//       </div>

//     </div>

//   );
// }


// export default Progress;
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
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

function getPlanProgress(plan: StudyPlan): number {
  const allTasks = Array.isArray(plan.days)
    ? plan.days.flatMap((day) =>
        Array.isArray(day.tasks) ? day.tasks : []
      )
    : [];

  if (allTasks.length === 0) {
    return 0;
  }

  const completedTasks = allTasks.filter(
    (task) => task.completed
  ).length;

  return Math.round(
    (completedTasks / allTasks.length) * 100
  );
}

function getPlanTaskCounts(plan: StudyPlan) {
  const allTasks = Array.isArray(plan.days)
    ? plan.days.flatMap((day) =>
        Array.isArray(day.tasks) ? day.tasks : []
      )
    : [];

  const completed = allTasks.filter(
    (task) => task.completed
  ).length;

  return {
    completed,
    total: allTasks.length,
  };
}

function Progress() {
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

      const loadedPlans: StudyPlan[] =
        snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<StudyPlan, "id">),
        }));

      setPlans(loadedPlans);
    } catch (err) {
      console.error("Error loading plans:", err);
      setError("Failed to load your progress.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          loadPlans(user.uid);
        } else {
          setPlans([]);
          setLoading(false);
          setError(
            "Please login to view your progress."
          );
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------
  // ACTIVE & COMPLETED PLANS
  // --------------------------------------------------

  const activePlans = plans.filter(
    (plan) => getPlanProgress(plan) < 100
  );

  const completedPlans = plans.filter(
    (plan) => getPlanProgress(plan) === 100
  );

  // --------------------------------------------------
  // TOTAL TASKS
  // --------------------------------------------------

  const totalTasks = plans.reduce(
    (total, plan) =>
      total + getPlanTaskCounts(plan).total,
    0
  );

  // --------------------------------------------------
  // COMPLETED TASKS
  // --------------------------------------------------

  const completedTasks = plans.reduce(
    (total, plan) =>
      total + getPlanTaskCounts(plan).completed,
    0
  );

  // --------------------------------------------------
  // OVERALL PROGRESS
  // --------------------------------------------------

  const overallProgress =
    totalTasks > 0
      ? Math.round(
          (completedTasks / totalTasks) * 100
        )
      : 0;

  // --------------------------------------------------
  // DELETE PLAN
  // --------------------------------------------------

  const removePlan = async (planId: string) => {
    const confirmed = window.confirm(
      "Delete this study plan?"
    );

    if (!confirmed) {
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      setError("Please login again.");
      return;
    }

    try {
      const planRef = doc(
        db,
        "users",
        user.uid,
        "plans",
        planId
      );

      await deleteDoc(planRef);

      setPlans((prevPlans) =>
        prevPlans.filter(
          (plan) => plan.id !== planId
        )
      );
    } catch (err) {
      console.error("Error deleting plan:", err);
      setError("Failed to delete study plan.");
    }
  };

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="ml-64 flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-500">
          Loading your progress...
        </p>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="ml-64 min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}

        <h1 className="text-3xl font-bold text-gray-900">
          Progress
        </h1>

        <p className="mt-2 text-gray-500">
          Track all your learning goals in one place.
        </p>

        {/* Error */}

        {error && (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Overall Stats */}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* Overall Progress */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Overall Progress
            </p>

            <p className="mt-2 text-3xl font-bold">
              {overallProgress}%
            </p>

            <div className="mt-4 h-2 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-600 transition-all"
                style={{
                  width: `${overallProgress}%`,
                }}
              />
            </div>

          </div>

          {/* Active Plans */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Active Plans
            </p>

            <p className="mt-2 text-3xl font-bold">
              {activePlans.length}
            </p>

          </div>

          {/* Completed Plans */}

          <div className="rounded-xl bg-white p-6 shadow-sm">

            <p className="text-sm text-gray-500">
              Completed Plans
            </p>

            <p className="mt-2 text-3xl font-bold">
              {completedPlans.length}
            </p>

          </div>

        </div>

        {/* In Progress */}

        <div className="mt-10">

          <h2 className="text-2xl font-bold text-gray-900">
            Plans in Progress
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            These are the goals you are currently
            working on.
          </p>

          {activePlans.length === 0 ? (

            <div className="mt-5 rounded-xl bg-white p-8 text-center shadow-sm">

              <p className="font-medium text-gray-700">
                No active study plans.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Generate a plan from the AI Planner
                to get started.
              </p>

            </div>

          ) : (

            <div className="mt-5 space-y-5">

              {activePlans.map((plan) => {

                const progress =
                  getPlanProgress(plan);

                const counts =
                  getPlanTaskCounts(plan);

                return (

                  <div
                    key={plan.id}
                    className="rounded-xl bg-white p-6 shadow-sm"
                  >

                    <div className="flex flex-col justify-between gap-4 md:flex-row">

                      <div>

                        <h3 className="text-xl font-bold text-gray-900">
                          {plan.goal}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Deadline: {plan.deadline}
                        </p>

                      </div>

                      <span className="h-fit rounded-full bg-blue-50 px-4 py-1.5 text-sm font-semibold text-blue-600">
                        In Progress
                      </span>

                    </div>

                    {/* Progress */}

                    <div className="mt-6">

                      <div className="mb-2 flex justify-between">

                        <span className="text-sm font-medium text-gray-600">
                          Progress
                        </span>

                        <span className="text-sm font-semibold text-blue-600">
                          {progress}%
                        </span>

                      </div>

                      <div className="h-3 rounded-full bg-gray-200">

                        <div
                          className="h-3 rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* Stats */}

                    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">

                      <div className="rounded-lg bg-gray-50 p-4">

                        <p className="text-xs text-gray-500">
                          Daily time
                        </p>

                        <p className="mt-1 font-bold">
                          {plan.dailyHours} hrs
                        </p>

                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">

                        <p className="text-xs text-gray-500">
                          Plan length
                        </p>

                        <p className="mt-1 font-bold">
                          {plan.totalDays} days
                        </p>

                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">

                        <p className="text-xs text-gray-500">
                          Completed
                        </p>

                        <p className="mt-1 font-bold">
                          {counts.completed}
                        </p>

                      </div>

                      <div className="rounded-lg bg-gray-50 p-4">

                        <p className="text-xs text-gray-500">
                          Remaining
                        </p>

                        <p className="mt-1 font-bold">
                          {counts.total -
                            counts.completed}
                        </p>

                      </div>

                    </div>

                    {/* Delete */}

                    <div className="mt-5 flex justify-end">

                      <button
                        onClick={() =>
                          removePlan(plan.id)
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Delete Plan
                      </button>

                    </div>

                  </div>

                );
              })}

            </div>

          )}

        </div>

        {/* Completed Plans */}

        {completedPlans.length > 0 && (

          <div className="mt-10">

            <h2 className="text-2xl font-bold text-gray-900">
              Completed Plans 🎉
            </h2>

            <div className="mt-5 space-y-4">

              {completedPlans.map((plan) => (

                <div
                  key={plan.id}
                  className="rounded-xl border border-green-200 bg-green-50 p-6"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <h3 className="font-bold text-gray-900">
                        {plan.goal}
                      </h3>

                      <p className="mt-1 text-sm text-green-700">
                        All tasks completed ✓
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        removePlan(plan.id)
                      }
                      className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

      </div>
    </div>
  );
}

export default Progress;