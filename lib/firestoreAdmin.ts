import admin from "./firebaseAdmin";
import { Workout, Template } from "./types";

const WORKOUTS_COLLECTION = "workouts";
const TEMPLATES_COLLECTION = "templates";

/**
 * Get all workouts for a user (using Admin SDK)
 */
export async function getUserWorkoutsAdmin(userId: string): Promise<Workout[]> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const db = admin.firestore();
    const snapshot = await db
      .collection(WORKOUTS_COLLECTION)
      .doc(userId)
      .collection("userWorkouts")
      .get();

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Workout[];
  } catch (error) {
    console.error("Error fetching user workouts:", error);
    throw error;
  }
}

/**
 * Get a single workout (using Admin SDK)
 */
export async function getWorkoutByIdAdmin(
  userId: string,
  workoutId: string
): Promise<Workout | null> {
  if (!userId || !workoutId) {
    throw new Error("User ID and Workout ID are required");
  }

  try {
    const db = admin.firestore();
    const doc = await db
      .collection(WORKOUTS_COLLECTION)
      .doc(userId)
      .collection("userWorkouts")
      .doc(workoutId)
      .get();

    if (!doc.exists) return null;

    const rawData = doc.data();
    console.log("DEBUG: Raw Firestore data:", JSON.stringify(rawData, null, 2));
    console.log("DEBUG: First exercise imageUrl from Firestore:", rawData?.sections[0]?.exercises[0]?.imageUrl);

    const workout = {
      ...rawData,
      id: doc.id,
    } as Workout;

    // Verify ownership
    if (workout.userId !== userId) {
      throw new Error("Unauthorized: Workout does not belong to this user");
    }

    console.log("DEBUG: Workout object after mapping:", JSON.stringify(workout, null, 2));
    return workout;
  } catch (error) {
    console.error("Error fetching workout:", error);
    throw error;
  }
}

/**
 * Create or update a workout (using Admin SDK)
 */
export async function saveWorkoutAdmin(
  userId: string,
  workout: Workout
): Promise<Workout> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (workout.userId !== userId) {
    throw new Error("Unauthorized: Cannot save workout for a different user");
  }

  try {
    const db = admin.firestore();

    // Convert dates to ISO strings for Firestore
    const workoutData = {
      ...workout,
      createdAt:
        workout.createdAt instanceof Date
          ? workout.createdAt.toISOString()
          : workout.createdAt,
      updatedAt:
        workout.updatedAt instanceof Date
          ? workout.updatedAt.toISOString()
          : workout.updatedAt,
    };

    console.log("DEBUG: Saving to Firestore:", JSON.stringify(workoutData, null, 2));
    console.log("DEBUG: First exercise imageUrl being saved:", workoutData.sections[0]?.exercises[0]?.imageUrl);

    await db
      .collection(WORKOUTS_COLLECTION)
      .doc(userId)
      .collection("userWorkouts")
      .doc(workout.id)
      .set(workoutData, { merge: true });

    return workout;
  } catch (error) {
    console.error("Error saving workout:", error);
    throw error;
  }
}

/**
 * Delete a workout (using Admin SDK)
 */
export async function deleteWorkoutByIdAdmin(
  userId: string,
  workoutId: string
): Promise<void> {
  if (!userId || !workoutId) {
    throw new Error("User ID and Workout ID are required");
  }

  try {
    // Verify ownership before deleting
    const workout = await getWorkoutByIdAdmin(userId, workoutId);
    if (!workout) {
      throw new Error("Workout not found");
    }

    if (workout.userId !== userId) {
      throw new Error("Unauthorized: Cannot delete another user's workout");
    }

    const db = admin.firestore();
    await db
      .collection(WORKOUTS_COLLECTION)
      .doc(userId)
      .collection("userWorkouts")
      .doc(workoutId)
      .delete();
  } catch (error) {
    console.error("Error deleting workout:", error);
    throw error;
  }
}

/**
 * Duplicate a workout (using Admin SDK)
 */
export async function duplicateWorkoutAdmin(
  userId: string,
  sourceWorkoutId: string,
  newName: string
): Promise<Workout> {
  if (!userId || !sourceWorkoutId || !newName) {
    throw new Error("User ID, source workout ID, and new name are required");
  }

  try {
    // Get the source workout and verify ownership
    const sourceWorkout = await getWorkoutByIdAdmin(userId, sourceWorkoutId);
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

    await saveWorkoutAdmin(userId, newWorkout);
    return newWorkout;
  } catch (error) {
    console.error("Error duplicating workout:", error);
    throw error;
  }
}

