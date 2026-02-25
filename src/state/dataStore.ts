import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ParsedWorkbook, ValidationError } from '@/lib/excel/excelSchema';
import { parseExcelFile } from '@/lib/excel/loadExcel';

export type DataStatus = 'empty' | 'loading' | 'loaded' | 'error';

interface DataState {
  workbook: ParsedWorkbook | null;
  status: DataStatus;
  errors: ValidationError[];
  fileName: string | null;
}

interface DataContextValue extends DataState {
  loadFile: (file: File) => Promise<void>;
  clear: () => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DataState>({
    workbook: null,
    status: 'empty',
    errors: [],
    fileName: null,
  });

  const loadFile = useCallback(async (file: File) => {
    setState((s) => ({ ...s, status: 'loading', errors: [], fileName: file.name }));
    try {
      const result = await parseExcelFile(file);
      if (result.errors.length > 0) {
        setState({
          workbook: result.workbook,
          status: 'error',
          errors: result.errors,
          fileName: file.name,
        });
      } else {
        setState({
          workbook: result.workbook,
          status: 'loaded',
          errors: [],
          fileName: file.name,
        });
      }
    } catch (err) {
      setState({
        workbook: null,
        status: 'error',
        errors: [{ sheet: 'General', message: err instanceof Error ? err.message : 'Failed to parse file' }],
        fileName: file.name,
      });
    }
  }, []);

  const clear = useCallback(() => {
    setState({ workbook: null, status: 'empty', errors: [], fileName: null });
  }, []);

  const value: DataContextValue = {
    ...state,
    loadFile,
    clear,
  };

  return React.createElement(DataContext.Provider, { value }, children);
}

export function useDataStore(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataStore must be used within DataProvider');
  return ctx;
}
