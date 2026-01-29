import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Workout } from "./types";

const WORKOUTS_COLLECTION = "workouts";

/**
 * Get all workouts for a user
 */
export async function getUserWorkouts(userId: string): Promise<Workout[]> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const userWorkoutsRef = collection(db, WORKOUTS_COLLECTION, userId, "userWorkouts");
    const snapshot = await getDocs(userWorkoutsRef);

    return snapshot.docs
      .map((doc) => {
        const data = doc.data() as Workout;
        return {
          ...data,
          id: doc.id,
        };
      })
      .filter((workout) => workout.userId === userId); // Extra validation
  } catch (error) {
    console.error("Error fetching user workouts:", error);
    throw error;
  }
}

/**
 * Get a single workout
 */
export async function getWorkoutById(userId: string, workoutId: string): Promise<Workout | null> {
  if (!userId || !workoutId) {
    throw new Error("User ID and Workout ID are required");
  }

  try {
    const docRef = doc(db, WORKOUTS_COLLECTION, userId, "userWorkouts", workoutId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;

    const workout = {
      ...snapshot.data(),
      id: snapshot.id,
    } as Workout;

    // Extra validation: ensure the workout belongs to the requesting user
    if (workout.userId !== userId) {
      throw new Error("Unauthorized: Workout does not belong to this user");
    }

    return workout;
  } catch (error) {
    console.error("Error fetching workout:", error);
    throw error;
  }
}

/**
 * Create or update a workout
 */
export async function saveWorkout(userId: string, workout: Workout): Promise<Workout> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (workout.userId !== userId) {
    throw new Error("Unauthorized: Cannot save workout for a different user");
  }

  try {
    const docRef = doc(db, WORKOUTS_COLLECTION, userId, "userWorkouts", workout.id);

    // Convert dates to ISO strings for Firestore
    const workoutData = {
      ...workout,
      createdAt: workout.createdAt instanceof Date ? workout.createdAt.toISOString() : workout.createdAt,
      updatedAt: workout.updatedAt instanceof Date ? workout.updatedAt.toISOString() : workout.updatedAt,
    };

    await setDoc(docRef, workoutData, { merge: true });
    return workout;
  } catch (error) {
    console.error("Error saving workout:", error);
    throw error;
  }
}

/**
 * Update a workout
 */
export async function updateWorkout(userId: string, workoutId: string, updates: Partial<Workout>): Promise<void> {
  try {
    const docRef = doc(db, WORKOUTS_COLLECTION, userId, "userWorkouts", workoutId);

    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating workout:", error);
    throw error;
  }
}

/**
 * Delete a workout
 */
export async function deleteWorkoutById(userId: string, workoutId: string): Promise<void> {
  if (!userId || !workoutId) {
    throw new Error("User ID and Workout ID are required");
  }

  try {
    // Verify ownership before deleting
    const workout = await getWorkoutById(userId, workoutId);
    if (!workout) {
      throw new Error("Workout not found");
    }

    if (workout.userId !== userId) {
      throw new Error("Unauthorized: Cannot delete another user's workout");
    }

    const docRef = doc(db, WORKOUTS_COLLECTION, userId, "userWorkouts", workoutId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting workout:", error);
    throw error;
  }
}

/**
 * Duplicate a workout
 */
export async function duplicateWorkout(
  userId: string,
  sourceWorkoutId: string,
  newName: string
): Promise<Workout> {
  if (!userId || !sourceWorkoutId || !newName) {
    throw new Error("User ID, source workout ID, and new name are required");
  }

  try {
    // Get the source workout and verify ownership
    const sourceWorkout = await getWorkoutById(userId, sourceWorkoutId);
    if (!sourceWorkout) {
      throw new Error("Source workout not found");
    }

    if (sourceWorkout.userId !== userId) {
      throw new Error("Unauthorized: Cannot duplicate another user's workout");
    }

    // Create new workout with same data but new ID and name
    const newWorkoutId = Date.now().toString();
    const newWorkout: Workout = {
      ...sourceWorkout,
      id: newWorkoutId,
      workoutName: newName,
      userId, // Explicitly set to current user
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await saveWorkout(userId, newWorkout);
    return newWorkout;
  } catch (error) {
    console.error("Error duplicating workout:", error);
    throw error;
  }
}