/**
 * Get all templates for a user (using Admin SDK)
 */
export async function getTemplatesAdmin(userId: string): Promise<Template[]> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const db = admin.firestore();
    const snapshot = await db
      .collection(TEMPLATES_COLLECTION)
      .doc(userId)
      .collection("userTemplates")
      .get();

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Template[];
  } catch (error) {
    console.error("Error fetching user templates:", error);
    throw error;
  }
}

/**
 * Get a single template (using Admin SDK)
 */
export async function getTemplateByIdAdmin(
  userId: string,
  templateId: string
): Promise<Template | null> {
  if (!userId || !templateId) {
    throw new Error("User ID and Template ID are required");
  }

  try {
    const db = admin.firestore();
    const doc = await db
      .collection(TEMPLATES_COLLECTION)
      .doc(userId)
      .collection("userTemplates")
      .doc(templateId)
      .get();

    if (!doc.exists) return null;

    const template = {
      ...doc.data(),
      id: doc.id,
    } as Template;

    // Verify ownership
    if (template.userId !== userId) {
      throw new Error("Unauthorized: Template does not belong to this user");
    }

    return template;
  } catch (error) {
    console.error("Error fetching template:", error);
    throw error;
  }
}

/**
 * Create or save a template (using Admin SDK)
 */
export async function saveTemplateAdmin(
  userId: string,
  template: Template
): Promise<Template> {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (template.userId !== userId) {
    throw new Error("Unauthorized: Cannot save template for a different user");
  }

  try {
    const db = admin.firestore();

    // Convert dates to ISO strings for Firestore
    const templateData = {
      ...template,
      createdAt:
        template.createdAt instanceof Date
          ? template.createdAt.toISOString()
          : template.createdAt,
      updatedAt:
        template.updatedAt instanceof Date
          ? template.updatedAt.toISOString()
          : template.updatedAt,
    };

    await db
      .collection(TEMPLATES_COLLECTION)
      .doc(userId)
      .collection("userTemplates")
      .doc(template.id)
      .set(templateData, { merge: true });

    return template;
  } catch (error) {
    console.error("Error saving template:", error);
    throw error;
  }
}

/**
 * Update a template (using Admin SDK)
 */
export async function updateTemplateAdmin(
  userId: string,
  templateId: string,
  template: Template
): Promise<Template | null> {
  if (!userId || !templateId) {
    throw new Error("User ID and Template ID are required");
  }

  try {
    // Verify ownership before updating
    const existing = await getTemplateByIdAdmin(userId, templateId);
    if (!existing) {
      return null;
    }

    if (existing.userId !== userId) {
      throw new Error("Unauthorized: Cannot update another user's template");
    }

    const db = admin.firestore();

    // Convert dates to ISO strings for Firestore
    const templateData = {
      ...template,
      createdAt:
        template.createdAt instanceof Date
          ? template.createdAt.toISOString()
          : template.createdAt,
      updatedAt:
        new Date().toISOString(),
    };

    await db
      .collection(TEMPLATES_COLLECTION)
      .doc(userId)
      .collection("userTemplates")
      .doc(templateId)
      .set(templateData, { merge: true });

    return { ...template, updatedAt: new Date() };
  } catch (error) {
    console.error("Error updating template:", error);
    throw error;
  }
}

/**
 * Delete a template (using Admin SDK)
 */
export async function deleteTemplateAdmin(
  userId: string,
  templateId: string
): Promise<boolean> {
  if (!userId || !templateId) {
    throw new Error("User ID and Template ID are required");
  }

  try {
    // Verify ownership before deleting
    const template = await getTemplateByIdAdmin(userId, templateId);
    if (!template) {
      return false;
    }

    if (template.userId !== userId) {
      throw new Error("Unauthorized: Cannot delete another user's template");
    }

    const db = admin.firestore();
    await db
      .collection(TEMPLATES_COLLECTION)
      .doc(userId)
      .collection("userTemplates")
      .doc(templateId)
      .delete();

    return true;
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
}

