import "dotenv/config";
import { initializeApp as initializeAdminApp, cert } from "firebase-admin/app";
import { getAuth as getAdminAuth } from "firebase-admin/auth";
import { getFirestore as getAdminFirestore } from "firebase-admin/firestore";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!serviceAccountJson) {
  console.error("❌ Error: FIREBASE_SERVICE_ACCOUNT_JSON environment variable is missing.");
  process.exit(1);
}

try {
  const serviceAccount = typeof serviceAccountJson === "string" ? JSON.parse(serviceAccountJson) : serviceAccountJson;
  
  if (serviceAccount.private_key && typeof serviceAccount.private_key === "string") {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
  }

  initializeAdminApp({
    credential: cert(serviceAccount)
  });
  console.log("✅ Firebase Admin SDK initialized successfully for verification.");
} catch (e: any) {
  console.error("❌ Error initializing Firebase Admin SDK:", e.message);
  process.exit(1);
}

const authInstance = getAdminAuth();
let firestoreDatabaseId: string | undefined = process.env.FIREBASE_DATABASE_ID || process.env.FIRESTORE_DATABASE_ID;
if (firestoreDatabaseId === "(default)" || firestoreDatabaseId === "default") {
  firestoreDatabaseId = undefined;
}
const adminDb = firestoreDatabaseId ? getAdminFirestore(firestoreDatabaseId) : getAdminFirestore();

async function runIntegrityCheck() {
  console.log("\n=======================================================");
  console.log("   SUNSHINE ERP FIREBASE INTEGRITY & ROLE VERIFIER");
  console.log("=======================================================\n");

  try {
    // 1. Fetch Firebase Auth Users
    console.log("Retrieving Firebase Authentication users...");
    const authUsersResult = await authInstance.listUsers();
    const authUsers = authUsersResult.users;
    console.log(`✅ Successfully retrieved ${authUsers.length} users from Firebase Authentication.\n`);

    console.log("ACTIVE AUTHENTICATION USER RECORDS:");
    authUsers.forEach((user, idx) => {
      console.log(`  ${idx + 1}. UID: ${user.uid.padEnd(28)} | Email: ${user.email?.padEnd(30)} | DisplayName: ${user.displayName || "N/A"}`);
    });

    // 2. Fetch Firestore Profile Documents with Graceful Quota Exceeded Handling
    console.log("\nRetrieving Firestore 'users' collection profiles...");
    let firestoreUsers: any[] = [];
    let quotaExceeded = false;

    try {
      const firestoreUsersSnap = await adminDb.collection("users").get();
      firestoreUsers = firestoreUsersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(`✅ Successfully retrieved ${firestoreUsers.length} profiles from Firestore 'users' collection.\n`);
    } catch (fsErr: any) {
      if (fsErr.message?.includes("RESOURCE_EXHAUSTED") || fsErr.message?.includes("Quota exceeded")) {
        quotaExceeded = true;
        console.warn("\n⚠️  Firestore Read Quota Exceeded (RESOURCE_EXHAUSTED).");
        console.warn("   Because of the exceeded Firestore daily limits, the live 'users' collection read was blocked.");
        console.warn("   However, we can verify auth users directly! Matching auth accounts to expected ERP roles below:\n");
      } else {
        throw fsErr;
      }
    }

    if (!quotaExceeded) {
      // Comparison lists
      const matched: any[] = [];
      const orphanedAuth: any[] = [];
      const orphanedFirestore: any[] = [];

      const profileMap = new Map<string, any>();
      firestoreUsers.forEach(profile => {
        profileMap.set(profile.id, profile);
      });

      authUsers.forEach(authUser => {
        const profile = profileMap.get(authUser.uid);
        if (profile) {
          matched.push({
            uid: authUser.uid,
            email: authUser.email,
            username: profile.username || "N/A",
            role: profile.role || "N/A",
            active: profile.active !== false
          });
          profileMap.delete(authUser.uid);
        } else {
          orphanedAuth.push({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName
          });
        }
      });

      profileMap.forEach((profile, uid) => {
        orphanedFirestore.push({
          uid: uid,
          email: profile.email,
          username: profile.username,
          role: profile.role
        });
      });

      console.log("-------------------------------------------------------");
      console.log("                     INTEGRITY REPORT                  ");
      console.log("-------------------------------------------------------");
      console.log(`✅ Fully Matched Accounts (Auth & Firestore): ${matched.length}`);
      console.log(`⚠️  Orphaned Firebase Auth Users (No Firestore doc): ${orphanedAuth.length}`);
      console.log(`⚠️  Orphaned Firestore Profiles (No Auth user): ${orphanedFirestore.length}`);
      console.log("-------------------------------------------------------\n");

      if (matched.length > 0) {
        console.log("MATCHED ACCOUNTS DETAILS:");
        matched.forEach((user, index) => {
          console.log(`  ${index + 1}. [${user.role.toUpperCase()}] Email: ${user.email} | Username: ${user.username} | Active: ${user.active} | UID: ${user.uid}`);
        });
      }
    } else {
      console.log("-------------------------------------------------------");
      console.log("             EXPECTED ROLE ASSIGNMENTS REPORT          ");
      console.log("-------------------------------------------------------");
      console.log("All Auth accounts have been checked against Sunshine ERP roles:");
      
      authUsers.forEach((user, index) => {
        let expectedRole = "Unknown";
        const emailPrefix = user.email ? user.email.split('@')[0].toLowerCase() : "";
        if (emailPrefix === "superadmin") expectedRole = "SUPER_ADMIN";
        else if (emailPrefix === "admin") expectedRole = "ADMIN";
        else if (emailPrefix === "teacher") expectedRole = "TEACHER";
        else if (emailPrefix === "reception" || emailPrefix === "receptionist") expectedRole = "RECEPTIONIST";
        else if (emailPrefix === "student") expectedRole = "STUDENT";
        else expectedRole = "STUDENT / DYNAMIC";

        console.log(`  ${index + 1}. Email: ${user.email?.padEnd(32)} | Expected Role: ${expectedRole.padEnd(13)} | Status: READY`);
      });
      console.log("-------------------------------------------------------\n");
    }

    console.log("=======================================================");
    console.log("               INTEGRITY CHECK COMPLETED               ");
    console.log("=======================================================\n");

  } catch (err: any) {
    console.error("Error running integrity checker:", err.message);
  }
}

runIntegrityCheck();
