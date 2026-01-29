# Workout App

A comprehensive workout and fitness tracking application built with Next.js, TypeScript, and Firebase.

## Features

- 🏋️ **Workout Builder**: Create custom workouts with drag-and-drop exercise organization
- 📋 **Template System**: Save and reuse workout templates
- 💪 **Exercise Library**: Extensive database of exercises with detailed instructions and images
- 🧘 **Yoga Poses**: Complete yoga pose library with Sanskrit names and descriptions
- 🔥 **Firebase Integration**: Real-time data sync and authentication
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean interface with Tailwind CSS and Font Awesome icons

## Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Email/Password + Google)
- **Icons**: Font Awesome
- **Drag & Drop**: @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone git@github.com:vtbalaji/workoutapp.git
cd workoutapp
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Enable Authentication (Email/Password and Google)
   - Get your Firebase configuration

4. Create `.env.local` file:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
workoutapp/
├── components/          # React components
│   ├── workout-builder/ # Workout builder components
│   └── template-builder/ # Template builder components
├── contexts/           # React contexts (Auth, etc.)
├── data/              # JSON data files (exercises, yoga)
├── lib/               # Utility functions and types
├── pages/             # Next.js pages
│   └── api/          # API routes
├── public/            # Static assets
│   ├── exercise-images/ # Exercise SVG images
│   ├── yoga-images/    # Yoga pose SVG images
│   └── muscle-groups/  # Muscle group overlay images
└── styles/            # Global styles

```

## Deployment

To deploy updates to production:

```bash
./deploy.sh "Your commit message"
```

## License

MIT

## Author

Balaji Thanigaiarasu
