import { FileText, AlertTriangle, Calendar, TrendingUp } from "lucide-react";

interface StatsGridProps {
  stats: {
    doneItems: number;
    pendingItems: number;
    upcomingDeadlines: number;
    complianceScore: number;
  };
}

const StatsGrid = ({ stats }: StatsGridProps) => {
  const statItems = [
    {
      label: "Documente Complete",
      value: stats.doneItems.toString(),
      change: "Finalizate",
      icon: FileText,
      color: "text-success",
    },
    {
      label: "În Așteptare",
      value: stats.pendingItems.toString(),
      change: "Necesită atenție",
      icon: AlertTriangle,
      color: "text-warning",
    },
    {
      label: "Deadline-uri Active",
      value: stats.upcomingDeadlines.toString(),
      change: "De îndeplinit",
      icon: Calendar,
      color: "text-accent",
    },
    {
      label: "Scor Compliance",
      value: `${stats.complianceScore}%`,
      change: stats.complianceScore >= 80 ? "Excelent!" : stats.complianceScore >= 50 ? "Bine" : "Necesită îmbunătățiri",
      icon: TrendingUp,
      color: stats.complianceScore >= 80 ? "text-success" : stats.complianceScore >= 50 ? "text-warning" : "text-danger",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {statItems.map((stat, index) => (
        <div key={index} className="glass-card-strong p-5 rounded-xl">
          <div className="flex items-start justify-between mb-3">
            <span className="text-muted-foreground text-sm">{stat.label}</span>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.change}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
