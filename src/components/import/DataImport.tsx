import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface DataImportProps {
  type: 'leads' | 'bookings';
  onClose?: () => void;
}

const LEADS_SAMPLE = [
  { name: 'Rahul Sharma', phone: '9876543210', email: 'rahul@example.com', source: 'whatsapp', status: 'new', event_type: 'wedding', tentative_date: '2026-07-15', guest_count: 300, budget_from: 200000, budget_to: 500000, notes: 'Interested in lawn area' },
  { name: 'Priya Patel', phone: '9123456789', email: 'priya@example.com', source: 'google', status: 'contacted', event_type: 'reception', tentative_date: '2026-08-20', guest_count: 150, budget_from: 100000, budget_to: 300000, notes: 'Wants AC hall' },
];

const BOOKINGS_SAMPLE = [
  { customer_name: 'Amit Kumar', customer_phone: '9876543210', customer_email: 'amit@example.com', event_type: 'wedding', event_date: '2026-06-15', start_time: '10:00', end_time: '22:00', guest_count: 400, total_amount: 350000, advance_amount: 100000, status: 'confirmed', special_requirements: 'Veg food only' },
  { customer_name: 'Sneha Reddy', customer_phone: '9123456789', customer_email: 'sneha@example.com', event_type: 'engagement', event_date: '2026-07-01', start_time: '16:00', end_time: '21:00', guest_count: 200, total_amount: 150000, advance_amount: 50000, status: 'hold', special_requirements: 'Stage decoration needed' },
];

