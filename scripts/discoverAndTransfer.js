/**
 * Script to discover collections in fitness-tracker-00001 and transfer them all
 * This will use the same Firebase config pattern as your projects
 */

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Source project configuration (fitness-tracker-00001)
// Using the same config pattern as your current project but for the old project
const sourceConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY, // Same API key should work for both projects
  authDomain: "fitness-tracker-00001.firebaseapp.com",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL?.replace(
    "fitness-tracker-clean",
    "fitness-tracker-00001"
  ),
  projectId: "fitness-tracker-00001",
  storageBucket: "fitness-tracker-00001.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID?.replace(
    "fitness-tracker-clean",
    "fitness-tracker-00001"
  ),
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Destination project configuration (fitness-tracker-clean - your current project)
const destConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

console.log("🔧 Configuration:");
console.log(`📤 Source: ${sourceConfig.projectId}`);
console.log(`📥 Destination: ${destConfig.projectId}`);

// Initialize both Firebase apps
const sourceApp = initializeApp(sourceConfig, "source");
const destApp = initializeApp(destConfig, "dest");

const sourceDb = getFirestore(sourceApp);
const destDb = getFirestore(destApp);

const BATCH_SIZE = 300;

async function discoverCollections() {
  try {
    console.log("\n🔍 Discovering collections in source project...");

    // Try to discover collections by checking common collection names
    const commonCollections = [
      // Food database collections
      "food_names",
      "nutrient_amounts",
      "nutrient_names",
      "food_groups",
      "conversion_factors",
      "food_sources",
      "measure_names",
      "nutrient_sources",
      "refuse_amounts",
      "refuse_names",
      "yield_amounts",
      "yield_names",
      "foods",

      // User and fitness data collections
      "users",
      "userGoals",
      "workouts",
      "workoutPlans",
      "foodEntries",
      "exercises",
      "meals",
      "progress",
      "settings",
      "fitnessData",

      // Additional possible fitness collections
      "calorieEntries",
      "nutritionEntries",
      "dailyLogs",
      "userProfiles",
      "workoutSessions",
      "exerciseHistory",
      "goals",
      "achievements",
      "measurements",
      "bodyWeight",
      "personalRecords",
      "streaks",
    ];

    const existingCollections = [];

    for (const collectionName of commonCollections) {
      try {
        const collectionRef = collection(sourceDb, collectionName);
        const snapshot = await getDocs(collectionRef);
        if (!snapshot.empty) {
          existingCollections.push({
            name: collectionName,
            count: snapshot.size,
          });
          console.log(
            `  ✅ Found: ${collectionName} (${snapshot.size} documents)`
          );
        }
      } catch (error) {
        // Collection doesn't exist or no permission, skip silently
      }
    }

    if (existingCollections.length === 0) {
      console.log("  ⚠️  No collections found or no read access");
      return [];
    }

    console.log(`\n📊 Total collections found: ${existingCollections.length}`);
    const totalDocs = existingCollections.reduce(
      (sum, col) => sum + col.count,
      0
    );
    console.log(
      `📈 Total documents to transfer: ${totalDocs.toLocaleString()}`
    );

    return existingCollections;
  } catch (error) {
    console.error("❌ Error discovering collections:", error.message);
    return [];
  }
}

