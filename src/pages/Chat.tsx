import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { AppSidebar } from "@/components/AppSidebar";
import { MainContent } from "@/components/MainContent";
import { LoginModal } from "@/components/LoginModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const [user, setUser] = useState<User | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasPromptedLogin, setHasPromptedLogin] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSession = async (sessionId: string) => {
    try {
      const { data: session, error } = await supabase
        .from("chat_sessions")
        .select(
          `
          *,
          documents (name)
        `
        )
        .eq("id", sessionId)
        .single();

      if (error) throw error;

      setCurrentSessionId(sessionId);
      if (session.documents) {
        setDocumentName(session.documents.name);
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setDocumentName(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentSessionId(null);
    setDocumentName(null);
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setHasPromptedLogin(true);
    toast({
      title: "Welcome back!",
      description: "You've successfully signed in.",
    });
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <AppSidebar
        user={user}
        currentSessionId={currentSessionId}
        onSessionSelect={loadSession}
        onNewChat={handleNewChat}
        onSignOut={handleSignOut}
        onShowLogin={() => setShowLoginModal(true)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <MainContent
        user={user}
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        documentName={documentName}
        setDocumentName={setDocumentName}
        onShowLogin={() => setShowLoginModal(true)}
        hasPromptedLogin={hasPromptedLogin}
        setHasPromptedLogin={setHasPromptedLogin}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
