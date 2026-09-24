export function FileUpload({ onChange }) {
  return (
    <label className="block rounded-md border border-dashed border-clinic-line bg-white p-4 text-sm">
      <span className="font-medium">Upload clinical document</span>
      <input className="mt-3 block w-full" type="file" accept="image/png,image/jpeg,application/pdf" onChange={onChange} />
    </label>
  );
}