async function transferCollection(collectionName) {
  try {
    console.log(`\n📁 Transferring: ${collectionName}`);

    // Read all documents from source collection
    const sourceCollection = collection(sourceDb, collectionName);
    const snapshot = await getDocs(sourceCollection);

    if (snapshot.empty) {
      console.log(`  ⚠️  Collection ${collectionName} is empty`);
      return { success: true, count: 0 };
    }

    const documents = snapshot.docs.map((doc) => ({
      id: doc.id,
      data: doc.data(),
    }));

    console.log(`  📊 Transferring ${documents.length} documents...`);

    // Transfer documents in batches
    const totalBatches = Math.ceil(documents.length / BATCH_SIZE);
    let transferredCount = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const batch = writeBatch(destDb);
      const startIndex = batchIndex * BATCH_SIZE;
      const endIndex = Math.min(startIndex + BATCH_SIZE, documents.length);
      const batchDocs = documents.slice(startIndex, endIndex);

      // Show progress for larger collections
      if (totalBatches > 10 && batchIndex % 10 === 0) {
        const progress = Math.round((batchIndex / totalBatches) * 100);
        console.log(
          `    📦 Progress: ${progress}% (batch ${
            batchIndex + 1
          }/${totalBatches})`
        );
      } else if (totalBatches <= 10) {
        console.log(`    📦 Batch ${batchIndex + 1}/${totalBatches}`);
      }

      // Add documents to batch
      batchDocs.forEach(({ id, data }) => {
        const docRef = doc(collection(destDb, collectionName), id);
        batch.set(docRef, data);
      });

      // Commit the batch with retry logic
      let retries = 3;
      let currentBatch = batch;

      while (retries > 0) {
        try {
          await currentBatch.commit();
          transferredCount += batchDocs.length;
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            throw error;
          }
          console.log(
            `      ⚠️  Batch failed, retrying... (${retries} attempts left)`
          );

          // Create a new batch for retry
          currentBatch = writeBatch(destDb);
          batchDocs.forEach(({ id, data }) => {
            const docRef = doc(collection(destDb, collectionName), id);
            currentBatch.set(docRef, data);
          });

          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Delay between batches
      if (batchIndex < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    console.log(`  🎉 Successfully transferred ${transferredCount} documents`);
    return { success: true, count: transferredCount };
  } catch (error) {
    console.error(`  ❌ Failed to transfer ${collectionName}:`, error.message);
    return { success: false, error: error.message, count: 0 };
  }
}

async function transferAllData() {
  try {
    console.log(
      "🚀 Starting complete data transfer from fitness-tracker-00001 to fitness-tracker-clean...\n"
    );

    // First, discover what collections exist
    const collections = await discoverCollections();

    if (collections.length === 0) {
      console.log("❌ No collections found to transfer. Please check:");
      console.log("1. That fitness-tracker-00001 project exists and has data");
      console.log("2. That you have read access to the source project");
      console.log("3. That your Firebase authentication covers both projects");
      return;
    }

    console.log("\n🚀 Starting transfer process...");

    const results = [];

    // Transfer each collection
    for (const { name } of collections) {
      const result = await transferCollection(name);
      results.push({
        collectionName: name,
        ...result,
      });

      // Short break between collections
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Summary
    console.log("\n📊 Transfer Summary:");
    console.log("=".repeat(70));

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const totalRecords = successful.reduce((sum, r) => sum + r.count, 0);

    console.log(`✅ Successful transfers: ${successful.length}`);
    console.log(`❌ Failed transfers: ${failed.length}`);
    console.log(
      `📈 Total documents transferred: ${totalRecords.toLocaleString()}`
    );

    if (successful.length > 0) {
      console.log("\n✅ Successfully transferred collections:");
      successful.forEach((r) => {
        console.log(
          `  - ${r.collectionName} (${r.count.toLocaleString()} documents)`
        );
      });
    }

    if (failed.length > 0) {
      console.log("\n❌ Failed transfers:");
      failed.forEach((r) => {
        console.log(`  - ${r.collectionName}: ${r.error}`);
      });
    }

    if (successful.length > 0) {
      console.log("\n🎉 Transfer completed!");
      console.log("\n📋 Next steps:");
      console.log("1. Update your food database service to use Firestore");
      console.log("2. Test your app: npm run dev");
      console.log(
        "3. Navigate to the food database page and test functionality"
      );

      if (
        successful.some(
          (r) =>
            r.collectionName.includes("food") ||
            r.collectionName.includes("nutrient")
        )
      ) {
        console.log("\n💡 Food database collections were transferred!");
        console.log(
          "You can now switch to using the Firestore food database service."
        );
      }
    }
  } catch (error) {
    console.error("💥 Fatal error during transfer:", error);
    process.exit(1);
  }
}

// Run the transfer
transferAllData();
