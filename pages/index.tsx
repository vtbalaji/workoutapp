import Link from "next/link";

export default function Home() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Your Fitness Journey
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Explore exercises and yoga poses to build your perfect workout
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Exercises Card */}
          <Link href="/exercises">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all text-white">
              <div className="text-5xl mb-4">💪</div>
              <h3 className="text-3xl font-bold mb-2">Exercises</h3>
              <p className="text-blue-100 mb-4">
                Browse through hundreds of strength and conditioning exercises
              </p>
              <div className="text-sm opacity-75">
                Click to explore all exercises
              </div>
            </div>
          </Link>

          {/* Yoga Card */}
          <Link href="/yoga">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-8 cursor-pointer hover:shadow-xl transform hover:-translate-y-1 transition-all text-white">
              <div className="text-5xl mb-4">🧘</div>
              <h3 className="text-3xl font-bold mb-2">Yoga Poses</h3>
              <p className="text-green-100 mb-4">
                Master yoga asanas and improve flexibility and balance
              </p>
              <div className="text-sm opacity-75">
                Click to explore all yoga poses
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-3">📚</div>
            <h4 className="font-bold text-lg mb-2">Detailed Guides</h4>
            <p className="text-gray-600">
              Learn proper form, benefits, and alignment cues for each exercise
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-3">🎯</div>
            <h4 className="font-bold text-lg mb-2">Target Muscles</h4>
            <p className="text-gray-600">
              See which muscles and body parts are engaged in each activity
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-4xl mb-3">🔄</div>
            <h4 className="font-bold text-lg mb-2">Create Workouts</h4>
            <p className="text-gray-600">
              Combine exercises and yoga into custom workout routines
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
