import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import "dotenv/config";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) {
  console.error("Critical Error: FIREBASE_SERVICE_ACCOUNT_JSON environment variable is missing.");
  process.exit(1);
}

const serviceAccount = typeof serviceAccountJson === "string" ? JSON.parse(serviceAccountJson) : serviceAccountJson;
if (serviceAccount.private_key && typeof serviceAccount.private_key === "string") {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

let firestoreDatabaseId: string | undefined = process.env.FIREBASE_DATABASE_ID || process.env.FIRESTORE_DATABASE_ID;
// Also check firebase-applet-config.json
try {
  const fs = require("fs");
  const path = require("path");
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (config.firestoreDatabaseId) {
      firestoreDatabaseId = config.firestoreDatabaseId;
    }
  }
} catch (e) {}

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = firestoreDatabaseId && firestoreDatabaseId !== "(default)" && firestoreDatabaseId !== "default"
  ? getFirestore(firestoreDatabaseId)
  : getFirestore();

async function runAudit() {
  console.log("=== STARTING AUTHENTICATION AND FIRESTORE AUDIT ===");
  
  // 1. Fetch all users from Firebase Auth
  const authUsers: any[] = [];
  let nextPageToken: string | undefined = undefined;
  
  do {
    const listResult = await auth.listUsers(1000, nextPageToken);
    authUsers.push(...listResult.users);
    nextPageToken = listResult.pageToken;
  } while (nextPageToken);

  console.log(`\n--- Firebase Authentication Users (Total: ${authUsers.length}) ---`);
  authUsers.forEach(u => {
    console.log(`UID: ${u.uid} | Email: ${u.email} | Disabled: ${u.disabled}`);
  });

  // 2. Fetch all users from Firestore 'users' collection
  const firestoreUsers: any[] = [];
  const snapshot = await db.collection("users").get();
  snapshot.forEach(doc => {
    firestoreUsers.push({ id: doc.id, ...doc.data() });
  });

  console.log(`\n--- Firestore 'users' Collection (Total: ${firestoreUsers.length}) ---`);
  firestoreUsers.forEach(u => {
    console.log(`UID/DocID: ${u.id} | Username: ${u.username} | Email: ${u.email} | Role: ${u.role} | Active: ${u.active}`);
  });

  // 3. Verification Checklist
  console.log("\n=== CROSS-REFERENCING VERIFICATION ===");
  const authUids = new Set(authUsers.map(u => u.uid));
  const firestoreIds = new Set(firestoreUsers.map(u => u.id));

  let mismatchCount = 0;

  // Check matching Firestore documents for Auth UIDs
  console.log("\nChecking that every Firebase Auth user has exactly one matching Firestore document...");
  for (const u of authUsers) {
    if (firestoreIds.has(u.uid)) {
      const match = firestoreUsers.find(f => f.id === u.uid);
      console.log(`✅ MATCH: Auth UID [${u.uid}] (${u.email}) -> Firestore Doc [${match.id}] (${match.email})`);
    } else {
      console.log(`❌ MISMATCH: Auth UID [${u.uid}] (${u.email}) has NO Firestore document!`);
      mismatchCount++;
    }
  }

  // Check matching Auth accounts for Firestore documents
  console.log("\nChecking that every Firestore user has exactly one matching Firebase Auth account...");
  for (const f of firestoreUsers) {
    if (authUids.has(f.id)) {
      console.log(`✅ MATCH: Firestore Doc [${f.id}] (${f.email}) -> Auth UID [${f.id}]`);
    } else {
      console.log(`❌ MISMATCH: Firestore Doc [${f.id}] (${f.email}) has NO Firebase Auth account!`);
      mismatchCount++;
    }
  }

  console.log(`\nAudit completed with ${mismatchCount} mismatches found.`);
}

runAudit().catch(err => {
  console.error("Audit failed with error:", err);
  process.exit(1);
});
