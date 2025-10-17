import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated } = useUserContext();
  const location = useLocation();

  // ✅ Allow reset password pages even if user is not logged in
  const allowedRoutes = ["/reset-password", "/reset-password-confirm"];
  const isAllowedRoute = allowedRoutes.some((path) =>
    location.pathname.startsWith(path)
  );

  if (isAuthenticated && !isAllowedRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="flex flex-1 justify-center items-center flex-col py-10">
      <Outlet />
    </section>
  );
}
