import { Upload, Cpu, MessageCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Document",
    description: "Drag & drop any PDF, Word doc, or text file",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Cpu,
    title: "AI Analyzes",
    description: "Our AI reads and understands your content instantly",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: MessageCircle,
    title: "Start Chatting",
    description: "Ask questions and get accurate answers in seconds",
    gradient: "from-orange-500 to-pink-500",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 px-6 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted-foreground mb-4">
            Simple Process
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            How it works
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three simple steps to unlock your document's potential
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting lines - hidden on mobile */}
          <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-border via-primary/30 to-border" />

          {steps.map((step, index) => (
            <div key={index} className="relative group">
              <div className="flex flex-col items-center text-center">
                {/* Step number */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-background border-2 border-primary text-xs font-bold text-primary flex items-center justify-center z-10">
                  {index + 1}
                </div>

                {/* Icon container */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.gradient} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-foreground" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground max-w-[200px]">
                  {step.description}
                </p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden mt-6 text-muted-foreground/30">
                    <ArrowRight className="w-6 h-6 rotate-90" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
