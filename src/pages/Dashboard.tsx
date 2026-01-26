import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { 
  Shield, FileText, Users, Receipt, 
  CheckCircle, AlertTriangle, XCircle,
  Calendar, Bell, ArrowRight, TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";

const complianceItems = [
  {
    category: "GDPR",
    icon: Shield,
    status: "warning",
    progress: 75,
    items: [
      { name: "Politică confidențialitate", status: "done" },
      { name: "Registru prelucrare", status: "warning" },
      { name: "Contract DPO", status: "pending" },
    ],
    action: "Finalizează documentele",
  },
  {
    category: "TVA",
    icon: Receipt,
    status: "success",
    progress: 100,
    items: [
      { name: "Înregistrare TVA", status: "done" },
      { name: "Declarații lunare", status: "done" },
      { name: "Plăți la zi", status: "done" },
    ],
    action: "Vezi detalii",
  },
  {
    category: "Contracte Muncă",
    icon: Users,
    status: "danger",
    progress: 40,
    items: [
      { name: "CIM actualizate", status: "warning" },
      { name: "Fișe post", status: "pending" },
      { name: "Regulament intern", status: "pending" },
    ],
    action: "Generează documente",
  },
  {
    category: "Fiscal",
    icon: FileText,
    status: "success",
    progress: 90,
    items: [
      { name: "Declarația 100", status: "done" },
      { name: "Declarația 112", status: "done" },
      { name: "Impozit profit", status: "warning" },
    ],
    action: "Verifică deadline-uri",
  },
];

const upcomingDeadlines = [
  { date: "25 Ian", title: "Declarația 112", type: "fiscal", urgent: true },
  { date: "25 Ian", title: "Plată TVA", type: "tva", urgent: true },
  { date: "31 Ian", title: "Plată salarii", type: "hr", urgent: false },
  { date: "15 Feb", title: "Raport DPO trimestrial", type: "gdpr", urgent: false },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case "done":
    case "success":
      return <CheckCircle className="w-5 h-5 text-success" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    case "pending":
    case "danger":
      return <XCircle className="w-5 h-5 text-danger" />;
    default:
      return null;
  }
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

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard Compliance</h1>
            <p className="text-muted-foreground">
              Monitorizează statusul conformității afacerii tale
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Documente Complete", value: "12", change: "+3 luna aceasta", icon: FileText, color: "text-success" },
              { label: "În Așteptare", value: "5", change: "Necesită atenție", icon: AlertTriangle, color: "text-warning" },
              { label: "Deadline-uri", value: "4", change: "În următoarele 30 zile", icon: Calendar, color: "text-accent" },
              { label: "Scor Compliance", value: "76%", change: "+12% vs luna trecută", icon: TrendingUp, color: "text-success" },
            ].map((stat, index) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compliance cards */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">Status Compliance</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {complianceItems.map((item, index) => (
                  <div key={index} className="glass-card-strong rounded-xl p-5 hover:shadow-medium transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.status === "success" ? "bg-success/10" :
                          item.status === "warning" ? "bg-warning/10" : "bg-danger/10"
                        }`}>
                          <item.icon className={`w-5 h-5 ${
                            item.status === "success" ? "text-success" :
                            item.status === "warning" ? "text-warning" : "text-danger"
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{item.category}</h3>
                          <p className="text-sm text-muted-foreground">{item.progress}% complet</p>
                        </div>
                      </div>
                      {getStatusIcon(item.status)}
                    </div>

                    {/* Progress bar */}
                    <div className="h-2 bg-muted rounded-full mb-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getStatusColor(item.status)}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    {/* Checklist */}
                    <ul className="space-y-2 mb-4">
                      {item.items.map((subItem, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          {getStatusIcon(subItem.status)}
                          <span className={subItem.status === "done" ? "text-muted-foreground" : "text-foreground"}>
                            {subItem.name}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button variant="outline" size="sm" className="w-full gap-2">
                      {item.action}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming deadlines */}
              <div className="glass-card-strong rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-accent" />
                    Deadline-uri
                  </h3>
                  <Button variant="ghost" size="sm">Vezi toate</Button>
                </div>
                <ul className="space-y-3">
                  {upcomingDeadlines.map((deadline, index) => (
                    <li key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`w-12 text-center py-1 rounded text-xs font-semibold ${
                        deadline.urgent ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground"
                      }`}>
                        {deadline.date}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{deadline.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{deadline.type}</p>
                      </div>
                      {deadline.urgent && <Bell className="w-4 h-4 text-danger" />}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Quick actions */}
              <div className="glass-card-strong rounded-xl p-5">
                <h3 className="font-semibold text-foreground mb-4">Acțiuni Rapide</h3>
                <div className="space-y-2">
                  <Link to="/documents">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <FileText className="w-4 h-4" />
                      Generează CIM nou
                    </Button>
                  </Link>
                  <Link to="/chat">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Shield className="w-4 h-4" />
                      Verifică GDPR
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Bell className="w-4 h-4" />
                    Setează reminder
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
