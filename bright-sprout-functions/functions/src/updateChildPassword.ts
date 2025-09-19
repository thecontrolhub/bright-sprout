import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

interface UpdateChildPasswordData {
  childUid: string;
  newPassword: string;
}

export const updateChildPassword =
onCall<UpdateChildPasswordData>(async (request) => {
  if (!request.auth || !request.auth.token.isParent) {
    throw new HttpsError(
      "unauthenticated",
      "Only authenticated parents can update passwords.",
    );
  }

  const {childUid, newPassword} = request.data;

  if (!childUid || !newPassword) {
    throw new HttpsError(
      "invalid-argument",
      "Missing required fields: childUid, newPassword.",
    );
  }

  try {
    await admin.auth().updateUser(childUid, {
      password: newPassword,
    });
    return {success: true, message: "Password updated successfully!"};
  } catch (error: any) {
    console.error("Error updating password:", error);
    throw new HttpsError(
      "internal",
      "Failed to update password.",
      error.message,
    );
  }
});
