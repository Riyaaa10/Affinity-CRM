import { auth, db } from "../firebase/firebaseconfig";
import { collection, doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, expectedRole }: { children: JSX.Element; expectedRole: string }) => {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(collection(db, "users"), user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setRole(userDoc.data().role);
        }
      }
      setLoading(false);
    };

    checkUserRole();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!role) return <Navigate to="/" />; // Redirect if no role found
  if (role !== expectedRole) return <Navigate to="/" />; // Redirect if wrong role

  return children;
};

export default ProtectedRoute;