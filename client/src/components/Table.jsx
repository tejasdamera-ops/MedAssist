export function Table({ columns, rows, empty = "No records found" }) {
  return (
    <div className="overflow-hidden rounded-md border border-clinic-line bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-medium">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center text-slate-500" colSpan={columns.length}>
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row._id || row.id} className="border-t border-clinic-line">
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
