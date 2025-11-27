import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <div 
      className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-glow hover:border-primary/30 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent transition-colors group-hover:bg-primary/10">
        <Icon className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
      </div>
      <h3 className="mb-2 font-semibold text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
