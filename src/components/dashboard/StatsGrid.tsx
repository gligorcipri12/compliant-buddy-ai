import { FileText, AlertTriangle, Calendar, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsGridProps {
  stats: {
    doneItems: number;
    pendingItems: number;
    upcomingDeadlines: number;
    complianceScore: number;
  };
  activeFilter?: string | null;
  onFilterChange?: (filter: string | null) => void;
}

const StatsGrid = ({ stats, activeFilter, onFilterChange }: StatsGridProps) => {
  const statItems = [
    {
      id: "done",
      label: "Documente Complete",
      value: stats.doneItems.toString(),
      change: "Finalizate",
      icon: FileText,
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/30",
    },
    {
      id: "pending",
      label: "În Așteptare",
      value: stats.pendingItems.toString(),
      change: "Necesită atenție",
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/30",
    },
    {
      id: "deadlines",
      label: "Deadline-uri Active",
      value: stats.upcomingDeadlines.toString(),
      change: "De îndeplinit",
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10",
      borderColor: "border-accent/30",
    },
    {
      id: "score",
      label: "Scor Compliance",
      value: `${stats.complianceScore}%`,
      change: stats.complianceScore >= 80 ? "Excelent!" : stats.complianceScore >= 50 ? "Bine" : "Necesită îmbunătățiri",
      icon: TrendingUp,
      color: stats.complianceScore >= 80 ? "text-success" : stats.complianceScore >= 50 ? "text-warning" : "text-danger",
      bgColor: stats.complianceScore >= 80 ? "bg-success/10" : stats.complianceScore >= 50 ? "bg-warning/10" : "bg-danger/10",
      borderColor: stats.complianceScore >= 80 ? "border-success/30" : stats.complianceScore >= 50 ? "border-warning/30" : "border-danger/30",
    },
  ];

  const handleClick = (id: string) => {
    if (onFilterChange) {
      onFilterChange(activeFilter === id ? null : id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((stat) => {
        const isActive = activeFilter === stat.id;
        return (
          <button
            key={stat.id}
            onClick={() => handleClick(stat.id)}
            className={cn(
              "glass-card-strong p-5 rounded-xl text-left transition-all duration-300",
              "hover:shadow-medium hover:scale-[1.02]",
              "focus:outline-none focus:ring-2 focus:ring-accent/50",
              isActive && `ring-2 ${stat.borderColor} ${stat.bgColor}`
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-muted-foreground text-sm">{stat.label}</span>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                stat.bgColor
              )}>
                <stat.icon className={cn("w-4 h-4", stat.color)} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
            <p className={cn("text-xs", isActive ? stat.color : "text-muted-foreground")}>
              {isActive ? "Click pentru a anula filtrul" : stat.change}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default StatsGrid;
