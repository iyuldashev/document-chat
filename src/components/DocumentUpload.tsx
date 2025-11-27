import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function DocumentUpload({ onFileSelect, selectedFile }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.type.includes("document"))) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const removeFile = useCallback(() => {
    onFileSelect(null);
  }, [onFileSelect]);

  if (selectedFile) {
    return (
      <div className="w-full animate-fade-in">
        <div className="glass rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-up">
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all duration-300",
          isDragging
            ? "border-primary bg-primary/5 shadow-glow"
            : "border-border bg-card hover:border-primary/50 hover:bg-accent/30"
        )}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <div className={cn(
          "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300",
          isDragging ? "bg-primary/20 scale-110" : "bg-muted group-hover:bg-primary/10"
        )}>
          <Upload className={cn(
            "h-8 w-8 transition-colors duration-300",
            isDragging ? "text-primary" : "text-muted-foreground group-hover:text-primary"
          )} />
        </div>
        
        <p className="mb-2 text-lg font-medium text-foreground">
          {isDragging ? "Drop your document here" : "Upload your document"}
        </p>
        <p className="text-sm text-muted-foreground">
          Drag & drop or click to browse
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Supports PDF, DOC, DOCX, TXT
        </p>
      </label>
    </div>
  );
}
