import React from 'react';
import { Plus, X } from 'lucide-react';

export interface MetadataEntry {
  key: string;
  value: string;
}

interface AssetMetadataEditorProps {
  metadata: MetadataEntry[];
  onChange: (metadata: MetadataEntry[]) => void;
}

export const AssetMetadataEditor: React.FC<AssetMetadataEditorProps> = ({ metadata, onChange }) => {
  const handleAdd = () => {
    onChange([...metadata, { key: '', value: '' }]);
  };

  const handleRemove = (index: number) => {
    const newMetadata = [...metadata];
    newMetadata.splice(index, 1);
    onChange(newMetadata);
  };

  const handleChange = (index: number, field: 'key' | 'value', value: string) => {
    const newMetadata = [...metadata];
    newMetadata[index][field] = value;
    onChange(newMetadata);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Custom Metadata (Optional)
        </label>
        <button
          type="button"
          onClick={handleAdd}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Field
        </button>
      </div>

      {metadata.length === 0 ? (
        <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
          No custom metadata added. Click "Add Field" to include custom attributes.
        </div>
      ) : (
        <div className="space-y-2">
          {metadata.map((entry, index) => (
            <div key={index} className="flex items-start space-x-2">
              <input
                type="text"
                placeholder="Key (e.g. Origin)"
                value={entry.key}
                onChange={(e) => handleChange(index, 'key', e.target.value)}
                className="w-1/3 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <input
                type="text"
                placeholder="Value (e.g. Berlin)"
                value={entry.value}
                onChange={(e) => handleChange(index, 'value', e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors mt-0.5"
                title="Remove Field"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
