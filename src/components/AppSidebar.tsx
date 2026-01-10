import { useState, useEffect } from "react";
import { 
  FileText, 
  Plus, 
  Home, 
  Globe, 
  FolderOpen, 
  MessageSquare,
  Trash2,
  LogOut,
  User,
  ChevronDown,
  PanelLeftClose,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

interface AppSidebarProps {
  user: SupabaseUser | null;
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onSignOut: () => void;
  onShowLogin: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({
  user,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onSignOut,
  onShowLogin,
  isCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("chat_sessions")
        .delete()
        .eq("id", sessionId);

      if (error) throw error;
      
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast({
        title: "Chat deleted",
        description: "The chat session has been removed.",
      });
      
      if (currentSessionId === sessionId) {
        onNewChat();
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete chat session.",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (isCollapsed) {
    return (
      <div className="w-14 h-full bg-sidebar flex flex-col items-center py-4 border-r border-sidebar-border">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors mb-4"
        >
          <PanelLeftClose className="h-5 w-5 text-sidebar-foreground rotate-180" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent mb-4">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <button
          onClick={onNewChat}
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          title="New Chat"
        >
          <Plus className="h-5 w-5 text-sidebar-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 h-full bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-accent">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">DocMind</span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <PanelLeftClose className="h-4 w-4 text-sidebar-muted" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 mb-4">
        <Button
          onClick={onNewChat}
          variant="outline"
          className="w-full justify-start gap-2 bg-sidebar-accent border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent/80"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-sm">
          <Home className="h-4 w-4" />
          Home
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors text-sm">
          <Globe className="h-4 w-4" />
          Explore DocMind AI
        </button>
      </nav>

      {/* Folders Section */}
      <div className="px-3 mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">Folder</span>
          <button className="p-1 rounded hover:bg-sidebar-accent transition-colors">
            <Plus className="h-3.5 w-3.5 text-sidebar-muted" />
          </button>
        </div>
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors text-sm">
            <FolderOpen className="h-4 w-4" />
            Documents
          </button>
        </div>
      </div>

      {/* History Section */}
      {user && (
        <div className="px-3 mt-6 flex-1 overflow-hidden flex flex-col">
          <button 
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="flex items-center justify-between mb-2 w-full"
          >
            <span className="text-xs font-medium text-sidebar-muted uppercase tracking-wider">History</span>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-sidebar-muted transition-transform",
              !historyExpanded && "-rotate-90"
            )} />
          </button>
          
          {historyExpanded && (
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin h-4 w-4 border-2 border-sidebar-primary border-t-transparent rounded-full" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-sidebar-muted text-center py-4">No chats yet</p>
              ) : (
                sessions.slice(0, 10).map((session) => (
                  <div
                    key={session.id}
                    onClick={() => onSessionSelect(session.id)}
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm",
                      currentSessionId === session.id
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">{session.title || "Untitled"}</span>
                    <button
                      onClick={(e) => deleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive rounded transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Pro Banner (for non-logged users) */}
      {!user && (
        <div className="mx-3 mt-auto mb-4 p-4 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-sidebar-primary" />
            <span className="text-sm font-medium text-sidebar-foreground">DocMind Pro</span>
          </div>
          <p className="text-xs text-sidebar-muted mb-3">
            Save your chats and access them anywhere
          </p>
          <Button 
            onClick={onShowLogin}
            size="sm" 
            className="w-full"
          >
            Sign In
          </Button>
        </div>
      )}

      {/* User Info */}
      {user && (
        <div className="p-3 border-t border-sidebar-border mt-auto">
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="h-4 w-4 text-sidebar-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-sidebar-foreground truncate">
                {user.email?.split('@')[0] || "User"}
              </p>
            </div>
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 text-sidebar-muted hover:text-destructive" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}