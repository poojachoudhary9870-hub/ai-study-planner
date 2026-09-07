// import { useEffect, useState } from "react";

// import {
//   addStudyPlan,
//   deleteStudyPlan,
//   getPlanProgress,
//   getPlanTaskCounts,
//   getStudyPlans,
//   updateStudyPlan,
//   type StudyDay,
//   type StudyPlan,
//   type Task,
// } from "../utils/studyPlanStorage";


// function AIPlanner() {
//   const [goal, setGoal] = useState("");
//   const [hours, setHours] = useState("");
//   const [deadline, setDeadline] = useState("");

//   const [plan, setPlan] = useState<StudyPlan | null>(null);

//   const [savedPlans, setSavedPlans] = useState<StudyPlan[]>([]);

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   /*
//    * Load all previously generated plans
//    */
//   useEffect(() => {
//     setSavedPlans(getStudyPlans());
//   }, []);


//   /*
//    * Convert whatever the AI sends into our safe structure.
//    */
//   const normalizePlan = (receivedPlan: any): StudyPlan => {
//     let parsedPlan = receivedPlan;

//     if (typeof parsedPlan === "string") {
//       try {
//         parsedPlan = JSON.parse(parsedPlan);
//       } catch {
//         parsedPlan = {};
//       }
//     }

//     if (!parsedPlan || typeof parsedPlan !== "object") {
//       parsedPlan = {};
//     }

//     const receivedDays = Array.isArray(parsedPlan.days)
//       ? parsedPlan.days
//       : [];

//     const safeDays: StudyDay[] = receivedDays.map(
//       (day: any, dayIndex: number) => {

//         const receivedTasks = Array.isArray(day?.tasks)
//           ? day.tasks
//           : [];

//         const safeTasks: Task[] = receivedTasks.map(
//           (task: any, taskIndex: number) => ({
//             id:
//               task?.id ||
//               `${Date.now()}-${dayIndex}-${taskIndex}`,

//             title:
//               task?.title ||
//               "Study task",

//             duration:
//               task?.duration ||
//               "1 hour",

//             type:
//               task?.type ||
//               "Study",

//             details:
//               task?.details ||
//               "Complete this task and review what you learned.",

//             completed:
//               Boolean(task?.completed),
//           })
//         );

//         return {
//           day:
//             day?.day ||
//             `Day ${dayIndex + 1}`,

//           date:
//             day?.date ||
//             "",

//           focus:
//             day?.focus ||
//             "Study",

//           tasks: safeTasks,
//         };
//       }
//     );

//     return {
//       id: crypto.randomUUID(),

//       goal,

//       overview:
//         parsedPlan.overview ||
//         `A personalized study plan for ${goal}. Follow the daily tasks consistently and review your progress each week.`,

//       totalDays:
//         Number(parsedPlan.totalDays) ||
//         safeDays.length ||
//         1,

//       dailyHours:
//         Number(parsedPlan.dailyHours) ||
//         Number(hours) ||
//         1,

//       weeklyGoal:
//         parsedPlan.weeklyGoal ||
//         "Complete the scheduled tasks and review your progress at the end of the week.",

//       deadline,

//       createdAt:
//         new Date().toISOString(),

//       days: safeDays,
//     };
//   };


//   /*
//    * Generate a new plan
//    */
//   const generatePlan = async () => {

//     if (!goal.trim() || !hours || !deadline) {
//       setError("Please fill in all the fields.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {

//       const response = await fetch(
//         "http://localhost:5000/api/generate-plan",
//         {
//           method: "POST",

//           headers: {
//             "Content-Type": "application/json",
//           },

