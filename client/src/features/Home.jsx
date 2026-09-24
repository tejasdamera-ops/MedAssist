import { ArrowRight, CalendarCheck, FileText, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-clinic-line">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-semibold text-clinic-teal">
            MedAssist
          </Link>
          <nav className="flex items-center gap-2">
            <Link className="rounded-md px-4 py-2 text-sm font-medium hover:bg-slate-100" to="/login">
              Login
            </Link>
            <Link className="rounded-md bg-clinic-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-800" to="/register">
              Register
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-clinic-teal">Clinic Operations & Patient Care Portal</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-clinic-ink sm:text-5xl">
            Manage appointments, clinical care, lab work, billing, and patient records in one secure portal.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            MedAssist gives clinic admins, doctors, receptionists, lab technicians, and patients role-specific tools with secure access control and audit-ready workflows.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="inline-flex items-center justify-center gap-2 rounded-md bg-clinic-teal px-5 py-3 font-medium text-white hover:bg-teal-800" to="/login">
              Login
              <ArrowRight size={18} />
            </Link>
            <Link className="inline-flex items-center justify-center rounded-md border border-clinic-line px-5 py-3 font-medium hover:bg-slate-50" to="/register">
              Create Registration
            </Link>
          </div>
        </div>

        <div className="rounded-md border border-clinic-line bg-slate-50 p-4">
          <div className="rounded-md bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-clinic-line pb-3">
              <div>
                <p className="text-sm text-slate-500">Today</p>
                <h2 className="font-semibold">Clinic Dashboard</h2>
              </div>
              <span className="rounded bg-clinic-mint px-2 py-1 text-xs font-medium text-clinic-teal">Secure</span>
            </div>
            <div className="mt-4 grid gap-3">
              {[
                ["Appointments", "24 scheduled", CalendarCheck],
                ["Clinical Records", "Doctor-reviewed notes", FileText],
                ["Audit Logs", "Every mutation recorded", ShieldCheck]
              ].map(([title, detail, Icon]) => (
                <div key={title} className="flex items-center gap-3 rounded-md border border-clinic-line p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-clinic-mint text-clinic-teal">
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-slate-500">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
