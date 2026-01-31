import Header from "@/components/layout/Header";
import { Loader2 } from "lucide-react";
import { useCompliance } from "@/hooks/useCompliance";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ComplianceCard from "@/components/dashboard/ComplianceCard";
import DeadlinesSidebar from "@/components/dashboard/DeadlinesSidebar";
import QuickActions from "@/components/dashboard/QuickActions";

const Dashboard = () => {
  const {
    categories,
    deadlines,
    loading,
    stats,
    updateItemStatus,
    addDeadline,
    toggleDeadlineComplete,
    deleteDeadline,
  } = useCompliance();

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
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard Compliance
            </h1>
            <p className="text-muted-foreground">
              Monitorizează statusul conformității afacerii tale
            </p>
          </div>

          {/* Quick stats */}
          <StatsGrid stats={stats} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Compliance cards */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Status Compliance
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <ComplianceCard
                    key={category.id}
                    category={category}
                    onUpdateStatus={updateItemStatus}
                  />
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <DeadlinesSidebar
                deadlines={deadlines}
                onAdd={addDeadline}
                onToggle={toggleDeadlineComplete}
                onDelete={deleteDeadline}
              />
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
