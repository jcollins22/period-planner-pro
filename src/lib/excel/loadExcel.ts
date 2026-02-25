import * as XLSX from 'xlsx';
import type { ParsedWorkbook, QuarterRow, ConsumptionRow, PeriodRow, ValidationError } from './excelSchema';
import { validateWorkbook } from './excelSchema';

function parseQuarterSheet(ws: XLSX.WorkSheet): QuarterRow[] {
  const aoa: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (aoa.length < 3) return [];

  const metricRow = aoa[0];
  const subRow = aoa[1];

  // Fill-forward metric names
  const filledMetrics: string[] = [];
  let lastMetric = '';
  for (let c = 0; c < metricRow.length; c++) {
    const v = String(metricRow[c] ?? '').trim();
    if (v) lastMetric = v;
    filledMetrics[c] = lastMetric;
  }

  // Build column keys from metric + sub-header
  const colKeys: string[] = [];
  for (let c = 0; c < filledMetrics.length; c++) {
    const sub = String(subRow[c] ?? '').trim();
    if (c === 0) {
      colKeys[c] = 'channel';
    } else {
      colKeys[c] = `${filledMetrics[c]}__${sub || 'Q'}`;
    }
  }

  // Parse data rows
  const rows: QuarterRow[] = [];
  for (let r = 2; r < aoa.length; r++) {
    const raw = aoa[r];
    if (!raw || !raw[0]) continue; // skip empty rows
    const row: QuarterRow = { channel: String(raw[0]).trim() };
    for (let c = 1; c < colKeys.length; c++) {
      const val = raw[c];
      row[colKeys[c]] = typeof val === 'number' ? val : (val === '' || val == null ? 0 : Number(val) || String(val));
    }
    rows.push(row);
  }
  return rows;
}

function parseConsumptionSheet(ws: XLSX.WorkSheet): ConsumptionRow[] {
  const jsonRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return jsonRows.map((raw) => {
    const row: ConsumptionRow = {
      metric: String(raw['Metric'] ?? '').trim(),
      level1: String(raw['Level 1'] ?? '').trim(),
      level2: String(raw['Level 2'] ?? '').trim(),
    };
    for (let i = 1; i <= 13; i++) {
      const key = `P${i}`;
      const val = raw[key];
      row[key] = typeof val === 'number' ? val : (Number(val) || 0);
    }
    return row;
  });
}

function parsePeriodSheet(ws: XLSX.WorkSheet): PeriodRow[] {
  const jsonRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return jsonRows.map((raw) => {
    const row: PeriodRow = {
      channel: String(raw['Channel'] ?? '').trim(),
      metric: String(raw['Metric'] ?? '').trim(),
    };
    for (let i = 1; i <= 13; i++) {
      const key = `P${i}`;
      const val = raw[key];
      row[key] = typeof val === 'number' ? val : (Number(val) || 0);
    }
    return row;
  });
}

export interface ParseResult {
  workbook: ParsedWorkbook;
  errors: ValidationError[];
}

export async function parseExcelFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const sheetNames = wb.SheetNames;
  const parsed: Partial<ParsedWorkbook> = {};

  const getSheet = (name: string) => wb.Sheets[name];

  // Parse Q sheets
  for (const q of ['Q1', 'Q2', 'Q3', 'Q4'] as const) {
    const ws = getSheet(q);
    if (ws) {
      parsed[q.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4'] = parseQuarterSheet(ws);
    }
  }

  // Parse Consumption
  const consumptionWs = getSheet('Consumption');
  if (consumptionWs) {
    parsed.consumption = parseConsumptionSheet(consumptionWs);
  }

  // Parse Period
  const periodWs = getSheet('Period');
  if (periodWs) {
    parsed.period = parsePeriodSheet(periodWs);
  }

  const errors = validateWorkbook(parsed, sheetNames);

  const workbook: ParsedWorkbook = {
    q1: parsed.q1 ?? [],
    q2: parsed.q2 ?? [],
    q3: parsed.q3 ?? [],
    q4: parsed.q4 ?? [],
    consumption: parsed.consumption ?? [],
    period: parsed.period ?? [],
  };

  return { workbook, errors };
}
