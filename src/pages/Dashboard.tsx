// import { useEffect, useState } from "react";
// import Sidebar from "../components/Sidebar";

// interface Task {
//   id?: string;
//   title: string;
//   duration: number | string;
//   type: string;
//   description?: string;
//   details?: string;
//   completed?: boolean;
// }

// interface StudyDay {
//   day: number | string;
//   date: string;
//   focus: string;
//   totalHours?: number;
//   tasks: Task[];
// }

// interface StudyPlan {
//   id: string;

//   goal: string;

//   overview: string;

//   totalDays: number;

//   dailyHours: number;

//   weeklyGoal: string;

//   deadline: string;

//   createdAt: string;

//   days: StudyDay[];
// }

// const PLANS_KEY = "ai_study_plans";
// const ACTIVE_PLAN_KEY = "active_ai_study_plan";


// function Dashboard() {
//   const [plan, setPlan] = useState<StudyPlan | null>(null);

//   const [todayTasks, setTodayTasks] = useState<Task[]>([]);

//   const [todayDayIndex, setTodayDayIndex] = useState(0);

//   const [completedToday, setCompletedToday] = useState(0);

//   const [totalToday, setTotalToday] = useState(0);

//   const [completedTasks, setCompletedTasks] = useState(0);

//   const [totalTasks, setTotalTasks] = useState(0);

//   const [studyHours, setStudyHours] = useState(0);

//   const [hasExactToday, setHasExactToday] = useState(false);


//   /*
//    * Get today's date in local timezone.
//    *
//    * Using toISOString() can sometimes give the previous
//    * or next date depending on timezone.
//    */
//   const getTodayDate = () => {
//     const today = new Date();

//     const year = today.getFullYear();

//     const month = String(
//       today.getMonth() + 1
//     ).padStart(2, "0");

//     const day = String(
//       today.getDate()
//     ).padStart(2, "0");

//     return `${year}-${month}-${day}`;
//   };


//   /*
//    * Convert task duration into minutes.
//    *
//    * AI normally returns a number such as:
//    * 45
//    *
//    * But this also safely handles:
//    * "45"
//    * "45 minutes"
//    * "1 hour"
//    * "1.5 hours"
//    */
//   const getDurationInMinutes = (
//     duration: number | string
//   ): number => {

//     if (typeof duration === "number") {
//       return duration;
//     }

//     const text = String(duration)
//       .toLowerCase()
//       .trim();

//     const numberMatch =
//       text.match(/[\d.]+/);

//     if (!numberMatch) {
//       return 0;
//     }

//     const value = Number(
//       numberMatch[0]
//     );

//     if (text.includes("hour")) {
//       return value * 60;
//     }

//     return value;
//   };


//   /*
//    * Load the active study plan.
//    *
//    * If there is no active plan, automatically use
//    * the latest saved plan.
//    */
//   const loadPlan = () => {

//     try {

//       let activePlan =
//         localStorage.getItem(
//           ACTIVE_PLAN_KEY
//         );


//       /*
//        * If no active plan exists,
//        * get the latest saved plan.
//        */
//       if (!activePlan) {

//         const savedPlans: StudyPlan[] =
//           JSON.parse(
//             localStorage.getItem(
//               PLANS_KEY
//             ) || "[]"
//           );


//         if (savedPlans.length > 0) {

//           const latestPlan =
//             savedPlans[
//               savedPlans.length - 1
//             ];


//           localStorage.setItem(
//             ACTIVE_PLAN_KEY,
//             JSON.stringify(latestPlan)
//           );


//           activePlan =
//             JSON.stringify(latestPlan);
//         }
//       }


//       /*
//        * Still no plan?
//        */
//       if (!activePlan) {

//         setPlan(null);

//         setTodayTasks([]);

//         setCompletedToday(0);

//         setTotalToday(0);

//         setCompletedTasks(0);

//         setTotalTasks(0);

//         setStudyHours(0);

//         return;
//       }


//       const parsedPlan: StudyPlan =
//         JSON.parse(activePlan);


//       setPlan(parsedPlan);


