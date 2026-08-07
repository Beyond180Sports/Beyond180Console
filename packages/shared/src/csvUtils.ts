export type PlayerData = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  emergencyEmail?: string;
  emergencyPhone?: string;
  number?: number;
  heightCm?: number;
  weightKg?: number;
  birthYear?: number;
};

/**
 * Validates CSV headers and rows to ensure required columns are present and data is valid.
 */
export function validateCSV(headers: string[], rows: string[][]): void {
  const requiredColumns = ['firstname', 'lastname', 'email'];
  const normalizedHeaders = headers.map((h) => h.toLowerCase());

  const missingColumns = requiredColumns.filter(
    (col) => !normalizedHeaders.includes(col),
  );

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  const missingData: string[] = [];
  rows.forEach((row, index) => {
    const rowNum = index + 2;
    const rowObj: Record<string, string> = {};
    headers.forEach((header, i) => {
      if (i < row.length) {
        rowObj[header.toLowerCase()] = row[i] || '';
      }
    });

    requiredColumns.forEach((col) => {
      if (!rowObj[col]?.trim()) {
        missingData.push(`Row ${rowNum}: Missing ${col}`);
      }
    });

    if (rowObj.email && !/\S+@\S+\.\S+/.test(rowObj.email)) {
      missingData.push(`Row ${rowNum}: Invalid email format`);
    }
  });

  if (missingData.length > 0) {
    throw new Error(`Data validation errors:\n${missingData.join('\n')}`);
  }
}

/**
 * Parses a CSV string into an array of player data objects.
 */
export function parseCSV(content: string): PlayerData[] {
  content = content.trim();

  let lines = content.split('\n').map((line) => {
    const cells: string[] = [];
    let inQuote = false;
    let currentCell = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuote = !inQuote;
      } else if (char === ',' && !inQuote) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }

    cells.push(currentCell.trim());
    return cells;
  });

  lines = lines.filter((row) => row.some((cell) => cell.trim() !== ''));

  if (lines.length <= 1) {
    throw new Error('CSV file has no data rows');
  }

  let headers = lines[0].map((h) => h.trim().replace(/^["']|["']$/g, ''));
  let rows = lines.slice(1);

  const emptyColumnIndexes: number[] = [];
  for (let i = 0; i < headers.length; i++) {
    const isEmptyColumn =
      !headers[i].trim() &&
      rows.every((row) => i >= row.length || !row[i] || !row[i].trim());
    if (isEmptyColumn) {
      emptyColumnIndexes.push(i);
    }
  }

  for (let i = emptyColumnIndexes.length - 1; i >= 0; i--) {
    const colIndex = emptyColumnIndexes[i];
    headers.splice(colIndex, 1);
    rows.forEach((row) => {
      if (colIndex < row.length) {
        row.splice(colIndex, 1);
      }
    });
  }

  const maxCols = Math.max(headers.length, ...rows.map((r) => r.length));
  headers = headers.concat(Array(maxCols - headers.length).fill(''));
  rows = rows.map((row) => row.concat(Array(maxCols - row.length).fill('')));

  validateCSV(headers, rows);

  return rows.map((row) => {
    const player: PlayerData = {
      firstName: '',
      lastName: '',
      email: '',
    };

    headers.forEach((header, index) => {
      if (index >= row.length) return;

      const value = row[index] ? row[index].trim() : '';
      if (!value) return;

      const normalizedHeader = header.toLowerCase();

      switch (normalizedHeader) {
        case 'firstname':
          player.firstName = value;
          break;
        case 'lastname':
          player.lastName = value;
          break;
        case 'email':
          player.email = value.toLowerCase();
          break;
        case 'phone':
          player.phone = value;
          break;
        case 'emergencyemail':
          player.emergencyEmail = value.toLowerCase();
          break;
        case 'emergencyphone':
          player.emergencyPhone = value;
          break;
        case 'number':
          player.number = Number(value) || undefined;
          break;
        case 'heightcm':
          player.heightCm = Number(value) || undefined;
          break;
        case 'weightkg':
          player.weightKg = Number(value) || undefined;
          break;
        case 'birthyear':
          player.birthYear = Number(value) || undefined;
          break;
      }
    });

    return player;
  });
}
