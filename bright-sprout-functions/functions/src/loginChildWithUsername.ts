import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

interface LoginChildData {
  username: string;
  password: string;
}

export const loginChildWithUsername =
onCall<LoginChildData>(async (request) => {
  const {username, password} = request.data;

  if (!username || !password) {
    throw new HttpsError(
      "invalid-argument",
      "Missing username or password.",
    );
  }

  const db = admin.firestore();

  try {
    const q = db.collection("children").where("username", "==", username);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      throw new HttpsError(
        "not-found",
        "No child found with that username.",
      );
    }

    const childUid = querySnapshot.docs[0].id;
    const customToken = await admin.auth().createCustomToken(childUid);

    return {success: true, customToken: customToken};
  } catch (error: any) {
    console.error("Error logging in child:", error);
    throw new HttpsError(
      "internal",
      "Failed to log in child.",
      error.message,
    );
  }
});