//       /*
//        * Make sure days exists.
//        */
//       if (
//         !parsedPlan.days ||
//         !Array.isArray(parsedPlan.days)
//       ) {

//         setTodayTasks([]);

//         return;
//       }


//       const today = getTodayDate();


//       /*
//        * First try to find today's exact day.
//        */
//       let dayIndex =
//         parsedPlan.days.findIndex(
//           (day) =>
//             day.date === today
//         );


//       let exactToday = true;


//       /*
//        * If today's date isn't found,
//        * use the first unfinished day.
//        *
//        * This prevents the dashboard from
//        * becoming empty after a plan is generated
//        * with dates that don't exactly match.
//        */
//       if (dayIndex === -1) {

//         dayIndex =
//           parsedPlan.days.findIndex(
//             (day) =>
//               day.tasks?.some(
//                 (task) =>
//                   !task.completed
//               )
//           );

//         exactToday = false;
//       }


//       /*
//        * If there are no unfinished days,
//        * show the last day.
//        */
//       if (dayIndex === -1) {

//         dayIndex =
//           parsedPlan.days.length - 1;

//         exactToday = false;
//       }


//       const currentDay =
//         parsedPlan.days[dayIndex];


//       const tasks =
//         currentDay?.tasks || [];


//       setTodayDayIndex(dayIndex);

//       setTodayTasks(tasks);

//       setHasExactToday(exactToday);


//       /*
//        * Today's/current day's progress
//        */
//       const todayCompleted =
//         tasks.filter(
//           (task) =>
//             task.completed === true
//         ).length;


//       setCompletedToday(
//         todayCompleted
//       );


//       setTotalToday(
//         tasks.length
//       );


//       /*
//        * Overall plan progress
//        */
//       const allTasks =
//         parsedPlan.days.flatMap(
//           (day) =>
//             day.tasks || []
//         );


//       const completed =
//         allTasks.filter(
//           (task) =>
//             task.completed === true
//         ).length;


//       setCompletedTasks(
//         completed
//       );


//       setTotalTasks(
//         allTasks.length
//       );


//       /*
//        * Calculate today's completed
//        * study hours.
//        */
//       const completedMinutes =
//         tasks
//           .filter(
//             (task) =>
//               task.completed === true
//           )
//           .reduce(
//             (total, task) =>
//               total +
//               getDurationInMinutes(
//                 task.duration
//               ),
//             0
//           );


//       setStudyHours(
//         Math.round(
//           (completedMinutes / 60) * 10
//         ) / 10
//       );

//     } catch (error) {

//       console.error(
//         "Could not load study plan:",
//         error
//       );

//       setPlan(null);

//     }
//   };


//   /*
//    * Load dashboard when component starts.
//    */
//   useEffect(() => {

//     loadPlan();


//     /*
//      * When localStorage changes
//      * from another tab/window.
//      */
//     window.addEventListener(
//       "storage",
//       loadPlan
//     );


//     /*
//      * When user comes back to Dashboard.
//      */
//     window.addEventListener(
//       "focus",
//       loadPlan
//     );


//     /*
//      * Custom event sent by AI Planner
//      * when a plan is created/updated.
//      */
//     window.addEventListener(
//       "studyPlanUpdated",
//       loadPlan
//     );


//     return () => {

//       window.removeEventListener(
//         "storage",
//         loadPlan
//       );

//       window.removeEventListener(
//         "focus",
//         loadPlan
//       );

//       window.removeEventListener(
//         "studyPlanUpdated",
//         loadPlan
//       );

//     };

//   }, []);


//   /*
//    * Toggle today's task.
//    */
//   const toggleTask = (
//     taskIndex: number
//   ) => {

//     if (!plan) {
//       return;
//     }


//     /*
//      * Create a new copy of the plan.
//      */
//     const updatedPlan: StudyPlan = {
//       ...plan,

//       days: plan.days.map(
//         (day, index) => {

//           if (
//             index !== todayDayIndex
//           ) {
//             return day;
//           }


//           return {
//             ...day,

//             tasks: day.tasks.map(
//               (task, index) => {

