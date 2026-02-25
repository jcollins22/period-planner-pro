// ── Types for parsed Excel workbook ──

export interface QuarterRow {
  channel: string;
  [metricKey: string]: number | string; // e.g. "Planned Spend__Q", "Planned Spend__QoQ"
}

export interface ConsumptionRow {
  metric: string;
  level1: string;
  level2: string;
  [period: string]: number | string; // P1..P13
}

export interface PeriodRow {
  channel: string;
  metric: string;
  [period: string]: number | string; // P1..P13
}

export interface ParsedWorkbook {
  q1: QuarterRow[];
  q2: QuarterRow[];
  q3: QuarterRow[];
  q4: QuarterRow[];
  consumption: ConsumptionRow[];
  period: PeriodRow[];
}

export interface ValidationError {
  sheet: string;
  row?: number;
  message: string;
}

const REQUIRED_SHEETS = ['Q1', 'Q2', 'Q3', 'Q4', 'Consumption', 'Period'] as const;

export function validateWorkbook(wb: Partial<ParsedWorkbook>, availableSheets: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check all required sheets present
  for (const s of REQUIRED_SHEETS) {
    if (!availableSheets.includes(s)) {
      errors.push({ sheet: s, message: `Required sheet "${s}" is missing` });
    }
  }

  // Validate Q sheets
  for (const qKey of ['q1', 'q2', 'q3', 'q4'] as const) {
    const rows = wb[qKey];
    if (!rows || rows.length === 0) continue;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.channel || typeof row.channel !== 'string') {
        errors.push({ sheet: qKey.toUpperCase(), row: i + 3, message: 'Missing or invalid Channel value' });
      }
    }
  }

  // Validate Consumption sheet
  if (wb.consumption) {
    for (let i = 0; i < wb.consumption.length; i++) {
      const row = wb.consumption[i];
      if (!row.metric) {
        errors.push({ sheet: 'Consumption', row: i + 2, message: 'Missing Metric value' });
      }
    }
  }

  // Validate Period sheet
  if (wb.period) {
    for (let i = 0; i < wb.period.length; i++) {
      const row = wb.period[i];
      if (!row.channel) {
        errors.push({ sheet: 'Period', row: i + 2, message: 'Missing Channel value' });
      }
      if (!row.metric) {
        errors.push({ sheet: 'Period', row: i + 2, message: 'Missing Metric value' });
      }
    }
  }

  return errors;
}
