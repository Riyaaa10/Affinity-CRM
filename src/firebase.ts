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
  updateDoc 
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDEGiY5Lse1PfKmL9PUxwIHHiwUlquTT_E",
  authDomain: "affinitycrm-95a76.firebaseapp.com",
  projectId: "affinitycrm-95a76",
  storageBucket: "affinitycrm-95a76.firebasestorage.app",
  messagingSenderId: "622048574238",
  appId: "1:622048574238:web:daf5958f1033a5394f670f",
  measurementId: "G-FV7JN8K2FY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// Function to store user role in Firestore
const saveUserRole = async (uid: string, role: "admin" | "customer", email: string) => {
  await setDoc(doc(db, "users", uid), { role, email });
};

// Function to get user role
const getUserRole = async (uid: string): Promise<string | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data().role as string) : null;
};

// 📌 Function to Log Customer Activity (New)
const logCustomerActivity = async (uid: string, email: string, action: string, product?: any) => {
  if (!uid) return;

  const actionData = {
    userId: uid,
    email,
    action,
    product: product ? { id: product.id, name: product.name, price: product.price } : null,
    timestamp: serverTimestamp(),
  };

  // Store action in Firebase Firestore under 'customer_activity'
  await addDoc(collection(db, "customer_activity"), actionData);

  // Update Admin Dashboard with last customer action
  const adminDocRef = doc(db, "admin_dashboard", "leads");
  const adminDocSnap = await getDoc(adminDocRef);

  if (adminDocSnap.exists()) {
    await updateDoc(adminDocRef, {
      lastCustomerAction: action,
      lastUpdated: serverTimestamp(),
    });
  } else {
    await setDoc(adminDocRef, {
      lastCustomerAction: action,
      lastUpdated: serverTimestamp(),
    });
  }
};

export { 
  auth, 
  db, 
  googleProvider, 
  saveUserRole, 
  getUserRole, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  logCustomerActivity // Exporting the new function
};
