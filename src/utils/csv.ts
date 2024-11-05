// utils/csv.ts
export function convertToCSV(data: any[], headers: string[]): string {
  const csvRows = [];

  // Add headers
  csvRows.push(headers.join(","));

  // Add rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];

      // Handle bigint values
      if (typeof val === "bigint") {
        return val.toString();
      }

      // Escape quotes
      const escaped = ("" + val).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}