//                 if (
//                   index !== taskIndex
//                 ) {
//                   return task;
//                 }


//                 return {
//                   ...task,

//                   completed:
//                     !task.completed,
//                 };

//               }
//             ),
//           };

//         }
//       ),
//     };


//     /*
//      * Save active plan.
//      */
//     localStorage.setItem(
//       ACTIVE_PLAN_KEY,
//       JSON.stringify(updatedPlan)
//     );


//     /*
//      * Update the plan inside
//      * all saved plans.
//      */
//     try {

//       const savedPlans: StudyPlan[] =
//         JSON.parse(
//           localStorage.getItem(
//             PLANS_KEY
//           ) || "[]"
//         );


//       const updatedPlans =
//         savedPlans.map(
//           (savedPlan) =>
//             savedPlan.id ===
//             updatedPlan.id
//               ? updatedPlan
//               : savedPlan
//         );


//       localStorage.setItem(
//         PLANS_KEY,
//         JSON.stringify(
//           updatedPlans
//         )
//       );

//     } catch (error) {

//       console.error(
//         "Could not update saved plans:",
//         error
//       );

//     }


//     /*
//      * Update Dashboard immediately.
//      */
//     setPlan(updatedPlan);


//     /*
//      * Reload all calculated values.
//      */
//     loadPlan();


//     /*
//      * Notify other pages/components.
//      */
//     window.dispatchEvent(
//       new Event(
//         "studyPlanUpdated"
//       )
//     );

//   };


//   /*
//    * Today's progress.
//    */
//   const todayProgress =
//     totalToday > 0
//       ? Math.round(
//           (completedToday /
//             totalToday) *
//             100
//         )
//       : 0;


//   /*
//    * Overall plan progress.
//    */
//   const overallProgress =
//     totalTasks > 0
//       ? Math.round(
//           (completedTasks /
//             totalTasks) *
//             100
//         )
//       : 0;


//   return (

//     <div>

//       <Sidebar />


//       <main className="ml-64 min-h-screen bg-gray-100 p-8">


//         {/* HEADER */}

//         <h1 className="text-3xl font-bold text-gray-800">

//           Good Morning 👋

//         </h1>


//         <p className="mt-2 text-gray-500">

//           Let's make today productive.

//         </p>



//         {/* NO PLAN */}

//         {!plan ? (

//           <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">

//             <h2 className="text-xl font-bold text-gray-800">

//               No study plan found

//             </h2>


//             <p className="mt-2 text-gray-500">

//               Create a study plan from the AI Planner
//               to see your tasks and progress here.

//             </p>

//           </div>

//         ) : (

//           <>


//             {/* STATS */}

//             <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">


//               {/* TODAY'S PROGRESS */}

//               <div className="rounded-xl bg-white p-6 shadow-sm">

//                 <p className="text-gray-500">

//                   Today's Progress

//                 </p>


//                 <h2 className="mt-3 text-3xl font-bold">

//                   {todayProgress}%

//                 </h2>


//                 <div className="mt-4 h-3 rounded-full bg-gray-200">

//                   <div

//                     className="h-3 rounded-full bg-blue-500 transition-all"

//                     style={{
//                       width:
//                         `${todayProgress}%`,
//                     }}

//                   />

//                 </div>


//                 <p className="mt-2 text-sm text-gray-500">

//                   {completedToday} of{" "}

//                   {totalToday} tasks completed

//                 </p>

//               </div>



//               {/* STUDY HOURS */}

//               <div className="rounded-xl bg-white p-6 shadow-sm">

//                 <p className="text-gray-500">

//                   Study Hours

//                 </p>


//                 <h2 className="mt-3 text-3xl font-bold">

//                   {studyHours} hrs

//                 </h2>


//                 <p className="mt-2 text-sm text-gray-500">

//                   Today's target:{" "}

//                   {plan.dailyHours} hrs

//                 </p>

//               </div>



//               {/* OVERALL PROGRESS */}

//               <div className="rounded-xl bg-white p-6 shadow-sm">

//                 <p className="text-gray-500">

//                   Overall Plan Progress

//                 </p>


