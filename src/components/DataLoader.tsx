import { useRef, useState } from 'react';
import { Upload, Check, AlertCircle, X, Loader2, ChevronDown, ChevronRight, Download } from 'lucide-react';
import { useDataStore } from '@/state/dataStore';
import { downloadTemplate } from '@/lib/excel/templateDownload';

export default function DataLoader() {
  const { status, errors, fileName, loadFile, clear } = useDataStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showErrors, setShowErrors] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await loadFile(file);
    }
    // Reset input so re-uploading the same file works
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFileChange}
      />

      {status === 'empty' && (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded bg-secondary text-secondary-foreground hover:bg-accent transition-colors border border-border"
          >
            <Upload className="w-3.5 h-3.5" />
            Load Data (.xlsx)
          </button>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded bg-secondary text-secondary-foreground hover:bg-accent transition-colors border border-border"
          >
            <Download className="w-3.5 h-3.5" />
            Download Template
          </button>
        </>
      )}

      {status === 'loading' && (
        <span className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Loading…
        </span>
      )}

      {status === 'loaded' && (
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[12px] text-emerald-600 font-medium">
            <Check className="w-3.5 h-3.5" />
            {fileName}
          </span>
          <button
            onClick={() => inputRef.current?.click()}
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Replace
          </button>
          <button
            onClick={clear}
            className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="w-3 h-3" />
            Clear
          </button>
        </div>
      )}

      {status === 'error' && (
        <div className="inline-flex flex-col">
          <div className="inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[12px] text-destructive font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              {fileName} — {errors.length} error{errors.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setShowErrors(!showErrors)}
              className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {showErrors ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Details
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Retry
            </button>
            <button
              onClick={clear}
              className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>
          {showErrors && (
            <div className="mt-1 text-[11px] text-destructive/80 space-y-0.5 max-h-24 overflow-y-auto">
              {errors.map((err, i) => (
                <div key={i}>
                  [{err.sheet}]{err.row ? ` Row ${err.row}` : ''}: {err.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
