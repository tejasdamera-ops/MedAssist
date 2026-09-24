export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <section className="w-full max-w-lg rounded-md bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-clinic-line px-4 py-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="rounded-md px-2 py-1 hover:bg-slate-100" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </section>
    </div>
  );
}
