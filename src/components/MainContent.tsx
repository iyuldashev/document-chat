import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  ChevronRight,
  Paperclip,
  Globe,
  Mic,
  Sparkles,
  MessageSquare,
  FileUp,
  PenLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { DocumentUpload } from "./DocumentUpload";

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

interface MainContentProps {
  user: SupabaseUser | null;
  currentSessionId: string | null;
  setCurrentSessionId: (id: string | null) => void;
  documentName: string | null;
  setDocumentName: (name: string | null) => void;
  onShowLogin: () => void;
  hasPromptedLogin: boolean;
  setHasPromptedLogin: (value: boolean) => void;
}

const quickActions = [
  { icon: Sparkles, label: "Summarize document" },
  { icon: MessageSquare, label: "Ask questions" },
  { icon: FileUp, label: "Extract key points" },
  { icon: PenLine, label: "Generate notes" },
];

export function MainContent({
  user,
  currentSessionId,
  setCurrentSessionId,
  documentName,
  setDocumentName,
  onShowLogin,
  hasPromptedLogin,
  setHasPromptedLogin,
}: MainContentProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingContent, setTypingContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessed, setIsProcessed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, typingContent]);

  useEffect(() => {
    if (isProcessed && documentName) {
      setMessages([{
        id: "1",
        role: "assistant",
        content: `I've analyzed "${documentName}". Feel free to ask me anything about its contents!`,
      }]);
    }
  }, [isProcessed, documentName]);

  const createSession = async () => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title: documentName || "New Chat",
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  };

  const saveMessage = async (sessionId: string, role: string, content: string) => {
    try {
      await supabase.from("messages").insert({
        session_id: sessionId,
        role,
        content,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setIsProcessed(false);
  };

  const handleUploadSuccess = () => {
    setIsProcessed(true);
    setDocumentName(selectedFile?.name || "Document");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const handleQuickAction = (action: string) => {
    if (!isProcessed) {
      toast({
        title: "Upload a document first",
        description: "Please upload a document to use this feature.",
      });
      return;
    }
    setInput(action);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!isProcessed) {
      toast({
        title: "Upload a document first",
        description: "Please upload a document before chatting.",
      });
      return;
    }

    const userMessageContent = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessageContent,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Show login modal after first message if not logged in
    if (!user && !hasPromptedLogin && messages.length >= 1) {
      setHasPromptedLogin(true);
      setTimeout(() => {
        onShowLogin();
      }, 500);
    }

    // Save message if logged in
    let sessionId = currentSessionId;
    if (user) {
      if (!sessionId) {
        sessionId = await createSession();
        setCurrentSessionId(sessionId);
      }
      if (sessionId) {
        await saveMessage(sessionId, "user", userMessageContent);
      }
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || "/api";
      
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessageContent }),
      });

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

          // Save AI response if logged in
          if (user && sessionId) {
            saveMessage(sessionId, "assistant", data.answer);
          }
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

  const userName = user?.email?.split('@')[0] || "there";

  // Welcome State (no document uploaded)
  if (!isProcessed) {
    return (
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Gradient Header */}
        <div className="relative h-32 gradient-mesh shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-start px-6 -mt-8 overflow-y-auto">
          {/* Greeting */}
          <div className="text-center mb-8 animate-fade-up">
            <h1 className="text-3xl md:text-4xl font-semibold text-foreground mb-2">
              {getGreeting()}, {userName}
            </h1>
            <p className="text-muted-foreground text-lg">
              How can I help you?
            </p>
          </div>

          {/* Upload Area */}
          <div className="w-full max-w-2xl mb-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <DocumentUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onUploadSuccess={handleUploadSuccess}
            />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickAction(action.label)}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground"
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </button>
            ))}
          </div>

          {/* Recent Chats */}
          {user && (
            <div className="w-full max-w-3xl animate-fade-up" style={{ animationDelay: "300ms" }}>
              <button className="flex items-center gap-2 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors">
                <MessageSquare className="h-4 w-4" />
                Your recent chats
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chat State (document uploaded)
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Gradient Header */}
      <div className="relative h-20 gradient-mesh shrink-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Document Assistant</h3>
            <p className="text-sm text-muted-foreground">Chatting about: {documentName}</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
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
                  ? "gradient-accent"
                  : "bg-card border border-border"
              )}
            >
              {message.role === "user" ? (
                <User className="h-4 w-4 text-primary-foreground" />
              ) : (
                <Bot className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Content Container */}
            <div className={`flex flex-col gap-2 max-w-[80%]`}>
              {/* Text Bubble */}
              <div
                className={cn(
                  "rounded-2xl px-5 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap",
                  message.role === "user"
                    ? "gradient-accent text-primary-foreground"
                    : "bg-card border border-border text-foreground"
                )}
              >
                {message.content}
              </div>

              {/* Sources */}
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
        
        {/* Typing Effect */}
        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border">
              <Bot className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="rounded-2xl bg-card border border-border px-5 py-3 shadow-sm text-sm leading-relaxed whitespace-pre-wrap">
              {typingContent}
              <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5" />
            </div>
          </div>
        )}
        
        {/* Loading */}
        {isLoading && !isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card border border-border">
              <Bot className="h-4 w-4 text-muted-foreground" />
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
      <div className="p-4 bg-background border-t border-border">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-center gap-2 p-2 rounded-2xl border border-border bg-card shadow-soft">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask DocChat AI..."
              className="flex-1 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              disabled={isLoading}
            />
            
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <Globe className="h-5 w-5" />
              </button>
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim() || isLoading}
                className="rounded-xl h-10 w-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}