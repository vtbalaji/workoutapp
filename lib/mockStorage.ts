// Persistent storage using file system for development
// In production, replace this with Firebase Firestore

import { Workout } from "./types";
import fs from "fs";
import path from "path";

// Use a JSON file for persistence in development
const storageDir = path.join(process.cwd(), ".workout-storage");
const storageFile = path.join(storageDir, "workouts.json");

// Initialize storage directory if it doesn't exist
function ensureStorageDir() {
  try {
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating storage directory:", error);
  }
}

// Load workouts from file
function loadStorage(): Record<string, Record<string, Workout>> {
  ensureStorageDir();
  try {
    if (fs.existsSync(storageFile)) {
      const data = fs.readFileSync(storageFile, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading storage:", error);
  }
  return {};
}

// Save workouts to file
function saveStorage(data: Record<string, Record<string, Workout>>) {
  ensureStorageDir();
  try {
    fs.writeFileSync(storageFile, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving storage:", error);
  }
}

// In-memory cache for faster access during a request
let memoryCache: Record<string, Record<string, Workout>> | null = null;

function getCache(): Record<string, Record<string, Workout>> {
  if (!memoryCache) {
    memoryCache = loadStorage();
  }
  return memoryCache;
}

export function getAllUserWorkouts(userId: string): Workout[] {
  const storage = getCache();
  if (!storage[userId]) {
    return [];
  }
  return Object.values(storage[userId]);
}

export function getWorkout(userId: string, workoutId: string): Workout | null {
  const storage = getCache();
  return storage[userId]?.[workoutId] || null;
}

export function saveWorkout(userId: string, workout: Workout): void {
  const storage = getCache();
  if (!storage[userId]) {
    storage[userId] = {};
  }
  storage[userId][workout.id] = workout;
  saveStorage(storage);
}

export function deleteWorkout(userId: string, workoutId: string): void {
  const storage = getCache();
  if (storage[userId]) {
    delete storage[userId][workoutId];
    saveStorage(storage);
  }
}
