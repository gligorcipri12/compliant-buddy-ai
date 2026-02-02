import { useMemo } from "react";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Download,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Calendar,
  Target,
} from "lucide-react";
import { useCompliance } from "@/hooks/useCompliance";
import { useComplianceHistory } from "@/hooks/useComplianceHistory";
import { format, subDays } from "date-fns";
import { ro } from "date-fns/locale";
import jsPDF from "jspdf";
import { toast } from "sonner";

const Analytics = () => {
  const { categories, deadlines, stats, loading } = useCompliance();
  const { history, getAnalytics } = useComplianceHistory();

  const analytics = useMemo(() => getAnalytics(), [getAnalytics]);

  // Prepare data for pie chart
  const pieData = useMemo(() => {
    const done = categories.reduce(
      (acc, cat) => acc + cat.items.filter((i) => i.status === "done").length,
      0
    );
    const pending = categories.reduce(
      (acc, cat) => acc + cat.items.filter((i) => i.status === "pending").length,
      0
    );
    const warning = categories.reduce(
      (acc, cat) => acc + cat.items.filter((i) => i.status === "warning").length,
      0
    );

    return [
      { name: "Finalizate", value: done, color: "hsl(var(--success))" },
      { name: "În Așteptare", value: pending, color: "hsl(var(--warning))" },
      { name: "Urgente", value: warning, color: "hsl(var(--danger))" },
    ].filter((d) => d.value > 0);
  }, [categories]);

  // Prepare data for bar chart (by category)
  const categoryData = useMemo(() => {
    return categories.map((cat) => ({
      name: cat.category,
      finalizate: cat.items.filter((i) => i.status === "done").length,
      "în așteptare": cat.items.filter(
        (i) => i.status === "pending" || i.status === "warning"
      ).length,
    }));
  }, [categories]);

  // Prepare trend data (last 7 days)
  const trendData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayHistory = history.filter(
        (h) => h.created_at.split("T")[0] === dateStr
      );
      days.push({
        date: format(date, "EEE", { locale: ro }),
        acțiuni: dayHistory.length,
        finalizate: dayHistory.filter((h) => h.new_status === "done").length,
      });
    }
    return days;
  }, [history]);

  // Generate PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Raport Compliance", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generat: ${format(new Date(), "d MMMM yyyy, HH:mm", { locale: ro })}`, pageWidth / 2, 28, {
      align: "center",
    });

    let y = 45;

    // Summary Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Rezumat General", 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    const summaryData = [
      ["Scor Compliance", `${stats.complianceScore}%`],
      ["Sarcini Totale", `${stats.totalItems}`],
      ["Sarcini Finalizate", `${stats.doneItems}`],
      ["Sarcini În Așteptare", `${stats.pendingItems}`],
      ["Deadline-uri Active", `${stats.upcomingDeadlines}`],
    ];

    summaryData.forEach(([label, value]) => {
      doc.text(`${label}: ${value}`, 25, y);
      y += 7;
    });

    y += 10;

    // Categories Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Status pe Categorii", 20, y);
    y += 10;

    doc.setFontSize(10);
    categories.forEach((cat) => {
      const done = cat.items.filter((i) => i.status === "done").length;
      const total = cat.items.length;
      const percentage = total > 0 ? Math.round((done / total) * 100) : 0;

      doc.setFont("helvetica", "bold");
      doc.text(`${cat.category}`, 25, y);
      doc.setFont("helvetica", "normal");
      doc.text(`${done}/${total} (${percentage}%)`, 100, y);
      y += 7;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 10;

    // Upcoming Deadlines
    const upcomingDeadlines = deadlines.filter((d) => !d.is_completed).slice(0, 10);
    if (upcomingDeadlines.length > 0) {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Deadline-uri Apropiate", 20, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      upcomingDeadlines.forEach((deadline) => {
        doc.text(
          `• ${deadline.title} - ${format(new Date(deadline.deadline_date), "d MMM yyyy", { locale: ro })}`,
          25,
          y
        );
        y += 6;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Pagina ${i} din ${pageCount} | ComplianceBot`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    doc.save(`raport-compliance-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast.success("Raport PDF generat cu succes!");
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
                <TrendingUp className="w-8 h-8 text-accent" />
                Analiză & Rapoarte
              </h1>
              <p className="text-muted-foreground">
                Vizualizează statistici detaliate și exportă rapoarte
              </p>
            </div>
            <Button onClick={generatePDFReport}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Target className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.complianceScore}%</p>
                    <p className="text-sm text-muted-foreground">Scor Compliance</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <CheckCircle className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics.completedThisWeek}</p>
                    <p className="text-sm text-muted-foreground">Finalizate (7 zile)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingItems}</p>
                    <p className="text-sm text-muted-foreground">În Așteptare</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-danger/10">
                    <Calendar className="w-5 h-5 text-danger" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.upcomingDeadlines}</p>
                    <p className="text-sm text-muted-foreground">Deadline-uri</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart - Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuție Status</CardTitle>
                <CardDescription>
                  Vizualizare statusuri sarcini compliance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart - By Category */}
            <Card>
              <CardHeader>
                <CardTitle>Status pe Categorii</CardTitle>
                <CardDescription>
                  Progres compliance pentru fiecare categorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="finalizate"
                        fill="hsl(var(--success))"
                        radius={[0, 4, 4, 0]}
                      />
                      <Bar
                        dataKey="în așteptare"
                        fill="hsl(var(--warning))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Trend */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Activitate Ultimele 7 Zile</CardTitle>
              <CardDescription>
                Trend-ul acțiunilor și sarcinilor finalizate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="acțiuni"
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--accent))" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="finalizate"
                      stroke="hsl(var(--success))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--success))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Activitate Recentă
              </CardTitle>
              <CardDescription>
                Ultimele acțiuni din sistem
              </CardDescription>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nu există activitate înregistrată încă
                </p>
              ) : (
                <div className="space-y-3">
                  {history.slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        {entry.new_status === "done" ? (
                          <CheckCircle className="w-4 h-4 text-success" />
                        ) : entry.new_status === "warning" ? (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        ) : (
                          <Clock className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-sm">{entry.action}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {entry.new_status && (
                          <Badge variant="outline">
                            {entry.new_status === "done"
                              ? "Finalizat"
                              : entry.new_status === "warning"
                              ? "Urgent"
                              : "În așteptare"}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(entry.created_at), "d MMM, HH:mm", {
                            locale: ro,
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
