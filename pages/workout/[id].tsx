/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import DetailModal from "@/components/DetailModal";
import { Exercise } from "@/lib/types";

interface WorkoutExercise {
  id: string;
  title: string;
  duration?: string;
  sets?: number;
  reps?: number;
  rest?: string;
  image?: string;
  exerciseId?: string;
}

interface WorkoutData {
  id: string;
  name: string;
  totalTime: string;
  totalExercises: number;
  exercises: WorkoutExercise[];
}

export default function WorkoutDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [workout, setWorkout] = useState<WorkoutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    // Fetch exercises first
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises");
        if (response.ok) {
          const data = await response.json();
          setExercises(data);
        }
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    // Mock workout data - in production, this would come from your backend
    if (id) {
      const mockWorkout: WorkoutData = {
        id: id as string,
        name: "Intro to Weightlifting 11",
        totalTime: "59 min",
        totalExercises: 3,
        exercises: [
          {
            id: "1",
            title: "Barbell Bench Press",
            sets: 4,
            reps: 6,
            rest: "2:00",
            exerciseId: "10231",
          },
          {
            id: "2",
            title: "Barbell Bent Over Row",
            sets: 3,
            reps: 8,
            rest: "1:30",
            exerciseId: "10232",
          },
          {
            id: "3",
            title: "Dumbbell Incline Curl",
            sets: 3,
            reps: 10,
            rest: "1:00",
            exerciseId: "10233",
          },
        ],
      };
      setWorkout(mockWorkout);
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Loading workout...</p>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Workout not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-indigo-600">
            FitnessPro
          </Link>
          <div className="flex gap-4">
            <Link href="/exercises" className="text-gray-600 hover:text-gray-900">
              Exercises
            </Link>
            <Link href="/yoga" className="text-gray-600 hover:text-gray-900">
              Yoga
            </Link>
            <Link href="/workouts" className="text-indigo-600 font-semibold">
              Workouts
            </Link>
          </div>
        </div>
      </nav>

      {/* Workout Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Link
            href="/workouts"
            className="text-purple-100 hover:text-white mb-4 inline-block"
          >
            ← Back to Workouts
          </Link>
          <h1 className="text-4xl font-bold mb-4">{workout.name}</h1>
          <div className="flex gap-6 text-purple-100">
            <span className="text-lg font-semibold text-green-400">
              {workout.totalTime}
            </span>
            <span className="text-lg">{workout.totalExercises} exercises</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Exercises List */}
        <div className="space-y-8">
          {workout.exercises.map((exercise, index) => {
            const fullExerciseData = exercises.find(
              (ex) => ex.id === exercise.exerciseId
            );
            return (
              <button
                key={exercise.id}
                onClick={() => fullExerciseData && setSelectedExercise(fullExerciseData)}
                className="w-full text-left bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                  {/* Exercise Image */}
                  <div className="md:col-span-1">
                    <div className="bg-gray-100 rounded-lg overflow-hidden h-48 flex items-center justify-center">
                      {fullExerciseData && (
                        <img
                          src={`/exercise-images/${fullExerciseData.slug}/male.svg`}
                          alt={exercise.title}
                          className="w-full h-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/200?text=Exercise";
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Exercise Details */}
                  <div className="md:col-span-2">
                    <h3 className="text-2xl font-bold mb-6">{exercise.title}</h3>

                    {/* Duration or Sets/Reps */}
                    <div className="flex gap-6 items-center text-lg">
                      {exercise.duration && (
                        <span className="font-semibold text-green-600">
                          {exercise.duration}
                        </span>
                      )}
                      {exercise.sets && exercise.reps && (
                        <div className="flex gap-4">
                          <span className="font-semibold">
                            {exercise.sets}{" "}
                            <span className="text-gray-400 font-normal">sets</span>
                          </span>
                          <span className="font-semibold">
                            {exercise.reps}{" "}
                            <span className="text-gray-400 font-normal">reps</span>
                          </span>
                        </div>
                      )}
                      {exercise.rest && (
                        <span>
                          {exercise.rest}{" "}
                          <span className="text-gray-400">rest</span>
                        </span>
                      )}
                    </div>

                    {/* Click hint */}
                    <p className="text-blue-600 text-sm mt-4">Click to view exercise details</p>
                  </div>
                </div>

                {/* Rest Period (if not last exercise) */}
                {index < workout.exercises.length - 1 && exercise.rest && (
                  <div className="bg-gray-100 px-8 py-4 border-t">
                    <p className="text-lg font-semibold text-gray-700">
                      {exercise.rest} rest
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Start Workout Button */}
        <div className="mt-12 flex gap-4 justify-center">
          <button className="bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors">
            ▶ Start Workout
          </button>
          <Link href="/workouts">
            <button className="bg-gray-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-700 transition-colors">
              ← Back to Workouts
            </button>
          </Link>
        </div>
      </div>

      {/* Exercise Detail Modal */}
      <DetailModal
        item={selectedExercise}
        type="exercise"
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
}
