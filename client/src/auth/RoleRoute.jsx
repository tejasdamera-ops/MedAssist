import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function RoleRoute({ allowed }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to="/403" replace />;
  return <Outlet />;
}