//           body: JSON.stringify({
//             goal,
//             hours,
//             deadline,
//           }),
//         }
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(
//           data?.error ||
//           "Something went wrong while generating the plan."
//         );
//       }

//       if (!data?.plan) {
//         throw new Error(
//           "The AI did not return a study plan."
//         );
//       }

//       const newPlan = normalizePlan(data.plan);

//       /*
//        * IMPORTANT:
//        * Save the new plan permanently.
//        */
//       addStudyPlan(newPlan);
//       localStorage.setItem(
//       "active_ai_study_plan",
//       JSON.stringify(newPlan)
// );

// window.dispatchEvent(new Event("studyPlanUpdated"));
//       /*
//        * Update UI immediately.
//        */
//       setPlan(newPlan);

//       setSavedPlans(getStudyPlans());
      

//       // Tell Dashboard, Schedule and Progress
// window.dispatchEvent(
//   new Event("studyPlanUpdated")
// );
//     } catch (error) {

//       console.error(
//         "Study plan error:",
//         error
//       );

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Failed to generate study plan."
//       );

//     } finally {

//       setLoading(false);

//     }
//   };


//   /*
//    * Open an already saved plan
//    */
//   // const openPlan = (selectedPlan: StudyPlan) => {

//   //   setPlan(selectedPlan);

//   //   setGoal(selectedPlan.goal);

//   //   setHours(
//   //     String(selectedPlan.dailyHours)
//   //   );

//   //   setDeadline(selectedPlan.deadline);

//   //   setError("");
//   // };
//   const openPlan = (selectedPlan: StudyPlan) => {
//   setPlan(selectedPlan);

//   setGoal(selectedPlan.goal);

//   setHours(
//     String(selectedPlan.dailyHours)
//   );

//   setDeadline(
//     selectedPlan.deadline
//   );

//   // Make selected plan active
//   localStorage.setItem(
//     "active_ai_study_plan",
//     JSON.stringify(selectedPlan)
//   );

//   setError("");

//   // Notify other pages
//   window.dispatchEvent(
//     new Event("studyPlanUpdated")
//   );
// };


//   /*
//    * Delete a plan.
//    * This is OPTIONAL now.
//    * The user is NOT forced to delete anything.
//    */
//   const removePlan = (planId: string) => {

//     const confirmed = window.confirm(
//       "Are you sure you want to delete this study plan?"
//     );

//     if (!confirmed) {
//       return;
//     }

//     deleteStudyPlan(planId);

//     const updatedPlans = getStudyPlans();

//     setSavedPlans(updatedPlans);

//     if (plan?.id === planId) {
//       setPlan(null);
//     }
//   };


//   /*
//    * Toggle task completion.
//    */
//   const toggleTask = (
//     planId: string,
//     dayIndex: number,
//     taskIndex: number
//   ) => {

//     const plans = getStudyPlans();

//     const selectedPlan = plans.find(
//       (item) => item.id === planId
//     );

//     if (!selectedPlan) {
//       return;
//     }

//     const updatedPlan: StudyPlan = {
//       ...selectedPlan,

//       days: selectedPlan.days.map(
//         (day, currentDayIndex) => {

//           if (currentDayIndex !== dayIndex) {
//             return day;
//           }

//           return {
//             ...day,

//             tasks: day.tasks.map(
//               (task, currentTaskIndex) => {

//                 if (
//                   currentTaskIndex !== taskIndex
//                 ) {
//                   return task;
//                 }

//                 return {
//                   ...task,
//                   completed: !task.completed,
//                 };
//               }
//             ),
//           };
//         }
//       ),
//     };

//     updateStudyPlan(updatedPlan);

//     setPlan(updatedPlan);

//     setSavedPlans(getStudyPlans());
//   };


//   const activePlans = savedPlans.filter(
//     (savedPlan) =>
//       getPlanProgress(savedPlan) < 100
//   );


//   const completedPlans = savedPlans.filter(
//     (savedPlan) =>
//       getPlanProgress(savedPlan) === 100
//   );


//   return (
//     <div className="ml-64 min-h-screen bg-slate-50 px-8 py-10">

//       <div className="mx-auto max-w-6xl">

//         {/* Header */}

//         <div className="mb-8">

//           <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
//             AI Study Planner
//           </p>

//           <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
//             Plan your learning with purpose.
//           </h1>

//           <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
//             Tell us what you want to achieve, how much time you have,
//             and when you want to finish. We'll turn it into an
//             actionable study plan.
//           </p>

//         </div>


//         {/* CREATE PLAN */}

//         <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

//           <div className="mb-7">

//             <h2 className="text-xl font-bold text-slate-900">
//               Create your study plan
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Give us a few details about your goal.
//             </p>

//           </div>


//           <div className="grid gap-6 md:grid-cols-3">

//             {/* Goal */}

//             <div className="md:col-span-3">

//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 What do you want to study?
//               </label>

//               <input
//                 type="text"
//                 value={goal}
//                 onChange={(e) =>
//                   setGoal(e.target.value)
//                 }
//                 placeholder="Example: Complete DSA for placements"
//                 className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//               />

//             </div>


//             {/* Hours */}

//             <div>

//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 Hours per day
//               </label>

//               <input
//                 type="number"
//                 min="1"
//                 max="12"
//                 value={hours}
//                 onChange={(e) =>
//                   setHours(e.target.value)
//                 }
//                 placeholder="3"
//                 className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//               />

//             </div>


//             {/* Deadline */}

//             <div>

//               <label className="mb-2 block text-sm font-semibold text-slate-700">
//                 Deadline
//               </label>

//               <input
//                 type="date"
//                 value={deadline}
//                 onChange={(e) =>
//                   setDeadline(e.target.value)
//                 }
//                 className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//               />

//             </div>

//           </div>


//           {/* Error */}

//           {error && (
//             <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
//               {error}
//             </div>
//           )}


//           {/* Button */}

//           <button
//             onClick={generatePlan}
//             disabled={loading}
//             className="mt-7 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//           >
//             {loading
//               ? "Creating your plan..."
//               : "Generate Study Plan"}
//           </button>

//         </div>


//         {/* ACTIVE PLANS */}

//         {activePlans.length > 0 && (

//           <div className="mt-8">

//             <div className="mb-5">

//               <h2 className="text-2xl font-bold text-slate-900">
//                 Your plans in progress
//               </h2>

//               <p className="mt-1 text-sm text-slate-500">
//                 Continue working on your existing goals.
//                 You can create new plans without deleting these.
//               </p>

//             </div>


//             <div className="grid gap-4 md:grid-cols-2">

//               {activePlans.map((savedPlan) => {

//                 const progress =
//                   getPlanProgress(savedPlan);

//                 const counts =
//                   getPlanTaskCounts(savedPlan);

//                 return (

//                   <div
//                     key={savedPlan.id}
//                     className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
//                   >

//                     <div className="flex items-start justify-between gap-4">

//                       <div>

//                         <p className="text-lg font-bold text-slate-900">
//                           {savedPlan.goal}
//                         </p>

//                         <p className="mt-1 text-sm text-slate-500">
//                           Deadline: {savedPlan.deadline}
//                         </p>

//                       </div>

//                       <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
//                         In Progress
//                       </span>

//                     </div>


//                     <div className="mt-5">

//                       <div className="mb-2 flex justify-between text-sm">

//                         <span className="font-medium text-slate-600">
//                           Progress
//                         </span>

//                         <span className="font-semibold text-blue-600">
//                           {progress}%
//                         </span>

//                       </div>

//                       <div className="h-2 overflow-hidden rounded-full bg-slate-100">

//                         <div
//                           className="h-full rounded-full bg-blue-600 transition-all"
//                           style={{
//                             width: `${progress}%`,
//                           }}
//                         />

//                       </div>

//                     </div>


//                     <div className="mt-4 text-sm text-slate-500">
//                       {counts.completed} of {counts.total} tasks completed
//                     </div>


//                     <div className="mt-5 flex gap-3">

//                       <button
//                         onClick={() =>
//                           openPlan(savedPlan)
//                         }
//                         className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
//                       >
//                         Continue Plan
//                       </button>

//                       <button
//                         onClick={() =>
//                           removePlan(savedPlan.id)
//                         }
//                         className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
//                       >
//                         Delete
//                       </button>

//                     </div>

//                   </div>

//                 );
//               })}

//             </div>

//           </div>

//         )}


//         {/* CURRENT PLAN */}

//         {plan && (

//           <div className="mt-8">

//             {/* Overview */}

//             <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

//               <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">

//                 <div className="min-w-0">

//                   <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
//                     Your personalized plan
//                   </p>

//                   <h2 className="mt-2 text-2xl font-bold text-slate-900">
//                     {plan.goal}
//                   </h2>

//                   <p className="mt-3 max-w-3xl leading-7 text-slate-500">
//                     {plan.overview}
//                   </p>

//                 </div>


//                 <div className="grid shrink-0 grid-cols-2 gap-3 md:min-w-65">

//                   <div className="rounded-xl bg-slate-50 p-4">

//                     <p className="text-xs font-medium text-slate-500">
//                       Daily time
//                     </p>

//                     <p className="mt-1 text-xl font-bold text-slate-900">
//                       {plan.dailyHours} hrs
//                     </p>

//                   </div>


//                   <div className="rounded-xl bg-slate-50 p-4">

//                     <p className="text-xs font-medium text-slate-500">
//                       Plan length
//                     </p>

//                     <p className="mt-1 text-xl font-bold text-slate-900">
//                       {plan.totalDays} days
//                     </p>

//                   </div>

//                 </div>

//               </div>


//               {/* Overall Progress */}

//               <div className="mt-7">

//                 <div className="mb-2 flex justify-between text-sm">

//                   <span className="font-semibold text-slate-700">
//                     Overall progress
//                   </span>

//                   <span className="text-slate-500">
//                     {getPlanProgress(plan)}%
//                   </span>

//                 </div>


//                 <div className="h-2 overflow-hidden rounded-full bg-slate-100">

//                   <div
//                     className="h-full rounded-full bg-blue-600 transition-all"
//                     style={{
//                       width: `${getPlanProgress(plan)}%`,
//                     }}
//                   />

//                 </div>

//               </div>


//               {/* Weekly Goal */}

//               <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50 p-5">

//                 <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
//                   This week's target
//                 </p>

//                 <p className="mt-2 font-medium leading-6 text-slate-800">
//                   {plan.weeklyGoal}
//                 </p>

//               </div>

//             </div>


//             {/* Schedule */}

//             <div className="mt-8">

//               <div className="mb-5">

//                 <h2 className="text-2xl font-bold text-slate-900">
//                   Your schedule
//                 </h2>

//                 <p className="mt-1 text-sm text-slate-500">
//                   Follow each day step by step and mark tasks as completed.
//                 </p>

//               </div>


//               <div className="space-y-5">

//                 {(plan.days || []).length === 0 ? (

//                   <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

//                     <h3 className="text-lg font-semibold text-slate-900">
//                       No daily schedule found
//                     </h3>

//                     <p className="mt-2 text-sm text-slate-500">
//                       The AI returned a plan without daily tasks.
//                     </p>

//                   </div>

//                 ) : (

//                   (plan.days || []).map(
//                     (day, index) => (

//                       <DayCard
//                         key={`${plan.id}-${day.day}-${index}`}
//                         day={day}
//                         index={index}
//                         planId={plan.id}
//                         onToggleTask={toggleTask}
//                       />

//                     )
//                   )

//                 )}

//               </div>

//             </div>

//           </div>

//         )}


//         {/* COMPLETED PLANS */}

//         {completedPlans.length > 0 && (

//           <div className="mt-10">

//             <h2 className="text-2xl font-bold text-slate-900">
//               Completed plans
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               Goals you have already completed.
//             </p>


//             <div className="mt-5 space-y-3">

//               {completedPlans.map((completedPlan) => (

//                 <div
//                   key={completedPlan.id}
//                   className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-5"
//                 >

//                   <div>

//                     <p className="font-semibold text-slate-900">
//                       {completedPlan.goal}
//                     </p>

//                     <p className="text-sm text-green-700">
//                       Completed ✓
//                     </p>

//                   </div>


//                   <button
//                     onClick={() =>
//                       openPlan(completedPlan)
//                     }
//                     className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
//                   >
//                     View
//                   </button>

//                 </div>

//               ))}

//             </div>

//           </div>

//         )}

//       </div>

//     </div>
//   );
// }


// function DayCard({
//   day,
//   index,
//   planId,
//   onToggleTask,
// }: {
//   day: StudyDay;
//   index: number;
//   planId: string;
//   onToggleTask: (
//     planId: string,
//     dayIndex: number,
//     taskIndex: number
//   ) => void;
// }) {

//   const safeTasks =
//     Array.isArray(day?.tasks)
//       ? day.tasks
//       : [];


//   const completedCount =
//     safeTasks.filter(
//       (task) => task.completed
//     ).length;


//   const progress =
//     safeTasks.length > 0
//       ? Math.round(
//           (completedCount /
//             safeTasks.length) *
//             100
//         )
//       : 0;


//   return (

//     <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

//       {/* Day Header */}

//       <div className="border-b border-slate-100 p-6">

//         <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

//           <div className="flex items-center gap-4">

//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
//               {index + 1}
//             </div>

//             <div>

//               <h3 className="text-lg font-bold text-slate-900">
//                 {day.day}
//               </h3>

//               {day.date && (
//                 <p className="text-sm text-slate-500">
//                   {day.date}
//                 </p>
//               )}

//             </div>

//           </div>


//           <div className="text-left md:text-right">

//             <p className="text-sm font-semibold text-slate-800">
//               {day.focus}
//             </p>

//             <p className="mt-1 text-xs text-slate-500">
//               {completedCount}/{safeTasks.length} tasks completed
//             </p>

//           </div>

//         </div>


//         {/* Daily Progress */}

//         <div className="mt-5">

//           <div className="mb-1 flex justify-end">

//             <span className="text-xs font-medium text-slate-400">
//               {progress}%
//             </span>

//           </div>


//           <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

//             <div
//               className="h-full rounded-full bg-blue-600 transition-all"
//               style={{
//                 width: `${progress}%`,
//               }}
//             />

//           </div>

//         </div>

//       </div>


//       {/* Tasks */}

//       <div className="divide-y divide-slate-100">

//         {safeTasks.length === 0 ? (

//           <div className="p-6 text-sm text-slate-500">
//             No tasks were provided for this day.
//           </div>

//         ) : (

//           safeTasks.map(
//             (task, taskIndex) => (

//               <div
//                 key={task.id || taskIndex}
//                 className={`p-5 transition ${
//                   task.completed
//                     ? "bg-slate-50"
//                     : "bg-white hover:bg-slate-50"
//                 }`}
//               >

//                 <div className="flex gap-4">

//                   {/* Checkbox */}

//                   <button
//                     type="button"
//                     onClick={() =>
//                       onToggleTask(
//                         planId,
//                         index,
//                         taskIndex
//                       )
//                     }
//                     className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
//                       task.completed
//                         ? "border-blue-600 bg-blue-600"
//                         : "border-slate-300 bg-white hover:border-blue-400"
//                     }`}
//                   >

//                     {task.completed && (
//                       <span className="text-xs font-bold text-white">
//                         ✓
//                       </span>
//                     )}

//                   </button>


//                   {/* Task */}

//                   <div className="min-w-0 flex-1">

//                     <div className="flex flex-col justify-between gap-3 md:flex-row">

//                       <div>

//                         <h4
//                           className={`font-semibold ${
//                             task.completed
//                               ? "text-slate-400 line-through"
//                               : "text-slate-900"
//                           }`}
//                         >
//                           {task.title}
//                         </h4>


//                         <p className="mt-1 text-sm leading-6 text-slate-500">
//                           {task.details}
//                         </p>

//                       </div>


//                       <div className="flex shrink-0 gap-2">

//                         <span className="h-fit rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
//                           {task.type}
//                         </span>

//                         <span className="h-fit rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
//                           {task.duration}
//                         </span>

//                       </div>

//                     </div>

//                   </div>

//                 </div>

//               </div>

//             )
//           )

//         )}

//       </div>

//     </div>
//   );
// }


// export default AIPlanner;
import { useEffect, useState } from "react";

import {
  addStudyPlan,
  deleteStudyPlan,
  getPlanProgress,
  getPlanTaskCounts,
  getStudyPlans,
  updateStudyPlan,
  type StudyDay,
  type StudyPlan,
  type Task,
} from "../utils/studyPlanStorage";

function AIPlanner() {
  const [goal, setGoal] = useState("");
  const [hours, setHours] = useState("");
  const [deadline, setDeadline] = useState("");

  const [plan, setPlan] =
    useState<StudyPlan | null>(null);

  const [savedPlans, setSavedPlans] =
    useState<StudyPlan[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // --------------------------------------------------
  // LOAD PLANS FROM FIRESTORE
  // --------------------------------------------------

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const plans =
          await getStudyPlans();

        setSavedPlans(plans);

        if (plans.length > 0) {
          setPlan(plans[0]);

          setGoal(plans[0].goal);
          setHours(
            String(plans[0].dailyHours)
          );
          setDeadline(
            plans[0].deadline
          );
        }
      } catch (error) {
        console.error(
          "Could not load study plans:",
          error
        );

        setError(
          "Could not load your study plans."
        );
      }
    };

    loadPlans();
  }, []);

  // --------------------------------------------------
  // NORMALIZE AI RESPONSE
  // --------------------------------------------------

  const normalizePlan = (
    receivedPlan: any
  ): StudyPlan => {
    let parsedPlan = receivedPlan;

    if (
      typeof parsedPlan ===
      "string"
    ) {
      try {
        parsedPlan =
          JSON.parse(parsedPlan);
      } catch {
        parsedPlan = {};
      }
    }

    if (
      !parsedPlan ||
      typeof parsedPlan !==
        "object"
    ) {
      parsedPlan = {};
    }

    const receivedDays =
      Array.isArray(
        parsedPlan.days
      )
        ? parsedPlan.days
        : [];

    const safeDays: StudyDay[] =
      receivedDays.map(
        (
          day: any,
          dayIndex: number
        ) => {
          const receivedTasks =
            Array.isArray(
              day?.tasks
            )
              ? day.tasks
              : [];

          const safeTasks: Task[] =
            receivedTasks.map(
              (
                task: any,
                taskIndex: number
              ) => ({
                id:
                  task?.id ||
                  `${Date.now()}-${dayIndex}-${taskIndex}`,

                title:
                  task?.title ||
                  "Study task",

                duration:
                  task?.duration ||
                  "1 hour",

                type:
                  task?.type ||
                  "Study",

                details:
                  task?.details ||
                  task?.description ||
                  "Complete this task and review what you learned.",

                completed:
                  Boolean(
                    task?.completed
                  ),
              })
            );

          return {
            day:
              day?.day ||
              `Day ${dayIndex + 1}`,

            date:
              day?.date ||
              "",

            focus:
              day?.focus ||
              "Study",

            tasks:
              safeTasks,
          };
        }
      );

    return {
      id:
        crypto.randomUUID(),

      goal,

      overview:
        parsedPlan.overview ||
        `A personalized study plan for ${goal}. Follow the daily tasks consistently and review your progress each week.`,

      totalDays:
        Number(
          parsedPlan.totalDays
        ) ||
        safeDays.length ||
        1,

      dailyHours:
        Number(
          parsedPlan.dailyHours
        ) ||
        Number(hours) ||
        1,

      weeklyGoal:
        parsedPlan.weeklyGoal ||
        "Complete the scheduled tasks and review your progress at the end of the week.",

      deadline,

      createdAt:
        new Date().toISOString(),

      days:
        safeDays,
    };
  };

  // --------------------------------------------------
  // GENERATE PLAN
  // --------------------------------------------------

  const generatePlan =
    async () => {
      if (
        !goal.trim() ||
        !hours ||
        !deadline
      ) {
        setError(
          "Please fill in all the fields."
        );

        return;
      }

      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            "http://localhost:5000/api/generate-plan",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                goal,
                hours,
                deadline,
              }),
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Something went wrong while generating the plan."
          );
        }

        if (!data?.plan) {
          throw new Error(
            "The AI did not return a study plan."
          );
        }

        // Convert AI response
        // into our structure
        const newPlan =
          normalizePlan(
            data.plan
          );

        // --------------------------------------------------
        // SAVE TO FIRESTORE
        // --------------------------------------------------

        const savedPlanId =
          await addStudyPlan(
            newPlan
          );

        // Firestore generates
        // the actual document ID
        const savedPlan:
          StudyPlan = {
          ...newPlan,
          id: savedPlanId,
        };

        // --------------------------------------------------
        // UPDATE UI
        // --------------------------------------------------

        setPlan(savedPlan);

        // Reload from Firestore
        const updatedPlans =
          await getStudyPlans();

        setSavedPlans(
          updatedPlans
        );

        // Clear form
        setGoal("");
        setHours("");
        setDeadline("");

      } catch (error) {
        console.error(
          "Study plan error:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to generate study plan."
        );
      } finally {
        setLoading(false);
      }
    };

  // --------------------------------------------------
  // OPEN PLAN
  // --------------------------------------------------

  const openPlan = (
    selectedPlan: StudyPlan
  ) => {
    setPlan(
      selectedPlan
    );

    setGoal(
      selectedPlan.goal
    );

    setHours(
      String(
        selectedPlan.dailyHours
      )
    );

    setDeadline(
      selectedPlan.deadline
    );

    setError("");
  };

  // --------------------------------------------------
  // DELETE PLAN
  // --------------------------------------------------

  const removePlan =
    async (
      planId: string
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to delete this study plan?"
        );

      if (!confirmed) {
        return;
      }

      try {
        await deleteStudyPlan(
          planId
        );

        const updatedPlans =
          await getStudyPlans();

        setSavedPlans(
          updatedPlans
        );

        if (
          plan?.id === planId
        ) {
          if (
            updatedPlans.length >
            0
          ) {
            setPlan(
              updatedPlans[0]
            );
          } else {
            setPlan(null);
          }
        }
      } catch (error) {
        console.error(
          "Could not delete plan:",
          error
        );

        setError(
          "Could not delete the study plan."
        );
      }
    };

  // --------------------------------------------------
  // TOGGLE TASK
  // --------------------------------------------------

  const toggleTask =
    async (
      planId: string,
      dayIndex: number,
      taskIndex: number
    ) => {
      try {
        const plans =
          await getStudyPlans();

        const selectedPlan =
          plans.find(
            (item) =>
              item.id ===
              planId
          );

        if (!selectedPlan) {
          return;
        }

        const updatedPlan:
          StudyPlan = {
          ...selectedPlan,

          days:
            selectedPlan.days.map(
              (
                day,
                currentDayIndex
              ) => {
                if (
                  currentDayIndex !==
                  dayIndex
                ) {
                  return day;
                }

                return {
                  ...day,

                  tasks:
                    day.tasks.map(
                      (
                        task,
                        currentTaskIndex
                      ) => {
                        if (
                          currentTaskIndex !==
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

        // Save to Firestore
        await updateStudyPlan(
          updatedPlan
        );

        // Update current screen
        setPlan(
          updatedPlan
        );

        // Reload plans
        const updatedPlans =
          await getStudyPlans();

        setSavedPlans(
          updatedPlans
        );

      } catch (error) {
        console.error(
          "Could not update task:",
          error
        );

        setError(
          "Could not update task."
        );
      }
    };

  // --------------------------------------------------
  // ACTIVE / COMPLETED PLANS
  // --------------------------------------------------

  const activePlans =
    savedPlans.filter(
      (savedPlan) =>
        getPlanProgress(
          savedPlan
        ) < 100
    );

  const completedPlans =
    savedPlans.filter(
      (savedPlan) =>
        getPlanProgress(
          savedPlan
        ) === 100
    );

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="ml-64 min-h-screen bg-slate-50 px-8 py-10">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            AI Study Planner
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Plan your learning with purpose.
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
            Tell us what you want to achieve,
            how much time you have, and when
            you want to finish. We'll turn it
            into an actionable study plan.
          </p>

        </div>

        {/* CREATE PLAN */}

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

          <div className="mb-7">

            <h2 className="text-xl font-bold text-slate-900">
              Create your study plan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Give us a few details about your goal.
            </p>

          </div>

          <div className="grid gap-6 md:grid-cols-3">

            {/* GOAL */}

            <div className="md:col-span-3">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                What do you want to study?
              </label>

              <input
                type="text"
                value={goal}
                onChange={(e) =>
                  setGoal(
                    e.target.value
                  )
                }
                placeholder="Example: Complete DSA for placements"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />

            </div>

            {/* HOURS */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Hours per day
              </label>

              <input
                type="number"
                min="1"
                max="12"
                value={hours}
                onChange={(e) =>
                  setHours(
                    e.target.value
                  )
                }
                placeholder="3"
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />

            </div>

            {/* DEADLINE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Deadline
              </label>

              <input
                type="date"
                value={deadline}
                onChange={(e) =>
                  setDeadline(
                    e.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              />

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* BUTTON */}

          <button
            onClick={
              generatePlan
            }
            disabled={loading}
            className="mt-7 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Creating your plan..."
              : "Generate Study Plan"}
          </button>

        </div>

        {/* ACTIVE PLANS */}

        {activePlans.length >
          0 && (
            <div className="mt-8">

              <div className="mb-5">

                <h2 className="text-2xl font-bold text-slate-900">
                  Your plans in progress
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Continue working on your existing goals.
                  You can create new plans without deleting these.
                </p>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {activePlans.map(
                  (
                    savedPlan
                  ) => {

                    const progress =
                      getPlanProgress(
                        savedPlan
                      );

                    const counts =
                      getPlanTaskCounts(
                        savedPlan
                      );

                    return (
                      <div
                        key={
                          savedPlan.id
                        }
                        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>

                            <p className="text-lg font-bold text-slate-900">
                              {
                                savedPlan.goal
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              Deadline:{" "}
                              {
                                savedPlan.deadline
                              }
                            </p>

                          </div>

                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            In Progress
                          </span>

                        </div>

                        <div className="mt-5">

                          <div className="mb-2 flex justify-between text-sm">

                            <span className="font-medium text-slate-600">
                              Progress
                            </span>

                            <span className="font-semibold text-blue-600">
                              {
                                progress
                              }%
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-blue-600 transition-all"
                              style={{
                                width:
                                  `${progress}%`,
                              }}
                            />

                          </div>

                        </div>

                        <div className="mt-4 text-sm text-slate-500">
                          {
                            counts.completed
                          }{" "}
                          of{" "}
                          {
                            counts.total
                          }{" "}
                          tasks completed
                        </div>

                        <div className="mt-5 flex gap-3">

                          <button
                            onClick={() =>
                              openPlan(
                                savedPlan
                              )
                            }
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                          >
                            Continue Plan
                          </button>

                          <button
                            onClick={() =>
                              removePlan(
                                savedPlan.id
                              )
                            }
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                          >
                            Delete
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>
          )}

        {/* CURRENT PLAN */}

        {plan && (
          <div className="mt-8">

            {/* OVERVIEW */}

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">

              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">

                <div className="min-w-0">

                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Your personalized plan
                  </p>

                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    {plan.goal}
                  </h2>

                  <p className="mt-3 max-w-3xl leading-7 text-slate-500">
                    {plan.overview}
                  </p>

                </div>

                <div className="grid shrink-0 grid-cols-2 gap-3 md:min-w-65">

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs font-medium text-slate-500">
                      Daily time
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {plan.dailyHours} hrs
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs font-medium text-slate-500">
                      Plan length
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {plan.totalDays} days
                    </p>

                  </div>

                </div>

              </div>

              {/* OVERALL PROGRESS */}

              <div className="mt-7">

                <div className="mb-2 flex justify-between text-sm">

                  <span className="font-semibold text-slate-700">
                    Overall progress
                  </span>

                  <span className="text-slate-500">
                    {
                      getPlanProgress(
                        plan
                      )
                    }%
                  </span>

                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width:
                        `${getPlanProgress(plan)}%`,
                    }}
                  />

                </div>

              </div>

              {/* WEEKLY GOAL */}

              <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50 p-5">

                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  This week's target
                </p>

                <p className="mt-2 font-medium leading-6 text-slate-800">
                  {plan.weeklyGoal}
                </p>

              </div>

            </div>

            {/* SCHEDULE */}

            <div className="mt-8">

              <div className="mb-5">

                <h2 className="text-2xl font-bold text-slate-900">
                  Your schedule
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Follow each day step by step and mark tasks as completed.
                </p>

              </div>

              <div className="space-y-5">

                {plan.days.length ===
                0 ? (

                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                    <h3 className="text-lg font-semibold text-slate-900">
                      No daily schedule found
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      The AI returned a plan without daily tasks.
                    </p>

                  </div>

                ) : (

                  plan.days.map(
                    (
                      day,
                      index
                    ) => (
                      <DayCard
                        key={`${plan.id}-${day.day}-${index}`}
                        day={day}
                        index={index}
                        planId={
                          plan.id
                        }
                        onToggleTask={
                          toggleTask
                        }
                      />
                    )
                  )

                )}

              </div>

            </div>

          </div>
        )}

        {/* COMPLETED PLANS */}

        {completedPlans.length >
          0 && (
            <div className="mt-10">

              <h2 className="text-2xl font-bold text-slate-900">
                Completed plans
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Goals you have already completed.
              </p>

              <div className="mt-5 space-y-3">

                {completedPlans.map(
                  (
                    completedPlan
                  ) => (

                    <div
                      key={
                        completedPlan.id
                      }
                      className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-5"
                    >

                      <div>

                        <p className="font-semibold text-slate-900">
                          {
                            completedPlan.goal
                          }
                        </p>

                        <p className="text-sm text-green-700">
                          Completed ✓
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          openPlan(
                            completedPlan
                          )
                        }
                        className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
                      >
                        View
                      </button>

                    </div>

                  )
                )}

              </div>

            </div>
          )}

      </div>

    </div>
  );
}

// --------------------------------------------------
// DAY CARD
// --------------------------------------------------

function DayCard({
  day,
  index,
  planId,
  onToggleTask,
}: {
  day: StudyDay;

  index: number;

  planId: string;

  onToggleTask: (
    planId: string,
    dayIndex: number,
    taskIndex: number
  ) => void;
}) {
  const safeTasks =
    Array.isArray(
      day?.tasks
    )
      ? day.tasks
      : [];

  const completedCount =
    safeTasks.filter(
      (task) =>
        task.completed
    ).length;

  const progress =
    safeTasks.length > 0
      ? Math.round(
          (completedCount /
            safeTasks.length) *
            100
        )
      : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* DAY HEADER */}

      <div className="border-b border-slate-100 p-6">

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div className="flex items-center gap-4">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-600">
              {index + 1}
            </div>

            <div>

              <h3 className="text-lg font-bold text-slate-900">
                {day.day}
              </h3>

              {day.date && (
                <p className="text-sm text-slate-500">
                  {day.date}
                </p>
              )}

            </div>

          </div>

          <div className="text-left md:text-right">

            <p className="text-sm font-semibold text-slate-800">
              {day.focus}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {completedCount}/
              {safeTasks.length}{" "}
              tasks completed
            </p>

          </div>

        </div>

        {/* DAILY PROGRESS */}

        <div className="mt-5">

          <div className="mb-1 flex justify-end">

            <span className="text-xs font-medium text-slate-400">
              {progress}%
            </span>

          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{
                width:
                  `${progress}%`,
              }}
            />

          </div>

        </div>

      </div>

      {/* TASKS */}

      <div className="divide-y divide-slate-100">

        {safeTasks.length ===
        0 ? (

          <div className="p-6 text-sm text-slate-500">
            No tasks were provided for this day.
          </div>

        ) : (

          safeTasks.map(
            (
              task,
              taskIndex
            ) => (

              <div
                key={
                  task.id ||
                  taskIndex
                }
                className={`p-5 transition ${
                  task.completed
                    ? "bg-slate-50"
                    : "bg-white hover:bg-slate-50"
                }`}
              >

                <div className="flex gap-4">

                  {/* CHECKBOX */}

                  <button
                    type="button"
                    onClick={() =>
                      onToggleTask(
                        planId,
                        index,
                        taskIndex
                      )
                    }
                    className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition ${
                      task.completed
                        ? "border-blue-600 bg-blue-600"
                        : "border-slate-300 bg-white hover:border-blue-400"
                    }`}
                  >

                    {task.completed && (
                      <span className="text-xs font-bold text-white">
                        ✓
                      </span>
                    )}

                  </button>

                  {/* TASK */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-col justify-between gap-3 md:flex-row">

                      <div>

                        <h4
                          className={`font-semibold ${
                            task.completed
                              ? "text-slate-400 line-through"
                              : "text-slate-900"
                          }`}
                        >
                          {task.title}
                        </h4>

                        <p className="mt-1 text-sm leading-6 text-slate-500">
                          {task.details}
                        </p>

                      </div>

                      <div className="flex shrink-0 gap-2">

                        <span className="h-fit rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {task.type}
                        </span>

                        <span className="h-fit rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                          {task.duration}
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            )
          )

        )}

      </div>

    </div>
  );
}

export default AIPlanner;