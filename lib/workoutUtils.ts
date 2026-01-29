import { Workout } from "./types";

export function calculateEstimatedDuration(workout: Workout): number {
  let totalSeconds = 0;

  // Calculate duration for each exercise
  workout.sections.forEach((section) => {
    section.exercises.forEach((exercise) => {
      // Estimated time per rep: 3 seconds
      const exerciseDuration = exercise.sets * exercise.reps * 3;
      // Add rest time
      const restDuration = exercise.sets * exercise.restSeconds;
      totalSeconds += exerciseDuration + restDuration;
    });

    // Add transition time between sections (1 minute)
    totalSeconds += 60;
  });

  // Convert to minutes and round up
  return Math.ceil(totalSeconds / 60);
}

export function getTargetMuscles(workout: Workout): string[] {
  const musclesSet = new Set<string>();

  workout.sections.forEach((section) => {
    section.exercises.forEach((exercise) => {
      if (exercise.primaryMuscles && Array.isArray(exercise.primaryMuscles)) {
        exercise.primaryMuscles.forEach((muscle) => {
          musclesSet.add(muscle);
        });
      }
    });
  });

  return Array.from(musclesSet);
}

export function getRequiredEquipment(workout: Workout): string[] {
  const equipmentSet = new Set<string>();

  workout.sections.forEach((section) => {
    section.exercises.forEach((exercise) => {
      if (exercise.equipment && Array.isArray(exercise.equipment)) {
        exercise.equipment.forEach((eq) => {
          equipmentSet.add(eq);
        });
      }
    });
  });

  return Array.from(equipmentSet);
}

export function getMuscleCoverage(workout: Workout): Record<string, number> {
  const coverage: Record<string, number> = {};

  workout.sections.forEach((section) => {
    section.exercises.forEach((exercise) => {
      if (exercise.primaryMuscles && Array.isArray(exercise.primaryMuscles)) {
        exercise.primaryMuscles.forEach((muscle) => {
          coverage[muscle] = (coverage[muscle] || 0) + 1;
        });
      }
    });
  });

  return coverage;
}

export function getTotalExercises(workout: Workout): number {
  return workout.sections.reduce(
    (sum, section) => sum + section.exercises.length,
    0
  );
}

export function getTotalSets(workout: Workout): number {
  let total = 0;
  workout.sections.forEach((section) => {
    section.exercises.forEach((exercise) => {
      total += exercise.sets;
    });
  });
  return total;
}
