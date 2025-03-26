import { db } from "../firebase/firebaseconfig";
import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";

export const updateLeadScore = async (userId: string, action: string, points: number) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const currentLeadScore = userSnap.data().leadScore || 0;

      await updateDoc(userRef, {
        leadScore: currentLeadScore + points,
        lastInteraction: action,
        recommendations: arrayUnion(`Based on your action: ${action}`)
      });
    }
  } catch (error) {
    console.error("Error updating lead score:", error);
  }
};
