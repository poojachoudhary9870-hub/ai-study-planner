// export interface Task {
//   id: string;
//   title: string;
//   duration: string;
//   type: string;
//   details: string;
//   completed: boolean;
// }

// export interface StudyDay {
//   day: string;
//   date: string;
//   focus: string;
//   tasks: Task[];
// }

// export interface StudyPlan {
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

// const STORAGE_KEY = "ai-study-plans";

// export function getStudyPlans(): StudyPlan[] {
//   try {
//     const saved = localStorage.getItem(STORAGE_KEY);

//     if (!saved) {
//       return [];
//     }

//     const parsed = JSON.parse(saved);

//     return Array.isArray(parsed) ? parsed : [];
//   } catch (error) {
//     console.error("Failed to load study plans:", error);
//     return [];
//   }
// }

// export function saveStudyPlans(plans: StudyPlan[]): void {
//   try {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
//   } catch (error) {
//     console.error("Failed to save study plans:", error);
//   }
// }

// export function addStudyPlan(plan: StudyPlan): void {
//   const existingPlans = getStudyPlans();

//   saveStudyPlans([
//     ...existingPlans,
//     plan,
//   ]);
// }

// export function updateStudyPlan(updatedPlan: StudyPlan): void {
//   const plans = getStudyPlans();

//   const updatedPlans = plans.map((plan) =>
//     plan.id === updatedPlan.id
//       ? updatedPlan
//       : plan
//   );

//   saveStudyPlans(updatedPlans);
// }

// export function deleteStudyPlan(planId: string): void {
//   const plans = getStudyPlans();

//   const remainingPlans = plans.filter(
//     (plan) => plan.id !== planId
//   );

//   saveStudyPlans(remainingPlans);
// }

// export function getPlanProgress(plan: StudyPlan): number {
//   const allTasks = plan.days.flatMap(
//     (day) => Array.isArray(day.tasks) ? day.tasks : []
//   );

//   if (allTasks.length === 0) {
//     return 0;
//   }

//   const completedTasks = allTasks.filter(
//     (task) => task.completed
//   ).length;

//   return Math.round(
//     (completedTasks / allTasks.length) * 100
//   );
// }

// export function getPlanTaskCounts(plan: StudyPlan) {
//   const allTasks = plan.days.flatMap(
//     (day) => Array.isArray(day.tasks) ? day.tasks : []
//   );

//   const completed = allTasks.filter(
//     (task) => task.completed
//   ).length;

//   return {
//     completed,
//     total: allTasks.length,
//   };
// }

// export function isPlanCompleted(plan: StudyPlan): boolean {
//   return getPlanProgress(plan) === 100;
// }
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase";

export interface Task {
  id: string;
  title: string;
  duration: string;
  type: string;
  details: string;
  completed: boolean;
}

export interface StudyDay {
  day: string;
  date: string;
  focus: string;
  tasks: Task[];
}

export interface StudyPlan {
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

// --------------------------------------------------
// GET CURRENT USER
// --------------------------------------------------

function getCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not logged in.");
  }

  return user;
}

// --------------------------------------------------
// GET USER'S PLANS
// --------------------------------------------------

export async function getStudyPlans(): Promise<StudyPlan[]> {
  const user = getCurrentUser();

  const plansRef = collection(
    db,
    "users",
    user.uid,
    "plans"
  );

  const plansQuery = query(
    plansRef,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(plansQuery);

  return snapshot.docs.map((planDoc) => {
    const data = planDoc.data();

    return {
      id: planDoc.id,
      goal: data.goal || "",
      overview: data.overview || "",
      totalDays: Number(data.totalDays) || 0,
      dailyHours: Number(data.dailyHours) || 0,
      weeklyGoal: data.weeklyGoal || "",
      deadline: data.deadline || "",
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() ||
        data.createdAt ||
        "",
      days: Array.isArray(data.days)
        ? data.days
        : [],
    };
  });
}

// --------------------------------------------------
// ADD PLAN
// --------------------------------------------------

export async function addStudyPlan(
  plan: StudyPlan
): Promise<string> {
  const user = getCurrentUser();

  const plansRef = collection(
    db,
    "users",
    user.uid,
    "plans"
  );

  const docRef = await addDoc(plansRef, {
    goal: plan.goal,
    overview: plan.overview,
    totalDays: plan.totalDays,
    dailyHours: plan.dailyHours,
    weeklyGoal: plan.weeklyGoal,
    deadline: plan.deadline,
    days: plan.days,

    // Firestore timestamp
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

// --------------------------------------------------
// UPDATE PLAN
// --------------------------------------------------

export async function updateStudyPlan(
  plan: StudyPlan
): Promise<void> {
  const user = getCurrentUser();

  const planRef = doc(
    db,
    "users",
    user.uid,
    "plans",
    plan.id
  );

  await updateDoc(planRef, {
    goal: plan.goal,
    overview: plan.overview,
    totalDays: plan.totalDays,
    dailyHours: plan.dailyHours,
    weeklyGoal: plan.weeklyGoal,
    deadline: plan.deadline,
    days: plan.days,
  });
}

// --------------------------------------------------
// DELETE PLAN
// --------------------------------------------------

export async function deleteStudyPlan(
  planId: string
): Promise<void> {
  const user = getCurrentUser();

  const planRef = doc(
    db,
    "users",
    user.uid,
    "plans",
    planId
  );

  await deleteDoc(planRef);
}

// --------------------------------------------------
// PLAN PROGRESS
// --------------------------------------------------

export function getPlanProgress(
  plan: StudyPlan
): number {
  const allTasks = plan.days.flatMap((day) =>
    Array.isArray(day.tasks)
      ? day.tasks
      : []
  );

  if (allTasks.length === 0) {
    return 0;
  }

  const completedTasks =
    allTasks.filter(
      (task) => task.completed
    ).length;

  return Math.round(
    (completedTasks / allTasks.length) * 100
  );
}

// --------------------------------------------------
// TASK COUNTS
// --------------------------------------------------

export function getPlanTaskCounts(
  plan: StudyPlan
) {
  const allTasks = plan.days.flatMap((day) =>
    Array.isArray(day.tasks)
      ? day.tasks
      : []
  );

  const completed =
    allTasks.filter(
      (task) => task.completed
    ).length;

  return {
    completed,
    total: allTasks.length,
  };
}

// --------------------------------------------------
// COMPLETED?
// --------------------------------------------------

export function isPlanCompleted(
  plan: StudyPlan
): boolean {
  return getPlanProgress(plan) === 100;
}