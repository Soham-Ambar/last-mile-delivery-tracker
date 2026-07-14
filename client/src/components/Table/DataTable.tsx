interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  renderActions?: (row: T) => React.ReactNode;
}

export default function DataTable<T>({ columns, data, renderActions }: DataTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-sm">
      <table className="min-w-full divide-y divide-slate-800 text-left text-sm text-slate-200">
        <thead className="bg-slate-900">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className="px-4 py-3 font-medium uppercase tracking-[0.18em] text-slate-400">
                {column.header}
              </th>
            ))}
            {renderActions && <th className="px-4 py-3 font-medium uppercase tracking-[0.18em] text-slate-400">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-slate-950 even:bg-slate-900">
              {columns.map((column, columnIndex) => (
                <td key={columnIndex} className="px-4 py-4 align-top text-slate-200">
                  {typeof column.accessor === 'function' ? column.accessor(row) : (row[column.accessor] as React.ReactNode)}
                </td>
              ))}
              {renderActions && <td className="px-4 py-4 align-top">{renderActions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
