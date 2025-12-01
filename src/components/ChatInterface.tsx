import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, FileText, ChevronDown, ChevronRight } from "lucide-react"; // Added Chevron icons
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Source {
  score: number;
  text: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface ChatInterfaceProps {
  documentName: string;
}

export function ChatInterface({ documentName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `I've analyzed "${documentName}". Feel free to ask me anything about its contents!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingContent, setTypingContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, typingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessageContent = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessageContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // --- FIX START ---
      // 1. Determine the URL (Local vs Cloud)
      const API_BASE = import.meta.env.VITE_API_URL || "/api";
      
      // 2. Use the dynamic URL
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessageContent }),
      });
      // --- FIX END ---

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();

      // Typing effect
      setIsTyping(true);
      setTypingContent("");
      const fullText = data.answer;
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setTypingContent(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setIsTyping(false);
          
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.answer,
            sources: data.sources, 
          };
          
          setMessages((prev) => [...prev, aiMessage]);
          setTypingContent("");
        }
      }, 20);
      
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Connection Error",
        description: "Could not connect to the RAG engine.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[600px] flex-col rounded-2xl border border-border bg-card shadow-soft animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border p-4 bg-muted/30">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Document Assistant</h3>
          <p className="text-sm text-muted-foreground">Chatting about: {documentName}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 animate-fade-in",
              message.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-background border border-border text-muted-foreground"
              )}
            >
              {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            {/* Content Container */}
            <div className={`flex flex-col gap-2 max-w-[85%]`}>
              
              {/* Text Bubble */}
              <div
                className={cn(
                  "rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-background border border-border text-foreground"
                )}
              >
                {message.content}
              </div>

              {/* SOURCES: Collapsible & Clean */}
              {message.sources && message.sources.length > 0 && (
                <div className="animate-fade-in ml-1">
                  <details className="group">
                    <summary className="list-none flex items-center gap-2 text-xs font-medium text-muted-foreground/70 hover:text-primary cursor-pointer transition-colors w-fit select-none">
                      <div className="flex items-center justify-center w-4 h-4 rounded bg-muted">
                        <ChevronRight className="h-3 w-3 transition-transform group-open:rotate-90" />
                      </div>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        View {message.sources.length} Sources
                      </span>
                    </summary>
                    
                    <div className="mt-2 space-y-2 pl-1">
                      {message.sources.map((source, idx) => (
                        <div 
                          key={idx} 
                          className="bg-muted/40 border border-border/50 rounded-lg p-3 text-xs text-muted-foreground leading-relaxed hover:bg-muted/60 transition-colors"
                        >
                          {/* We removed the Score display here */}
                          <span className="font-semibold text-primary/80 mr-1">[{idx + 1}]</span>
                          "{source.text}"
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Effect Bubble */}
        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border text-muted-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-background border border-border px-5 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap">
              {typingContent}
              <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5" />
            </div>
          </div>
        )}
        
        {/* Loading Bubble */}
        {isLoading && !isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border text-muted-foreground">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl bg-muted/50 px-4 py-3 flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0.2s]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the document..."
            className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="lg" 
            disabled={!input.trim() || isLoading}
            className="rounded-xl shadow-sm px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}