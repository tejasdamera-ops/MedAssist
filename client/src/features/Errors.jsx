import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const roleHome = {
  admin: "/admin",
  doctor: "/doctor",
  receptionist: "/receptionist",
  labtech: "/labtech",
  patient: "/patient"
};

export function Forbidden() {
  const { user } = useAuth();
  const targetHome = user?.role ? roleHome[user.role] : "/login";

  return (
    <main className="grid min-h-screen place-items-center text-center px-4">
      <div className="max-w-md rounded-lg border border-clinic-line bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-rose-600">403</h1>
        <h2 className="mt-2 text-xl font-semibold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm text-slate-600">
          You do not have permission to access this area with your current account role ({user?.role || "guest"}).
        </p>
        <div className="mt-6">
          <Link
            to={targetHome}
            className="inline-block rounded-md bg-clinic-teal px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
          >
            Go to My Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center text-center px-4">
      <div className="max-w-md rounded-lg border border-clinic-line bg-white p-8 shadow-sm">
        <h1 className="text-4xl font-bold text-clinic-teal">404</h1>
        <h2 className="mt-2 text-xl font-semibold text-slate-800">Page Not Found</h2>
        <p className="mt-2 text-sm text-slate-600">The page you are looking for does not exist or has been moved.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-block rounded-md bg-clinic-teal px-5 py-2.5 text-sm font-medium text-white shadow hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
