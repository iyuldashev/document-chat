import { useState, useRef } from "react";
import { FileText, Zap, Shield, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentUpload } from "@/components/DocumentUpload";
import {ChatInterface} from "@/components/ChatInterface";
import { FeatureCard } from "@/components/FeatureCard";

const features = [
  {
    icon: Zap,
    title: "Instant Analysis",
    description: "Upload any document and get instant AI-powered insights and summaries.",
  },
  {
    icon: MessageSquare,
    title: "Natural Conversations",
    description: "Ask questions in plain English and get accurate, contextual answers.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your documents are processed securely and never stored permanently.",
  },
];

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const handleGetStarted = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setIsProcessed(false);
  };

  const handleUploadSuccess = () => {
    console.log("Upload Success! Switching to Chat..."); // Debug log
    setIsProcessed(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
        
        <div className="container relative mx-auto px-4 py-12 lg:py-20">
          <nav className="mb-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">DocChat</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Demo Version - Free to Use
            </div>
          </nav>

          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-accent/50 px-4 py-2 text-sm text-accent-foreground animate-fade-up">
              <Zap className="h-4 w-4 text-primary" />
              Powered by Advanced RAG Technology
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-up" style={{ animationDelay: "100ms" }}>
              Chat with your{" "}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                documents
              </span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground animate-fade-up" style={{ animationDelay: "200ms" }}>
              Upload any document and start a conversation. Get instant answers, summaries, and insights powered by state-of-the-art AI.
            </p>

            {!selectedFile && (
              <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "300ms" }}>
                <Button variant="hero" size="xl" onClick={handleGetStarted}>
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl" ref={uploadSectionRef}>
          {/* THE SWITCH LOGIC */}
          {isProcessed ? (
            <ChatInterface documentName={selectedFile?.name || "Document"} />
          ) : (
            <DocumentUpload 
                onFileSelect={handleFileSelect} 
                selectedFile={selectedFile}
                onUploadSuccess={handleUploadSuccess} 
            />
          )}
        </div>

        {!selectedFile && (
          <section className="mt-24">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground animate-fade-up">
                Why choose DocChat?
              </h2>
              <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
                {features.map((feature, index) => (
                  <FeatureCard
                    key={feature.title}
                    {...feature}
                    delay={index * 100 + 200}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm font-medium text-foreground">
              © 2025 Fergani Labs
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <a href="mailto:yuldashev.dev@gmail.com" className="hover:text-primary transition-colors">
                yuldashev.dev@gmail.com
              </a>
              <a href="https://linkedin.com/in/iyuldashev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                LinkedIn
              </a>
              <a href="https://github.com/iyuldashev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Github
              </a>
              <a href="https://t.me/yuldashev_dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Telegram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;