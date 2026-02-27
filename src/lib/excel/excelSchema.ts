// ── Types for parsed Excel workbook (simplified 3-sheet format) ──

export interface ChannelRow {
  group: string;
  channel: string;
  metric: string;
  [period: string]: number | string; // P1..P13
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
  channels: ChannelRow[];
  consumption: ConsumptionRow[];
  period: PeriodRow[];
}

export interface ValidationError {
  sheet: string;
  row?: number;
  message: string;
}

const REQUIRED_SHEETS = ['Channels', 'Consumption', 'Period'] as const;

export function validateWorkbook(wb: Partial<ParsedWorkbook>, availableSheets: string[]): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const s of REQUIRED_SHEETS) {
    if (!availableSheets.includes(s)) {
      errors.push({ sheet: s, message: `Required sheet "${s}" is missing` });
    }
  }

  // Validate Channels sheet
  if (wb.channels) {
    for (let i = 0; i < wb.channels.length; i++) {
      const row = wb.channels[i];
      if (!row.group) {
        errors.push({ sheet: 'Channels', row: i + 2, message: 'Missing Group value' });
      }
      if (!row.channel) {
        errors.push({ sheet: 'Channels', row: i + 2, message: 'Missing Channel value' });
      }
      if (!row.metric) {
        errors.push({ sheet: 'Channels', row: i + 2, message: 'Missing Metric value' });
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
