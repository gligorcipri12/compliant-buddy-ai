import { useState } from "react";
import { format, isAfter, addDays } from "date-fns";
import { ro } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Bell,
  Plus,
  Check,
  Trash2,
  X,
} from "lucide-react";
import { Deadline } from "@/hooks/useCompliance";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DeadlinesSidebarProps {
  deadlines: Deadline[];
  onAdd: (title: string, date: string, type: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const DeadlinesSidebar = ({ deadlines, onAdd, onToggle, onDelete }: DeadlinesSidebarProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState<Date>();
  const [newType, setNewType] = useState("fiscal");

  const handleAdd = () => {
    if (newTitle && newDate) {
      onAdd(newTitle, format(newDate, "yyyy-MM-dd"), newType);
      setNewTitle("");
      setNewDate(undefined);
      setNewType("fiscal");
      setShowAddForm(false);
    }
  };

  const isUrgent = (dateStr: string) => {
    const date = new Date(dateStr);
    return isAfter(addDays(new Date(), 7), date);
  };

  const activeDeadlines = deadlines.filter((d) => !d.is_completed);

  return (
    <div className="glass-card-strong rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent" />
          Deadline-uri
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg space-y-3">
          <Input
            placeholder="Titlu deadline"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !newDate && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {newDate ? format(newDate, "PPP", { locale: ro }) : "Alege data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <Select value={newType} onValueChange={setNewType}>
            <SelectTrigger>
              <SelectValue placeholder="Tip" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fiscal">Fiscal</SelectItem>
              <SelectItem value="tva">TVA</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="gdpr">GDPR</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} className="w-full" size="sm">
            Adaugă
          </Button>
        </div>
      )}

      <ul className="space-y-3">
        {activeDeadlines.slice(0, 5).map((deadline) => (
          <li
            key={deadline.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div
              className={`w-12 text-center py-1 rounded text-xs font-semibold ${
                isUrgent(deadline.deadline_date)
                  ? "bg-danger/10 text-danger"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {format(new Date(deadline.deadline_date), "d MMM", { locale: ro })}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {deadline.title}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {deadline.type}
              </p>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onToggle(deadline.id)}
              >
                <Check className="w-3 h-3 text-success" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onDelete(deadline.id)}
              >
                <Trash2 className="w-3 h-3 text-danger" />
              </Button>
            </div>
            {isUrgent(deadline.deadline_date) && (
              <Bell className="w-4 h-4 text-danger flex-shrink-0" />
            )}
          </li>
        ))}
        {activeDeadlines.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nu există deadline-uri active
          </p>
        )}
      </ul>

      {activeDeadlines.length > 5 && (
        <Button variant="ghost" size="sm" className="w-full mt-3">
          Vezi toate ({activeDeadlines.length})
        </Button>
      )}
    </div>
  );
};

export default DeadlinesSidebar;
