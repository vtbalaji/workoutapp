import * as admin from "firebase-admin";

let isInitialized = false;
let initializationAttempted = false;

/**
 * Initialize Firebase Admin SDK only if valid credentials are present
 */
function initializeAdmin() {
  // If already initialized, return
  if (admin.apps.length > 0) {
    console.log("Firebase Admin SDK already initialized");
    return true;
  }

  // Prevent multiple initialization attempts in same request
  if (initializationAttempted) {
    console.log("Firebase Admin SDK initialization already attempted in this request");
    return admin.apps.length > 0;
  }

  initializationAttempted = true;

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    console.log("Attempting Firebase Admin initialization...");
    console.log("  projectId present:", !!projectId);
    console.log("  clientEmail present:", !!clientEmail);
    console.log("  privateKey present:", !!privateKey);

    // Check if we have all required credentials
    if (!projectId || !clientEmail || !privateKey) {
      console.warn(
        "⚠️  Firebase Admin credentials not configured. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to .env.local"
      );
      return false;
    }

    if (privateKey.includes("PLACEHOLDER")) {
      console.warn("⚠️  Firebase Admin credentials contain PLACEHOLDER");
      return false;
    }

    // Handle both quoted and unquoted private keys
    let formattedPrivateKey = privateKey;
    if (formattedPrivateKey.startsWith('"') && formattedPrivateKey.endsWith('"')) {
      formattedPrivateKey = formattedPrivateKey.slice(1, -1);
    }
    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, "\n");

    const serviceAccount = {
      projectId,
      clientEmail,
      privateKey: formattedPrivateKey,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });

    isInitialized = true;
    console.log("✅ Firebase Admin SDK initialized successfully");
    return true;
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin SDK:", error);
    return false;
  }
}

/**
 * Verify Firebase ID token
 */
export async function verifyIdToken(token: string) {
  const initialized = initializeAdmin();

  if (!initialized || admin.apps.length === 0) {
    console.error("Firebase Admin SDK not configured");
    throw new Error(
      "Firebase Admin SDK not configured. Please add Firebase service account credentials to .env.local"
    );
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error("Error verifying token:", error);
    throw new Error("Invalid or expired token");
  }
}

export default admin;
