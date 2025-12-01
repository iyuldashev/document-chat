import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast"; 
import { Button } from "@/components/ui/button"; 

interface DocumentUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  onUploadSuccess?: () => void;
}

export function DocumentUpload({ onFileSelect, selectedFile, onUploadSuccess }: DocumentUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a PDF file.",
      });
    }
  }, [onFileSelect, toast]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const removeFile = useCallback(() => {
    if (!isUploading) {
      onFileSelect(null);
    }
  }, [onFileSelect, isUploading]);

  // --- THE FIXED UPLOAD LOGIC ---
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // 1. Get the dynamic URL (Cloud vs Local)
      const API_BASE = import.meta.env.VITE_API_URL || "/api";
      
      // 2. Use the dynamic URL
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      toast({
        title: "Processing Started",
        description: "Your document is being ingested.",
      });

      if (onUploadSuccess) {
          onUploadSuccess(); 
      }
      
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Failed to send document to the engine.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // --- RENDER: File Selected State ---
  if (selectedFile) {
    return (
      <div className="w-full animate-fade-in space-y-4">
        <div className="glass rounded-2xl p-6 shadow-soft border border-primary/10">
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
              disabled={isUploading}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-end">
            <Button 
                onClick={handleUpload} 
                disabled={isUploading}
                className="w-full sm:w-auto"
            >
                {isUploading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Ingesting Document...
                    </>
                ) : (
                    <>
                        <Upload className="mr-2 h-4 w-4" />
                        Process Document
                    </>
                )}
            </Button>
        </div>
      </div>
    );
  }

  // --- RENDER: Empty State ---
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
          accept=".pdf" 
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
          {isDragging ? "Drop your PDF here" : "Upload your PDF"}
        </p>
        <p className="text-sm text-muted-foreground">
          Drag & drop or click to browse
        </p>
      </label>
    </div>
  );
}