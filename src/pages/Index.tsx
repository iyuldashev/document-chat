import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { AppSidebar } from "@/components/AppSidebar";
import { MainContent } from "@/components/MainContent";
import { LoginModal } from "@/components/LoginModal";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasPromptedLogin, setHasPromptedLogin] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSession = async (sessionId: string) => {
    try {
      const { data: sessionData, error: sessionError } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      
      setCurrentSessionId(sessionId);
      setDocumentName(sessionData.title || "Document");
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
    handleNewChat();
    toast({
      title: "Signed out",
      description: "Your session has ended.",
    });
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    toast({
      title: "Welcome!",
      description: "Your chats will now be saved automatically.",
    });
  };

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar */}
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

      {/* Main Content */}
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

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
};

export default Index;