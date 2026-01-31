import { Button } from "@/components/ui/button";
import {
  Shield,
  FileText,
  Users,
  Receipt,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { ComplianceCategory } from "@/hooks/useCompliance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ComplianceCardProps {
  category: ComplianceCategory;
  onUpdateStatus: (itemId: string, status: "done" | "warning" | "pending") => void;
}

const iconMap: Record<string, React.ElementType> = {
  Shield,
  FileText,
  Users,
  Receipt,
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "done":
      return <CheckCircle className="w-5 h-5 text-success" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    case "pending":
      return <XCircle className="w-5 h-5 text-danger" />;
    default:
      return null;
  }
};

const getCategoryStatus = (items: ComplianceCategory["items"]) => {
  const doneCount = items.filter((i) => i.status === "done").length;
  const warningCount = items.filter((i) => i.status === "warning").length;
  
  if (doneCount === items.length) return "success";
  if (warningCount > 0 || doneCount > 0) return "warning";
  return "danger";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-success";
    case "warning":
      return "bg-warning";
    case "danger":
      return "bg-danger";
    default:
      return "bg-muted";
  }
};

const ComplianceCard = ({ category, onUpdateStatus }: ComplianceCardProps) => {
  const IconComponent = iconMap[category.icon] || Shield;
  const categoryStatus = getCategoryStatus(category.items);
  const progress = Math.round(
    (category.items.filter((i) => i.status === "done").length / category.items.length) * 100
  );

  return (
    <div className="glass-card-strong rounded-xl p-5 hover:shadow-medium transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              categoryStatus === "success"
                ? "bg-success/10"
                : categoryStatus === "warning"
                ? "bg-warning/10"
                : "bg-danger/10"
            }`}
          >
            <IconComponent
              className={`w-5 h-5 ${
                categoryStatus === "success"
                  ? "text-success"
                  : categoryStatus === "warning"
                  ? "text-warning"
                  : "text-danger"
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{category.category}</h3>
            <p className="text-sm text-muted-foreground">{progress}% complet</p>
          </div>
        </div>
        {getStatusIcon(categoryStatus === "success" ? "done" : categoryStatus === "warning" ? "warning" : "pending")}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getStatusColor(categoryStatus)}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Checklist */}
      <ul className="space-y-2 mb-4">
        {category.items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            <DropdownMenu>
              <DropdownMenuTrigger className="cursor-pointer hover:scale-110 transition-transform">
                {getStatusIcon(item.status)}
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onUpdateStatus(item.id, "done")}>
                  <CheckCircle className="w-4 h-4 mr-2 text-success" />
                  Finalizat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus(item.id, "warning")}>
                  <AlertTriangle className="w-4 h-4 mr-2 text-warning" />
                  În lucru
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUpdateStatus(item.id, "pending")}>
                  <XCircle className="w-4 h-4 mr-2 text-danger" />
                  Neînceput
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span
              className={
                item.status === "done" ? "text-muted-foreground line-through" : "text-foreground"
              }
            >
              {item.name}
            </span>
          </li>
        ))}
      </ul>

      <Button variant="outline" size="sm" className="w-full gap-2">
        Acțiune
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ComplianceCard;
