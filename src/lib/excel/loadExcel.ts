import * as XLSX from 'xlsx';
import type { ParsedWorkbook, ChannelRow, ConsumptionRow, PeriodRow, ValidationError } from './excelSchema';
import { validateWorkbook } from './excelSchema';

function parseChannelsSheet(ws: XLSX.WorkSheet): ChannelRow[] {
  const jsonRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
  return jsonRows.map((raw) => {
    const row: ChannelRow = {
      group: String(raw['Group'] ?? '').trim(),
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

  // Parse Channels
  const channelsWs = getSheet('Channels');
  if (channelsWs) {
    parsed.channels = parseChannelsSheet(channelsWs);
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
    channels: parsed.channels ?? [],
    consumption: parsed.consumption ?? [],
    period: parsed.period ?? [],
  };

  return { workbook, errors };
}
