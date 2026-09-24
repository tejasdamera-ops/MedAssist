import { Activity, CalendarDays, ClipboardList, CreditCard, FlaskConical, LogOut, Shield } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const roleHome = {
  admin: "/admin",
  doctor: "/doctor",
  receptionist: "/receptionist",
  labtech: "/labtech",
  patient: "/patient"
};

const roleLinks = {
  admin: [
    ["Users", "/admin", Shield],
    ["Reports", "/admin/reports", Activity]
  ],
  doctor: [
    ["Appointments", "/doctor", CalendarDays],
    ["Patient Chart", "/doctor/chart", ClipboardList]
  ],
  receptionist: [
    ["Queue", "/receptionist", CalendarDays],
    ["Billing", "/receptionist/billing", CreditCard]
  ],
  labtech: [
    ["Order Queue", "/labtech", FlaskConical],
    ["Verification", "/labtech/verification", ClipboardList]
  ],
  patient: [
    ["My Records", "/patient", ClipboardList],
    ["Invoices", "/patient/invoices", CreditCard]
  ]
};

export function Layout() {
  const { user, logout } = useAuth();
  const links = roleLinks[user?.role] || [];

  return (
    <div className="min-h-screen">
      <header className="border-b border-clinic-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to={roleHome[user.role]} className="text-xl font-semibold text-clinic-teal">
            MedAssist
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span>{user.name}</span>
            <button className="rounded-md border border-clinic-line p-2 hover:bg-slate-50" onClick={logout} aria-label="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {links.map(([label, to, Icon]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? "bg-clinic-mint text-clinic-teal" : "hover:bg-white"}`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
