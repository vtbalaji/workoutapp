export interface Yoga {
  id: string;
  slug: string;
  title: string;
  sanskrit_name: string;
  description: string;
  pose_description: string;
  pose_category: string;
  difficulty: string;
  alignment_cues: string[];
  benefits: string[];
  primary_body_parts: string[];
  secondary_body_parts: string[];
  related_poses: string[];
  modifications: string[];
  warnings: string[];
}

export interface Exercise {
  id: string;
  slug: string;
  title: string;
  description: string;
  pose_description: string;
  pose_category: string;
  alignment_cues: string[];
  benefits: string[];
  equipment: string[];
  primary_muscles: string[];
  secondary_muscles: string[];
  related_exercises: string[];
  related_poses: string[];
  animation_frames?: number; // 1, 2, or 3
  animation_orientation?: 'horizontal' | 'vertical' | 'random';
}

export interface Workout {
  id: string;
  userId: string;
  workoutName: string;
  workoutDescription: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  sections: WorkoutSection[];
  targetMuscles: string[];
  requiredEquipment: string[];
  estimatedDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutSection {
  id: string;
  name: string;
  exercises: WorkoutExercise[];
  order: number;
  sets?: number; // Number of times to repeat all exercises in this section (default: 1)
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseSlug?: string; // e.g., "kneeling-hip-flexor-stretch"
  exerciseName: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes: string;
  order: number;
  imageUrl: string;
  primaryMuscles: string[];
  equipment: string[];
  description?: string;
  animation_frames?: number; // 1, 2, or 3
  animation_orientation?: 'horizontal' | 'vertical' | 'random';
}

export interface SectionTemplate {
  id: string;
  name: string;
  category: "warmup" | "core" | "cooldown" | "cardio" | "strength";
  exercises: TemplateExercise[];
  estimatedDuration: number;
}

export interface TemplateExercise {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface Template {
  id: string;
  userId: string;
  name: string;
  description: string;
  category: "warmup" | "core" | "cooldown" | "cardio" | "strength" | "custom";
  exercises: WorkoutExercise[];
  createdAt: Date;
  updatedAt: Date;
}
