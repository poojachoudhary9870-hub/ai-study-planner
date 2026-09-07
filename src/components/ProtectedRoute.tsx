import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
// import { onAuthStateChanged, User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // onAuthStateChanged fires once Firebase has resolved the
    // current session (from its own persisted storage), and again
    // any time login/logout happens. This avoids the race condition
    // of checking auth state before Firebase has finished loading it.
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    // Avoid a flash-redirect to /login while Firebase is still
    // figuring out if there's an existing session.
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
