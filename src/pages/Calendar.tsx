import { useState } from "react";
import Header from "@/components/layout/Header";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isSameDay, isAfter, addDays, startOfMonth, endOfMonth } from "date-fns";
import { ro } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Bell,
  Check,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useCompliance, Deadline } from "@/hooks/useCompliance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const CalendarPage = () => {
  const { deadlines, loading, addDeadline, toggleDeadlineComplete, deleteDeadline } =
    useCompliance();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("fiscal");

  const handleAddDeadline = async () => {
    if (!newTitle.trim() || !selectedDate) return;
    await addDeadline(newTitle, format(selectedDate, "yyyy-MM-dd"), newType);
    setNewTitle("");
    setNewType("fiscal");
    setIsAddDialogOpen(false);
  };

  // Get deadlines for selected date
  const selectedDateDeadlines = deadlines.filter(
    (d) => selectedDate && isSameDay(new Date(d.deadline_date), selectedDate)
  );

  // Get all dates with deadlines for highlighting
  const datesWithDeadlines = deadlines.map((d) => new Date(d.deadline_date));

  // Check if a date has deadlines
  const hasDeadline = (date: Date) => {
    return datesWithDeadlines.some((d) => isSameDay(d, date));
  };

  // Check if deadline is urgent (within 7 days)
  const isUrgent = (dateStr: string) => {
    const date = new Date(dateStr);
    return isAfter(addDays(new Date(), 7), date);
  };

  // Group deadlines by status
  const upcomingDeadlines = deadlines
    .filter((d) => !d.is_completed)
    .sort(
      (a, b) =>
        new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime()
    );

  const completedDeadlines = deadlines.filter((d) => d.is_completed);

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      fiscal: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      tva: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      hr: "bg-green-500/10 text-green-600 border-green-500/20",
      gdpr: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    };
    return typeColors[type] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12 flex items-center justify-center min-h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <CalendarIcon className="w-8 h-8 text-accent" />
                Calendar Deadline-uri
              </h1>
              <p className="text-muted-foreground">
                Vizualizează și gestionează toate termenele limită
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adaugă Deadline
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adaugă Deadline Nou</DialogTitle>
                  <DialogDescription>
                    Completează detaliile pentru noul deadline
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Titlu</Label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ex: Declarația 112"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <div className="p-3 border rounded-lg">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        locale={ro}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tip</Label>
                    <Select value={newType} onValueChange={setNewType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fiscal">Fiscal</SelectItem>
                        <SelectItem value="tva">TVA</SelectItem>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="gdpr">GDPR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddDeadline}
                    disabled={!newTitle.trim() || !selectedDate}
                  >
                    Salvează
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {format(currentMonth, "MMMM yyyy", { locale: ro })}
                  </CardTitle>
                  <CardDescription>
                    Click pe o dată pentru a vedea deadline-urile
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                      )
                    }
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentMonth(
                        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                      )
                    }
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentMonth}
                  onMonthChange={setCurrentMonth}
                  locale={ro}
                  className="w-full"
                  modifiers={{
                    hasDeadline: datesWithDeadlines,
                  }}
                  modifiersStyles={{
                    hasDeadline: {
                      fontWeight: "bold",
                      textDecoration: "underline",
                      textDecorationColor: "hsl(var(--accent))",
                    },
                  }}
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 w-full",
                    month: "space-y-4 w-full",
                    table: "w-full border-collapse",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem]",
                    row: "flex w-full mt-2",
                    cell: cn(
                      "h-12 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                      "[&:has([aria-selected])]:bg-accent/20"
                    ),
                    day: cn(
                      "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-accent/10 rounded-lg mx-auto flex items-center justify-center"
                    ),
                    day_selected:
                      "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    day_today: "bg-primary/10 text-primary font-bold",
                  }}
                />

                {/* Selected Date Deadlines */}
                {selectedDate && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-4">
                      {format(selectedDate, "d MMMM yyyy", { locale: ro })}
                    </h3>
                    {selectedDateDeadlines.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Nu există deadline-uri pentru această dată
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedDateDeadlines.map((deadline) => (
                          <div
                            key={deadline.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg",
                              deadline.is_completed
                                ? "bg-muted/30 opacity-60"
                                : "bg-muted/50"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Badge className={getTypeBadge(deadline.type)}>
                                {deadline.type.toUpperCase()}
                              </Badge>
                              <span
                                className={cn(
                                  deadline.is_completed && "line-through"
                                )}
                              >
                                {deadline.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleDeadlineComplete(deadline.id)}
                              >
                                <Check
                                  className={cn(
                                    "w-4 h-4",
                                    deadline.is_completed
                                      ? "text-success"
                                      : "text-muted-foreground"
                                  )}
                                />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteDeadline(deadline.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sidebar - Upcoming Deadlines */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-warning" />
                    În Curând
                  </CardTitle>
                  <CardDescription>
                    Deadline-uri în următoarele 30 de zile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingDeadlines.slice(0, 10).map((deadline) => (
                      <div
                        key={deadline.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-lg",
                          isUrgent(deadline.deadline_date)
                            ? "bg-danger/10"
                            : "bg-muted/30"
                        )}
                      >
                        <div
                          className={cn(
                            "text-center min-w-[50px] py-1 rounded text-xs font-semibold",
                            isUrgent(deadline.deadline_date)
                              ? "bg-danger/20 text-danger"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {format(new Date(deadline.deadline_date), "d MMM", {
                            locale: ro,
                          })}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {deadline.title}
                          </p>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getTypeBadge(deadline.type))}
                          >
                            {deadline.type}
                          </Badge>
                        </div>
                        {isUrgent(deadline.deadline_date) && (
                          <Bell className="w-4 h-4 text-danger flex-shrink-0" />
                        )}
                      </div>
                    ))}
                    {upcomingDeadlines.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nu există deadline-uri active
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Completed */}
              {completedDeadlines.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-success" />
                      Completate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {completedDeadlines.slice(0, 5).map((deadline) => (
                        <div
                          key={deadline.id}
                          className="flex items-center gap-3 p-2 rounded-lg bg-success/5 opacity-60"
                        >
                          <Check className="w-4 h-4 text-success" />
                          <span className="text-sm line-through">
                            {deadline.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
