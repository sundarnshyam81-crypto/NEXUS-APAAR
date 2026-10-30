'use client';

import React from 'react';

export interface AicteColumn {
  key: string;
  label: string;
  className?: string;
}

export default function AicteTable({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No records found.',
}: {
  columns: AicteColumn[];
  rows: Array<Record<string, React.ReactNode>>;
  rowKey: string;
  emptyMessage?: string;
}) {
  return (
    <div className="stitch-card overflow-x-auto">
      <table className="data-table min-w-[720px]">
        <thead>
          <tr>{columns.map((column) => <th key={column.key} className={column.className}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length ? rows.map((row, index) => (
            <tr key={String(row[rowKey] ?? index)}>
              {columns.map((column) => <td key={column.key} className={column.className}>{row[column.key] ?? '—'}</td>)}
            </tr>
          )) : (
            <tr><td colSpan={columns.length} className="py-8 text-center text-muted">{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
