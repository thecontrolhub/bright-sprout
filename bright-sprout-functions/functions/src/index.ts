import * as admin from "firebase-admin";

admin.initializeApp();

export {sendWelcomeEmail} from "./sendWelcomeEmail";
export {addChildWithUsername} from "./addChildWithUsername";
export {loginChildWithUsername} from "./loginChildWithUsername";
export {setParentClaimOnSignUp} from "./setParentClaimOnSignUp";
export {updateChildPassword} from "./updateChildPassword";
export {generateBaselineAssessment} from "./generateBaselineAssessment";
export {generateVisualAssessment} from "./generateVisualAssessment";
