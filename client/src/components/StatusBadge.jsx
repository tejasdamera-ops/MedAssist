const colors = {
  confirmed: "bg-emerald-100 text-emerald-700",
  requested: "bg-amber-100 text-amber-700",
  "checked-in": "bg-sky-100 text-sky-700",
  "in-progress": "bg-indigo-100 text-indigo-700",
  completed: "bg-slate-200 text-slate-700",
  cancelled: "bg-rose-100 text-rose-700",
  paid: "bg-emerald-100 text-emerald-700",
  unpaid: "bg-rose-100 text-rose-700",
  partial: "bg-amber-100 text-amber-700",
  released: "bg-emerald-100 text-emerald-700",
  verified: "bg-sky-100 text-sky-700"
};

export function StatusBadge({ status }) {
  return <span className={`rounded px-2 py-1 text-xs font-medium ${colors[status] || "bg-slate-100 text-slate-700"}`}>{status}</span>;
}
