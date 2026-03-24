import { app, db } from "./firebase";
import { getAuth, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export type UserRole = "admin" | "submanager" | null;

const auth = getAuth(app);

export const getUserRole = async (user: User): Promise<UserRole> => {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return userDoc.data().role as UserRole;
    }
  } catch (error: unknown) {
    console.error("Error fetching user role:", error);
  }
  return null;
};

export const checkIsAdmin = async (user: User): Promise<boolean> => {
  const role = await getUserRole(user);
  return role === "admin";
};

export { auth };