//                 <h2 className="mt-3 text-3xl font-bold">

//                   {overallProgress}%

//                 </h2>


//                 <p className="mt-2 text-sm text-gray-500">

//                   {completedTasks} of{" "}

//                   {totalTasks} tasks completed

//                 </p>

//               </div>

//             </div>



//             {/* ACTIVE PLAN */}

//             <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

//               <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">


//                 <div>

//                   <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">

//                     Active Study Plan

//                   </p>


//                   <h2 className="mt-1 text-2xl font-bold text-gray-800">

//                     {plan.goal}

//                   </h2>


//                   <p className="mt-1 text-sm text-gray-500">

//                     Deadline: {plan.deadline}

//                   </p>

//                 </div>


//                 <div className="rounded-lg bg-blue-50 px-4 py-3">

//                   <p className="text-xs text-gray-500">

//                     Plan Progress

//                   </p>


//                   <p className="text-xl font-bold text-blue-600">

//                     {overallProgress}%

//                   </p>

//                 </div>

//               </div>


//               {plan.overview && (

//                 <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-500">

//                   {plan.overview}

//                 </p>

//               )}

//             </div>



//             {/* TODAY'S / CURRENT TASKS */}

//             <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">


//               <h2 className="text-xl font-bold text-gray-800">

//                 {hasExactToday
//                   ? "Today's Tasks"
//                   : "Current Tasks"}

//               </h2>


//               {!hasExactToday && (

//                 <p className="mt-1 text-sm text-gray-500">

//                   Today's date was not found in the plan,
//                   so these are the next unfinished tasks.

//                 </p>

//               )}


//               {todayTasks.length === 0 ? (

//                 <div className="mt-5 rounded-lg bg-gray-50 p-5">

//                   <p className="text-gray-500">

//                     No tasks scheduled.

//                   </p>

//                 </div>

//               ) : (

//                 <div className="mt-5 space-y-4">

//                   {todayTasks.map(
//                     (task, index) => (

//                       <div

//                         key={
//                           task.id ||
//                           index
//                         }

//                         className={`flex items-center justify-between border-b pb-4 ${
//                           task.completed
//                             ? "opacity-60"
//                             : ""
//                         }`}

//                       >


//                         <div className="pr-4">


//                           <p

//                             className={`font-medium ${
//                               task.completed
//                                 ? "text-gray-400 line-through"
//                                 : "text-gray-800"
//                             }`}

//                           >

//                             {task.title}

//                           </p>


//                           <p className="text-sm text-gray-500">

//                             {getDurationInMinutes(
//                               task.duration
//                             )}{" "}

//                             minutes

//                           </p>


//                           {task.type && (

//                             <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-600">

//                               {task.type}

//                             </span>

//                           )}


//                           {(task.details ||
//                             task.description) && (

//                             <p className="mt-2 text-sm text-gray-500">

//                               {task.details ||
//                                 task.description}

//                             </p>

//                           )}

//                         </div>


//                         <input

//                           type="checkbox"

//                           checked={
//                             task.completed ===
//                             true
//                           }

//                           onChange={() =>
//                             toggleTask(index)
//                           }

//                           className="h-5 w-5 cursor-pointer"

//                         />

//                       </div>

//                     )
//                   )}

//                 </div>

//               )}

//             </div>



//             {/* AI RECOMMENDATION */}

//             <div className="mt-8 rounded-xl bg-blue-600 p-6 text-white shadow-sm">


//               <h2 className="text-xl font-bold">

//                 🤖 AI Recommendation

//               </h2>


//               <p className="mt-3">

//                 Your current focus is{" "}

//                 <strong>

//                   {plan.days?.[
//                     todayDayIndex
//                   ]?.focus ||
//                     plan.goal}

//                 </strong>

//                 .


//                 {totalToday -
//                   completedToday >
//                 0 ? (

//                   <>

//                     {" "}
//                     You have{" "}

//                     <strong>

//                       {totalToday -
//                         completedToday}

//                     </strong>{" "}

//                     unfinished task
//                     {totalToday -
//                       completedToday !==
//                     1
//                       ? "s"
//                       : ""}{" "}

