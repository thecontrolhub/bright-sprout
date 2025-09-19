import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

interface AddChildData {
  username: string;
  password: string;
  name: string;
  age: number;
  parentId: string;
  grade: string;
}

export const addChildWithUsername = onCall<AddChildData>(async (request) => {
  console.log("request.auth:", request.auth);
  if (!request.auth || !request.auth.token.isParent) {
    throw new HttpsError(
      "unauthenticated",
      "Only authenticated parents can add children.",
    );
  }

  const {username, password, name, age, parentId, grade} = request.data;

  if (!username || !password || !name || !age || !parentId || !grade) {
    throw new HttpsError(
      "invalid-argument",
      `Missing required fields: username, password, 
      name, age, parentId, grade.`,
    );
  }

  if (request.auth.uid !== parentId) {
    throw new HttpsError(
      "permission-denied",
      "Parent ID in request does not match authenticated user.",
    );
  }

  const db = admin.firestore();

  const usernameQuerySnapshot = await db.collection("children")
    .where("username", "==", username).get();
  if (!usernameQuerySnapshot.empty) {
    throw new HttpsError(
      "already-exists",
      "The username is already taken.",
    );
  }

  const internalEmail = `${username}.child@brightsprout.com`;

  try {
    const userRecord = await admin.auth().createUser({
      email: internalEmail,
      password: password,
      displayName: name,
    });

    const childUid = userRecord.uid;

    await db.collection("children").doc(childUid).set({
      name,
      age,
      parentId: parentId,
      avatar: "person-circle-outline",
      username: username,
      role: "child",
      grade: grade,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {success: true, message: "Child added successfully!",
      childUid: childUid};
  } catch (error: any) {
    console.error("Error adding child:", error);
    if (error.code === "auth/email-already-in-use") {
      throw new HttpsError(
        "already-exists",
        "An account with this username (internal email) already exists.",
      );
    } else if (error.code === "auth/weak-password") {
      throw new HttpsError(
        "invalid-argument",
        "The password is too weak.",
      );
    } else {
      throw new HttpsError(
        "internal",
        "Failed to add child.",
        error.message,
      );
    }
  }
});
