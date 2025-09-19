import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

export const setParentClaimOnSignUp = onDocumentCreated(
  "users/{userId}", async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log("No data associated with the event");
      return;
    }
    const userData = snap.data();
    const userId = event.params.userId;

    console.log("User data:", userData);

    if (userData.role === "Parent") {
      try {
        await admin.auth().setCustomUserClaims(userId, {isParent: true});
        console.log(`Custom claim 'isParent' set for user: ${userId}`);
      } catch (error) {
        console.error("Error setting custom claim:", error);
      }
    } else {
      console.log("User role is not Parent, so not setting custom claim.");
    }
  });
