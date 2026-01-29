import { SectionTemplate } from "./types";

export const sectionTemplates: SectionTemplate[] = [
  // WARMUP TEMPLATES
  {
    id: "warmup-dynamic",
    name: "Dynamic Warmup",
    category: "warmup",
    estimatedDuration: 8,
    exercises: [
      {
        exerciseId: "74310",
        exerciseName: "Ankle Circles / Rotations / Rolls",
        sets: 1,
        reps: 15,
        restSeconds: 30,
      },
      {
        exerciseId: "2239",
        exerciseName: "Jumping Jacks / Star Jumps",
        sets: 1,
        reps: 20,
        restSeconds: 30,
      },
      {
        exerciseId: "1293",
        exerciseName: "Bodyweight Squats",
        sets: 1,
        reps: 15,
        restSeconds: 30,
      },
      {
        exerciseId: "2927",
        exerciseName: "High Knees / Front Knee Lifts",
        sets: 1,
        reps: 30,
        restSeconds: 30,
      },
    ],
  },
  {
    id: "warmup-mobility",
    name: "Mobility Warmup",
    category: "warmup",
    estimatedDuration: 10,
    exercises: [
      {
        exerciseId: "71982",
        exerciseName: "Seated Cat Cow",
        sets: 1,
        reps: 10,
        restSeconds: 30,
      },
      {
        exerciseId: "12233",
        exerciseName: "Hip Circles",
        sets: 1,
        reps: 12,
        restSeconds: 30,
      },
      {
        exerciseId: "104215",
        exerciseName: "Seated Shoulder Rolls / Shrugs",
        sets: 1,
        reps: 15,
        restSeconds: 30,
      },
      {
        exerciseId: "34449",
        exerciseName: "Elevated / Barbell Glute Bridges / Hip Raises",
        sets: 1,
        reps: 15,
        restSeconds: 30,
      },
    ],
  },

  // CORE TEMPLATES
  {
    id: "core-blast",
    name: "Core Blast",
    category: "core",
    estimatedDuration: 12,
    exercises: [
      {
        exerciseId: "5075",
        exerciseName: "Bosu Ball Plank",
        sets: 3,
        reps: 30,
        restSeconds: 60,
      },
      {
        exerciseId: "2547",
        exerciseName: "Ab Crunch Machine",
        sets: 3,
        reps: 15,
        restSeconds: 45,
      },
      {
        exerciseId: "1340",
        exerciseName: "Russian / Mason / V-Sit Twists",
        sets: 3,
        reps: 20,
        restSeconds: 45,
      },
      {
        exerciseId: "5090",
        exerciseName: "Bosu Ball Single / One Leg Bridge / Hip Thrusts / Extensions / Raises",
        sets: 3,
        reps: 12,
        restSeconds: 60,
      },
    ],
  },
  {
    id: "core-stability",
    name: "Stability Core",
    category: "core",
    estimatedDuration: 10,
    exercises: [
      {
        exerciseId: "3581",
        exerciseName: "Dead Bug",
        sets: 3,
        reps: 10,
        restSeconds: 60,
      },
      {
        exerciseId: "3488",
        exerciseName: "Bird Dogs / Alternating Reach &amp; Kickbacks",
        sets: 3,
        reps: 12,
        restSeconds: 60,
      },
      {
        exerciseId: "1732",
        exerciseName: "Side Plank",
        sets: 2,
        reps: 30,
        restSeconds: 45,
      },
      {
        exerciseId: "9377",
        exerciseName: "Palloff Press / Oblique Iso Hold",
        sets: 2,
        reps: 12,
        restSeconds: 60,
      },
    ],
  },

  // COOLDOWN TEMPLATES
  {
    id: "cooldown-full-body",
    name: "Full Body Stretch",
    category: "cooldown",
    estimatedDuration: 8,
    exercises: [
      {
        exerciseId: "2959",
        exerciseName: "Hamstring Stretch",
        sets: 1,
        reps: 30,
        restSeconds: 30,
      },
      {
        exerciseId: "1732",
        exerciseName: "Side Plank",
        sets: 1,
        reps: 30,
        restSeconds: 30,
      },
      {
        exerciseId: "104215",
        exerciseName: "Seated Shoulder Rolls / Shrugs",
        sets: 1,
        reps: 30,
        restSeconds: 30,
      },
      {
        exerciseId: "71982",
        exerciseName: "Seated Cat Cow",
        sets: 1,
        reps: 45,
        restSeconds: 0,
      },
    ],
  },
  {
    id: "cooldown-quick",
    name: "Quick Cooldown",
    category: "cooldown",
    estimatedDuration: 5,
    exercises: [
      {
        exerciseId: "71982",
        exerciseName: "Seated Cat Cow",
        sets: 1,
        reps: 30,
        restSeconds: 20,
      },
      {
        exerciseId: "1732",
        exerciseName: "Side Plank",
        sets: 1,
        reps: 45,
        restSeconds: 0,
      },
      {
        exerciseId: "12233",
        exerciseName: "Hip Circles",
        sets: 1,
        reps: 30,
        restSeconds: 0,
      },
    ],
  },

  // FINISHER TEMPLATES
  {
    id: "finisher-hiit",
    name: "HIIT Finisher",
    category: "cardio",
    estimatedDuration: 10,
    exercises: [
      {
        exerciseId: "1954",
        exerciseName: "Burpees / Squat Thrusts",
        sets: 3,
        reps: 10,
        restSeconds: 30,
      },
      {
        exerciseId: "1970",
        exerciseName: "Mountain Climbers / Alternating Knee-ins",
        sets: 3,
        reps: 20,
        restSeconds: 30,
      },
      {
        exerciseId: "2927",
        exerciseName: "High Knees / Front Knee Lifts / Run / Jog on the Spot",
        sets: 3,
        reps: 30,
        restSeconds: 30,
      },
      {
        exerciseId: "10231",
        exerciseName: "180 / Twisting Jump Squats",
        sets: 3,
        reps: 15,
        restSeconds: 30,
      },
    ],
  },
  {
    id: "finisher-strength",
    name: "Strength Finisher",
    category: "strength",
    estimatedDuration: 8,
    exercises: [
      {
        exerciseId: "16691",
        exerciseName: "Barbell Pushups / Push-ups",
        sets: 3,
        reps: 15,
        restSeconds: 60,
      },
      {
        exerciseId: "1293",
        exerciseName: "Bodyweight Squats",
        sets: 3,
        reps: 20,
        restSeconds: 60,
      },
      {
        exerciseId: "3706",
        exerciseName: "Bulgarian Split Squats",
        sets: 3,
        reps: 12,
        restSeconds: 60,
      },
    ],
  },
];
