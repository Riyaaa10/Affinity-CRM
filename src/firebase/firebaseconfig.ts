import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  query,
  where,
  getDocs
} from "firebase/firestore";

// 🔥 Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEGiY5Lse1PfKmL9PUxwIHHiwUlquTT_E",
  authDomain: "affinitycrm-95a76.firebaseapp.com",
  projectId: "affinitycrm-95a76",
  storageBucket: "affinitycrm-95a76.firebasestorage.app",
  messagingSenderId: "622048574238",
  appId: "1:622048574238:web:daf5958f1033a5394f670f",
  measurementId: "G-FV7JN8K2FY"
};

// 🔥 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// 📌 Save User Role
const saveUserRole = async (uid: string, role: "admin" | "customer", email: string) => {
  await setDoc(doc(db, "users", uid), { role, email }, { merge: true });
};

// 📌 Get User Role
const getUserRole = async (uid: string): Promise<string | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data().role as string) : null;
};

// 📌 Log Customer Activity
const logCustomerActivity = async (uid: string, email: string, action: string, product?: any) => {
  if (!uid) return;
  await addDoc(collection(db, "customer_activity"), {
    userId: uid,
    email,
    action,
    product: product ? { id: product.id, name: product.name, price: product.price } : null,
    timestamp: serverTimestamp(),
  });
};

// 📌 Submit Customer Feedback
const submitCustomerFeedback = async (uid: string, email: string, type: "review" | "complaint", message: string, product?: any) => {
  if (!uid) return;
  await addDoc(collection(db, "customer_feedback"), {
    userId: uid,
    email,
    type,
    message,
    product: product ? { id: product.id, name: product.name } : null,
    timestamp: serverTimestamp(),
  });
};



const requestAssistance = async (uid: string, email: string, issue: string) => {
    if (!uid) return;
    try {
      await addDoc(collection(db, "assistance_requests"), {
        userId: uid,
        email,
        issue,
        timestamp: serverTimestamp(),
        status: "Pending",
      });
      console.log("Assistance request logged successfully!");
    } catch (error) {
      console.error("Error logging assistance request:", error);
    }
    
  };
  


// 📌 Store Search History
const storeSearchHistory = async (uid: string, email: string, searchQuery: string) => {
  await addDoc(collection(db, "search_history"), {
    userId: uid,
    email,
    query: searchQuery,
    timestamp: serverTimestamp(),
  });
  
};

// 📌 Log Wishlist Actions
export const logWishlistAction = async (
    uid: string,
    email: string,
    action: "Added to Wishlist" | "Removed from Wishlist",
    product?: any
  ) => {
    await addDoc(collection(db, "wishlist_actions"), {
      userId: uid,
      email,
      action,
      product: product || null,
      timestamp: serverTimestamp(),
    });
  };
// 📌 Track Missed Actions (Abandoned Cart etc.)
const trackMissedActions = async (uid:string,email:string,action:string,details?:string)=>{
await addDoc(collection(db,"missed_actions"),{
userId:uid,email,action,details,timestamp:serverTimestamp()
});
};



// 🔥 Export Everything
export {
auth,db,googleProvider,saveUserRole,getUserRole,signInWithPopup,
createUserWithEmailAndPassword,signInWithEmailAndPassword,
logCustomerActivity,submitCustomerFeedback,requestAssistance,
trackMissedActions,storeSearchHistory
};
