import { FileText, Bot, User } from "lucide-react";
import { useEffect, useState } from "react";

const messages = [
  { role: "user", text: "What are the key findings in this report?" },
  { role: "bot", text: "Based on the document, there are 3 main findings: 1) Revenue increased by 23% year-over-year..." },
  { role: "user", text: "Summarize section 4.2" },
];

export function DemoPreview() {
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (visibleMessages < messages.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages((prev) => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  return (
    <section className="py-20 px-6 relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-2s" }} />
      
      <div className="mx-auto max-w-5xl relative">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            See it in action
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Watch how DocMind transforms your document experience
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-muted-foreground ml-2">DocMind Chat</span>
          </div>

          <div className="flex min-h-[400px]">
            {/* Document sidebar */}
            <div className="w-64 border-r border-border p-4 hidden sm:block bg-muted/20">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Current Document</p>
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">Q4_Report_2024.pdf</p>
                    <p className="text-xs text-muted-foreground">2.4 MB • 45 pages</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex-1 space-y-4">
                {messages.slice(0, visibleMessages).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "justify-end" : ""}`}
                  >
                    {msg.role === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && visibleMessages < messages.length && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input area */}
              <div className="mt-4 flex gap-2">
                <div className="flex-1 rounded-xl bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground">
                  Ask anything about your document...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
