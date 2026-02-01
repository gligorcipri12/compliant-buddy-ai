import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { ComplianceCategory, ComplianceItem } from "@/hooks/useCompliance";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PendingItemsPanelProps {
  categories: ComplianceCategory[];
  onUpdateStatus: (itemId: string, status: "done" | "warning" | "pending") => void;
}

type FilterType = "all" | "pending" | "warning";

interface FlatItem extends ComplianceItem {
  categoryName: string;
  categoryIcon: string;
}

const PendingItemsPanel = ({ categories, onUpdateStatus }: PendingItemsPanelProps) => {
  const [filter, setFilter] = useState<FilterType>("all");
  const [isExpanded, setIsExpanded] = useState(true);

  // Flatten all items with their category info
  const allItems: FlatItem[] = categories.flatMap((cat) =>
    cat.items
      .filter((item) => item.status !== "done")
      .map((item) => ({
        ...item,
        categoryName: cat.category,
        categoryIcon: cat.icon,
      }))
  );

  // Apply filter
  const filteredItems = allItems.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  // Sort: warnings first, then pending
  const sortedItems = filteredItems.sort((a, b) => {
    if (a.status === "warning" && b.status !== "warning") return -1;
    if (a.status !== "warning" && b.status === "warning") return 1;
    return 0;
  });

  const pendingCount = allItems.filter((i) => i.status === "pending").length;
  const warningCount = allItems.filter((i) => i.status === "warning").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "warning":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            <AlertTriangle className="w-3 h-3 mr-1" />
            În lucru
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-danger/10 text-danger border-danger/20">
            <Clock className="w-3 h-3 mr-1" />
            Neînceput
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="glass-card-strong rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          <h3 className="font-semibold text-foreground">În Așteptare</h3>
          <Badge variant="secondary" className="ml-2">
            {allItems.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Filter className="w-4 h-4" />
                {filter === "all" ? "Toate" : filter === "warning" ? "În lucru" : "Neîncepute"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("all")}>
                Toate ({allItems.length})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("warning")}>
                <AlertTriangle className="w-4 h-4 mr-2 text-warning" />
                În lucru ({warningCount})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("pending")}>
                <Clock className="w-4 h-4 mr-2 text-danger" />
                Neîncepute ({pendingCount})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sortedItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 text-success/50" />
              <p className="text-sm">Toate sarcinile sunt finalizate!</p>
            </div>
          ) : (
            sortedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.categoryName}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-warning hover:text-warning hover:bg-warning/10"
                    onClick={() => onUpdateStatus(item.id, "warning")}
                    disabled={item.status === "warning"}
                  >
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-success hover:text-success hover:bg-success/10"
                    onClick={() => onUpdateStatus(item.id, "done")}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {allItems.length > 0 && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {warningCount > 0 && (
                <span className="text-warning mr-3">{warningCount} în lucru</span>
              )}
              {pendingCount > 0 && (
                <span className="text-danger">{pendingCount} neîncepute</span>
              )}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Mark all as in progress
                sortedItems
                  .filter((i) => i.status === "pending")
                  .slice(0, 3)
                  .forEach((item) => onUpdateStatus(item.id, "warning"));
              }}
              disabled={pendingCount === 0}
            >
              Începe primele 3
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingItemsPanel;
