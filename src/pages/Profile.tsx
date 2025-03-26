import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState<string>("");
  const [photo, setPhoto] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser(userData);
          setName(userData.name);
          setPhoto(userData.photoURL);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Update user profile
  const updateProfile = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        name: name,
        photoURL: photo,
      });
      setUser({ ...user, name, photoURL: photo });
    }
  };

  if (loading) return <h2>Loading Profile...</h2>;

  return (
    <div className="profile-container">
      <h1>👤 Profile</h1>
      <img src={user?.photoURL || "https://via.placeholder.com/150"} alt="Profile" className="profile-pic" />
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <input type="text" placeholder="Paste Image URL" value={photo} onChange={(e) => setPhoto(e.target.value)} />
      <button onClick={updateProfile}>Update Profile</button>
    </div>
  );
};

export default Profile;