//                     remaining. Complete them
//                     before moving ahead.

//                   </>

//                 ) : (

//                   <> Great job! You've completed
//                   all the tasks for this day. 🎉</>

//                 )}

//               </p>

//             </div>


//           </>

//         )}

//       </main>

//     </div>

//   );

// }


// export default Dashboard;
import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";

import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

// --------------------------------------------------
// TYPES
// --------------------------------------------------

interface Task {
  id?: string;
  title: string;
  duration: number | string;
  type: string;
  description?: string;
  details?: string;
  completed?: boolean;
}

interface StudyDay {
  day: number | string;
  date: string;
  focus: string;
  totalHours?: number;
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

function Dashboard() {

  const [plan, setPlan] =
    useState<StudyPlan | null>(
      null
    );

  const [todayTasks, setTodayTasks] =
    useState<Task[]>([]);

  const [todayDayIndex, setTodayDayIndex] =
    useState(0);

  const [completedToday, setCompletedToday] =
    useState(0);

  const [totalToday, setTotalToday] =
    useState(0);

  const [completedTasks, setCompletedTasks] =
    useState(0);

  const [totalTasks, setTotalTasks] =
    useState(0);

  const [studyHours, setStudyHours] =
    useState(0);

  const [hasExactToday, setHasExactToday] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // --------------------------------------------------
  // GET TODAY'S DATE
  // --------------------------------------------------

  const getTodayDate = () => {

    const today =
      new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // --------------------------------------------------
  // CONVERT DURATION TO MINUTES
  // --------------------------------------------------

  const getDurationInMinutes = (
    duration:
      | number
      | string
  ): number => {

    if (
      typeof duration ===
      "number"
    ) {
      return duration;
    }

    const text =
      String(duration)
        .toLowerCase()
        .trim();

    const numberMatch =
      text.match(
        /[\d.]+/
      );

    if (!numberMatch) {
      return 0;
    }

    const value =
      Number(
        numberMatch[0]
      );

    if (
      text.includes("hour")
    ) {
      return value * 60;
    }

    return value;
  };

  // --------------------------------------------------
  // LOAD PLAN FROM FIRESTORE
  // --------------------------------------------------

  const loadPlan =
    async () => {

      try {

        setLoading(true);

        const user =
          auth.currentUser;

        // No logged-in user
        if (!user) {

          setPlan(null);
          setTodayTasks([]);

          setCompletedToday(0);
          setTotalToday(0);

          setCompletedTasks(0);
          setTotalTasks(0);

          setStudyHours(0);

          setLoading(false);

          return;
        }

        // --------------------------------------------------
        // FIRESTORE PATH
        // users/{uid}/plans
        // --------------------------------------------------

        const plansRef =
          collection(
            db,
            "users",
            user.uid,
            "plans"
          );

        const plansQuery =
          query(
            plansRef,
            orderBy(
              "createdAt",
              "desc"
            )
          );

        const snapshot =
          await getDocs(
            plansQuery
          );

        // No plans
        if (
          snapshot.empty
        ) {

          setPlan(null);
          setTodayTasks([]);

          setCompletedToday(0);
          setTotalToday(0);

          setCompletedTasks(0);
          setTotalTasks(0);

          setStudyHours(0);

          setLoading(false);

          return;
        }

        // --------------------------------------------------
        // GET LATEST PLAN
        // --------------------------------------------------

        const planDoc =
          snapshot.docs[0];

        const data =
          planDoc.data();

        const loadedPlan:
          StudyPlan = {

          id:
            planDoc.id,

          goal:
            data.goal || "",

          overview:
            data.overview || "",

          totalDays:
            Number(
              data.totalDays
            ) || 0,

          dailyHours:
            Number(
              data.dailyHours
            ) || 0,

          weeklyGoal:
            data.weeklyGoal || "",

          deadline:
            data.deadline || "",

          createdAt:
            data.createdAt
              ?.toDate?.()
              ?.toISOString() ||
            data.createdAt ||
            "",

          days:
            Array.isArray(
              data.days
            )
              ? data.days
              : [],
        };

        setPlan(
          loadedPlan
        );

        // --------------------------------------------------
        // MAKE SURE DAYS EXIST
        // --------------------------------------------------

        if (
          !Array.isArray(
            loadedPlan.days
          ) ||
          loadedPlan.days.length ===
            0
        ) {

          setTodayTasks([]);

          setCompletedToday(0);
          setTotalToday(0);

          setCompletedTasks(0);
          setTotalTasks(0);

          setStudyHours(0);

          setLoading(false);

          return;
        }

        // --------------------------------------------------
        // FIND TODAY
        // --------------------------------------------------

        const today =
          getTodayDate();

        let dayIndex =
          loadedPlan.days.findIndex(
            (day) =>
              day.date ===
              today
          );

        let exactToday =
          true;

        // --------------------------------------------------
        // IF TODAY NOT FOUND
        // USE FIRST UNFINISHED DAY
        // --------------------------------------------------

        if (
          dayIndex === -1
        ) {

          dayIndex =
            loadedPlan.days.findIndex(
              (day) =>
                day.tasks?.some(
                  (task) =>
                    !task.completed
                )
            );

          exactToday =
            false;
        }

        // --------------------------------------------------
        // IF EVERYTHING COMPLETED
        // SHOW LAST DAY
        // --------------------------------------------------

        if (
          dayIndex === -1
        ) {

          dayIndex =
            loadedPlan.days.length -
            1;

          exactToday =
            false;
        }

        const currentDay =
          loadedPlan.days[
            dayIndex
          ];

        const tasks =
          currentDay?.tasks ||
          [];

        setTodayDayIndex(
          dayIndex
        );

        setTodayTasks(
          tasks
        );

        setHasExactToday(
          exactToday
        );

        // --------------------------------------------------
        // TODAY PROGRESS
        // --------------------------------------------------

        const todayCompleted =
          tasks.filter(
            (task) =>
              task.completed ===
              true
          ).length;

        setCompletedToday(
          todayCompleted
        );

        setTotalToday(
          tasks.length
        );

        // --------------------------------------------------
        // OVERALL PROGRESS
        // --------------------------------------------------

        const allTasks =
          loadedPlan.days.flatMap(
            (day) =>
              day.tasks || []
          );

        const completed =
          allTasks.filter(
            (task) =>
              task.completed ===
              true
          ).length;

        setCompletedTasks(
          completed
        );

        setTotalTasks(
          allTasks.length
        );

        // --------------------------------------------------
        // STUDY HOURS
        // --------------------------------------------------

        const completedMinutes =
          tasks
            .filter(
              (task) =>
                task.completed ===
                true
            )
            .reduce(
              (
                total,
                task
              ) =>
                total +
                getDurationInMinutes(
                  task.duration
                ),
              0
            );

        setStudyHours(
          Math.round(
            (completedMinutes /
              60) *
              10
          ) / 10
        );

      } catch (error) {

        console.error(
          "Could not load study plan:",
          error
        );

        setPlan(null);

      } finally {

        setLoading(false);
      }
    };

  // --------------------------------------------------
  // LOAD WHEN DASHBOARD OPENS
  // --------------------------------------------------

  useEffect(() => {

    loadPlan();

    // Refresh when user
    // returns to this tab
    const handleFocus =
      () => {
        loadPlan();
      };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {

      window.removeEventListener(
        "focus",
        handleFocus
      );

    };

  }, []);

  // --------------------------------------------------
  // TOGGLE TASK
  // --------------------------------------------------

  const toggleTask =
    async (
      taskIndex: number
    ) => {

      if (!plan) {
        return;
      }

      const user =
        auth.currentUser;

      if (!user) {
        return;
      }

      try {

        // --------------------------------------------------
        // CREATE UPDATED PLAN
        // --------------------------------------------------

        const updatedPlan:
          StudyPlan = {

          ...plan,

          days:
            plan.days.map(
              (
                day,
                index
              ) => {

                if (
                  index !==
                  todayDayIndex
                ) {
                  return day;
                }

                return {

                  ...day,

                  tasks:
                    day.tasks.map(
                      (
                        task,
                        index
                      ) => {

                        if (
                          index !==
                          taskIndex
                        ) {
                          return task;
                        }

                        return {

                          ...task,

                          completed:
                            !task.completed,

                        };
                      }
                    ),

                };
              }
            ),

        };

        // --------------------------------------------------
        // SAVE TO FIRESTORE
        // --------------------------------------------------

        await updateDoc(
          doc(
            db,
            "users",
            user.uid,
            "plans",
            updatedPlan.id
          ),
          {
            days:
              updatedPlan.days,
          }
        );

        // --------------------------------------------------
        // UPDATE UI
        // --------------------------------------------------

        setPlan(
          updatedPlan
        );

        const currentDay =
          updatedPlan.days[
            todayDayIndex
          ];

        const tasks =
          currentDay?.tasks ||
          [];

        setTodayTasks(
          tasks
        );

        // --------------------------------------------------
        // TODAY COUNTS
        // --------------------------------------------------

        const todayCompleted =
          tasks.filter(
            (task) =>
              task.completed ===
              true
          ).length;

        setCompletedToday(
          todayCompleted
        );

        setTotalToday(
          tasks.length
        );

        // --------------------------------------------------
        // OVERALL COUNTS
        // --------------------------------------------------

        const allTasks =
          updatedPlan.days.flatMap(
            (day) =>
              day.tasks || []
          );

        const completed =
          allTasks.filter(
            (task) =>
              task.completed ===
              true
          ).length;

        setCompletedTasks(
          completed
        );

        setTotalTasks(
          allTasks.length
        );

        // --------------------------------------------------
        // STUDY HOURS
        // --------------------------------------------------

        const completedMinutes =
          tasks
            .filter(
              (task) =>
                task.completed ===
                true
            )
            .reduce(
              (
                total,
                task
              ) =>
                total +
                getDurationInMinutes(
                  task.duration
                ),
              0
            );

        setStudyHours(
          Math.round(
            (completedMinutes /
              60) *
              10
          ) / 10
        );

      } catch (error) {

        console.error(
          "Could not update task:",
          error
        );

      }
    };

  // --------------------------------------------------
  // PROGRESS
  // --------------------------------------------------

  const todayProgress =
    totalToday > 0
      ? Math.round(
          (completedToday /
            totalToday) *
            100
        )
      : 0;

  const overallProgress =
    totalTasks > 0
      ? Math.round(
          (completedTasks /
            totalTasks) *
            100
        )
      : 0;

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div>

      <Sidebar />

      <main className="ml-64 min-h-screen bg-gray-100 p-8">

        {/* HEADER */}

        <h1 className="text-3xl font-bold text-gray-800">
          Good Morning 👋
        </h1>

        <p className="mt-2 text-gray-500">
          Let's make today productive.
        </p>

        {/* LOADING */}

        {loading ? (

          <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">

            <p className="text-gray-500">
              Loading your study plan...
            </p>

          </div>

        ) : !plan ? (

          /* NO PLAN */

          <div className="mt-8 rounded-xl bg-white p-8 shadow-sm">

            <h2 className="text-xl font-bold text-gray-800">
              No study plan found
            </h2>

            <p className="mt-2 text-gray-500">
              Create a study plan from the AI Planner
              to see your tasks and progress here.
            </p>

          </div>

        ) : (

          <>

            {/* STATS */}

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

              {/* TODAY'S PROGRESS */}

              <div className="rounded-xl bg-white p-6 shadow-sm">

                <p className="text-gray-500">
                  Today's Progress
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  {todayProgress}%
                </h2>

                <div className="mt-4 h-3 rounded-full bg-gray-200">

                  <div
                    className="h-3 rounded-full bg-blue-500 transition-all"
                    style={{
                      width:
                        `${todayProgress}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-sm text-gray-500">
                  {completedToday} of{" "}
                  {totalToday} tasks completed
                </p>

              </div>

              {/* STUDY HOURS */}

              <div className="rounded-xl bg-white p-6 shadow-sm">

                <p className="text-gray-500">
                  Study Hours
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  {studyHours} hrs
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Today's target:{" "}
                  {plan.dailyHours} hrs
                </p>

              </div>

              {/* OVERALL PROGRESS */}

              <div className="rounded-xl bg-white p-6 shadow-sm">

                <p className="text-gray-500">
                  Overall Plan Progress
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  {overallProgress}%
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  {completedTasks} of{" "}
                  {totalTasks} tasks completed
                </p>

              </div>

            </div>

            {/* ACTIVE PLAN */}

            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

                <div>

                  <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                    Active Study Plan
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-800">
                    {plan.goal}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Deadline:{" "}
                    {plan.deadline}
                  </p>

                </div>

                <div className="rounded-lg bg-blue-50 px-4 py-3">

                  <p className="text-xs text-gray-500">
                    Plan Progress
                  </p>

                  <p className="text-xl font-bold text-blue-600">
                    {overallProgress}%
                  </p>

                </div>

              </div>

              {plan.overview && (
                <p className="mt-4 max-w-3xl text-sm leading-6 text-gray-500">
                  {plan.overview}
                </p>
              )}

            </div>

            {/* TODAY'S TASKS */}

            <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold text-gray-800">

                {hasExactToday
                  ? "Today's Tasks"
                  : "Current Tasks"}

              </h2>

              {!hasExactToday && (
                <p className="mt-1 text-sm text-gray-500">
                  Today's date was not found in the plan,
                  so these are the next unfinished tasks.
                </p>
              )}

              {todayTasks.length ===
              0 ? (

                <div className="mt-5 rounded-lg bg-gray-50 p-5">

                  <p className="text-gray-500">
                    No tasks scheduled.
                  </p>

                </div>

              ) : (

                <div className="mt-5 space-y-4">

                  {todayTasks.map(
                    (
                      task,
                      index
                    ) => (

                      <div
                        key={
                          task.id ||
                          index
                        }
                        className={`flex items-center justify-between border-b pb-4 ${
                          task.completed
                            ? "opacity-60"
                            : ""
                        }`}
                      >

                        <div className="pr-4">

                          <p
                            className={`font-medium ${
                              task.completed
                                ? "text-gray-400 line-through"
                                : "text-gray-800"
                            }`}
                          >
                            {task.title}
                          </p>

                          <p className="text-sm text-gray-500">

                            {
                              getDurationInMinutes(
                                task.duration
                              )
                            }{" "}
                            minutes

                          </p>

                          {task.type && (

                            <span className="mt-1 inline-block rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-600">
                              {task.type}
                            </span>

                          )}

                          {(task.details ||
                            task.description) && (

                            <p className="mt-2 text-sm text-gray-500">
                              {
                                task.details ||
                                task.description
                              }
                            </p>

                          )}

                        </div>

                        <input
                          type="checkbox"
                          checked={
                            task.completed ===
                            true
                          }
                          onChange={() =>
                            toggleTask(
                              index
                            )
                          }
                          className="h-5 w-5 cursor-pointer"
                        />

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

            {/* AI RECOMMENDATION */}

            <div className="mt-8 rounded-xl bg-blue-600 p-6 text-white shadow-sm">

              <h2 className="text-xl font-bold">
                🤖 AI Recommendation
              </h2>

              <p className="mt-3">

                Your current focus is{" "}

                <strong>
                  {plan.days?.[
                    todayDayIndex
                  ]?.focus ||
                    plan.goal}
                </strong>
                .

                {totalToday -
                  completedToday >
                0 ? (

                  <>

                    {" "}
                    You have{" "}

                    <strong>
                      {
                        totalToday -
                        completedToday
                      }
                    </strong>{" "}

                    unfinished task
                    {totalToday -
                      completedToday !==
                    1
                      ? "s"
                      : ""}{" "}
                    remaining. Complete them
                    before moving ahead.

                  </>

                ) : (

                  <>
                    {" "}
                    Great job! You've completed
                    all the tasks for this day. 🎉
                  </>

                )}

              </p>

            </div>

          </>

        )}

      </main>

    </div>
  );
}

export default Dashboard;