export const DataImport: React.FC<DataImportProps> = ({ type, onClose }) => {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null);

  const downloadSample = () => {
    const data = type === 'leads' ? LEADS_SAMPLE : BOOKINGS_SAMPLE;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type === 'leads' ? 'Leads' : 'Bookings');
    
    // Set column widths
    const maxWidths = Object.keys(data[0]).map(key => 
      Math.max(key.length, ...data.map(row => String((row as any)[key] || '').length))
    );
    ws['!cols'] = maxWidths.map(w => ({ wch: Math.min(w + 2, 30) }));
    
    XLSX.writeFile(wb, `venuepro_${type}_sample.xlsx`);
    toast.success('Sample file downloaded!');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    
    setFile(selected);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        setPreview(json.slice(0, 5));
      } catch {
        toast.error('Could not read file. Please use .xlsx or .csv format.');
        setFile(null);
      }
    };
    reader.readAsArrayBuffer(selected);
  };

  const importData = async () => {
    if (!file || !organization?.id) return;
    
    setImporting(true);
    const errors: string[] = [];
    let successCount = 0;

    try {
      const reader = new FileReader();
      const fileData = await new Promise<ArrayBuffer>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
        reader.readAsArrayBuffer(file);
      });

      const workbook = XLSX.read(new Uint8Array(fileData), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet) as any[];

      if (type === 'leads') {
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row.name || !row.phone) {
            errors.push(`Row ${i + 2}: Missing required field (name or phone)`);
            continue;
          }
          const { error } = await supabase.from('leads').insert({
            org_id: organization.id,
            name: String(row.name).trim(),
            phone: String(row.phone).trim(),
            email: row.email ? String(row.email).trim() : null,
            source: row.source || 'import',
            status: ['new', 'contacted', 'visit_scheduled', 'proposal_sent', 'negotiating', 'won', 'lost'].includes(row.status) ? row.status : 'new',
            event_type: row.event_type || null,
            tentative_date: row.tentative_date || null,
            guest_count: row.guest_count ? Number(row.guest_count) : null,
            budget_from: row.budget_from ? Number(row.budget_from) : null,
            budget_to: row.budget_to ? Number(row.budget_to) : null,
            notes: row.notes || null,
          });
          if (error) {
            errors.push(`Row ${i + 2}: ${error.message}`);
          } else {
            successCount++;
          }
        }
      } else {
        // For bookings, first create or find customers, then create bookings
        // Get the first hall for the org as default
        const { data: halls } = await supabase.from('halls').select('id').eq('org_id', organization.id).limit(1);
        const defaultHallId = halls?.[0]?.id;

        if (!defaultHallId) {
          toast.error('Please create at least one venue and hall before importing bookings.');
          setImporting(false);
          return;
        }

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row.customer_name || !row.customer_phone || !row.event_date) {
            errors.push(`Row ${i + 2}: Missing required field (customer_name, customer_phone, or event_date)`);
            continue;
          }

          // Upsert customer
          let customerId: string;
          const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .eq('org_id', organization.id)
            .eq('phone', String(row.customer_phone).trim())
            .limit(1);

          if (existingCustomer && existingCustomer.length > 0) {
            customerId = existingCustomer[0].id;
          } else {
            const { data: newCustomer, error: custErr } = await supabase
              .from('customers')
              .insert({
                org_id: organization.id,
                name: String(row.customer_name).trim(),
                phone: String(row.customer_phone).trim(),
                email: row.customer_email ? String(row.customer_email).trim() : null,
              })
              .select('id')
              .single();
            
            if (custErr || !newCustomer) {
              errors.push(`Row ${i + 2}: Failed to create customer - ${custErr?.message}`);
              continue;
            }
            customerId = newCustomer.id;
          }

          const validStatuses = ['inquiry', 'hold', 'confirmed', 'in_progress', 'completed', 'cancelled'];
          const { error: bookErr } = await supabase.from('bookings').insert({
            org_id: organization.id,
            hall_id: row.hall_id || defaultHallId,
            customer_id: customerId,
            event_type: row.event_type || 'other',
            event_date: row.event_date,
            start_time: row.start_time || null,
            end_time: row.end_time || null,
            guest_count: row.guest_count ? Number(row.guest_count) : null,
            total_amount: Number(row.total_amount) || 0,
            advance_amount: Number(row.advance_amount) || 0,
            status: validStatuses.includes(row.status) ? row.status : 'confirmed',
            special_requirements: row.special_requirements || null,
            internal_notes: row.internal_notes || `Imported on ${new Date().toLocaleDateString()}`,
          });

          if (bookErr) {
            errors.push(`Row ${i + 2}: ${bookErr.message}`);
          } else {
            successCount++;
          }
        }
      }

      setResult({ success: successCount, errors });
      
      if (successCount > 0) {
        queryClient.invalidateQueries({ queryKey: [type] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        toast.success(`Successfully imported ${successCount} ${type}!`);
      }
    } catch (err: any) {
      toast.error(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-gray-900">
            Import {type === 'leads' ? 'Leads' : 'Bookings'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload an Excel or CSV file to bulk import your existing data.
          </p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Step 1: Download Sample */}
      <div className="card-elevated p-5 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">Step 1: Download Sample Format</p>
            <p className="text-xs text-gray-500">Download and fill in your data following the template columns.</p>
          </div>
        </div>
        <button
          onClick={downloadSample}
          className="btn-primary px-4 py-2 text-xs flex items-center space-x-2"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Sample {type === 'leads' ? 'Leads' : 'Bookings'} Excel</span>
        </button>
      </div>

      {/* Step 2: Upload File */}
      <div className="card-elevated p-5 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-sm text-gray-900">Step 2: Upload Your File</p>
            <p className="text-xs text-gray-500">Select an .xlsx or .csv file with your {type} data.</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-200 hover:border-primary/40 rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-primary/[0.02] group"
        >
          <Upload className="w-8 h-8 mx-auto text-gray-300 group-hover:text-primary/50 transition-colors" />
          <p className="text-sm font-semibold text-gray-600 mt-2">
            {file ? file.name : 'Click to select file'}
          </p>
          <p className="text-[10px] text-gray-400 mt-1">.xlsx, .xls, or .csv • Max 1000 rows</p>
        </div>
      </div>

      {/* Preview */}
      <AnimatePresence>
        {preview.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card-elevated p-4 space-y-3 overflow-hidden"
          >
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preview (first 5 rows)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {Object.keys(preview[0]).map(key => (
                      <th key={key} className="px-2 py-1.5 text-left font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {preview.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-2 py-1.5 text-gray-700 whitespace-nowrap truncate max-w-[150px]">{String(val ?? '')}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Button */}
      {file && !result && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={importData}
          disabled={importing}
          className="btn-primary w-full px-4 py-3 text-sm flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {importing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Importing {type}...</span>
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              <span>Import {preview.length > 0 ? `${preview.length}+ rows` : 'Data'}</span>
            </>
          )}
        </motion.button>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {result.success > 0 && (
              <div className="flex items-center space-x-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm font-bold text-emerald-800">
                  Successfully imported {result.success} {type}.
                </p>
              </div>
            )}
            
            {result.errors.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-sm font-bold text-amber-800">{result.errors.length} rows had issues:</p>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-amber-700 font-mono">{err}</p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setFile(null); setPreview([]); setResult(null); }}
              className="text-xs font-bold text-primary hover:underline"
            >
              Import another file →
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DataImport;
