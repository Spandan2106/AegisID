import React from 'react';
import { FileText, Image as ImageIcon, File } from 'lucide-react';

interface FilePreviewProps {
  fileName: string;
  fileFormat: string;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ fileName, fileFormat, className = "" }) => {
  const format = fileFormat?.toUpperCase() || '';
  const nameParts = fileName?.split('.') || [];
  const ext = nameParts.length > 1 ? nameParts[nameParts.length - 1].toUpperCase() : '';
  const detectedFormat = format || ext;

  const isImage = ['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'].includes(detectedFormat);
  const isPdf = ['PDF'].includes(detectedFormat);

  if (isImage) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden ${className}`}>
        <ImageIcon className="w-10 h-10 text-slate-400" />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className={`flex flex-col items-center justify-center bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl ${className}`}>
        <FileText className="w-8 h-8 text-red-500 mb-2" />
        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">PDF Document</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl ${className}`}>
      <File className="w-8 h-8 text-slate-400 mb-2" />
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{detectedFormat || 'Unknown'} File</span>
    </div>
  );
};
