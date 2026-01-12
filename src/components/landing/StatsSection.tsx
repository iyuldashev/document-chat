import { useEffect, useState, useRef } from "react";

const stats = [
  { value: 50, suffix: "+", label: "File Types Supported" },
  { value: 99.9, suffix: "%", label: "Accuracy Rate", decimals: 1 },
  { value: 3, suffix: "s", label: "Average Response Time" },
  { value: 10000, suffix: "+", label: "Documents Analyzed" },
];

function useCountUp(end: number, duration: number = 2000, decimals: number = 0, inView: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Number((easeOut * end).toFixed(decimals)));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [end, duration, decimals, inView]);

  return count;
}

function StatCard({ value, suffix, label, decimals = 0, inView }: { 
  value: number; 
  suffix: string; 
  label: string; 
  decimals?: number;
  inView: boolean;
}) {
  const count = useCountUp(value, 2000, decimals, inView);

  return (
    <div className="text-center p-6 group">
      <div className="text-4xl sm:text-5xl font-bold text-foreground mb-2 tabular-nums">
        <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          {count}
        </span>
        <span className="text-primary">{suffix}</span>
      </div>
      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </p>
    </div>
  );
}

export function StatsSection() {
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 px-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-8 sm:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                decimals={stat.decimals}
                inView={inView}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
