import { useState } from "react";
import Header from "@/components/layout/Header";
import { Loader2 } from "lucide-react";
import { useCompliance } from "@/hooks/useCompliance";
import StatsGrid from "@/components/dashboard/StatsGrid";
import ComplianceCard from "@/components/dashboard/ComplianceCard";
import DeadlinesSidebar from "@/components/dashboard/DeadlinesSidebar";
import QuickActions from "@/components/dashboard/QuickActions";
import PendingItemsPanel from "@/components/dashboard/PendingItemsPanel";

const Dashboard = () => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
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

  // Filter categories based on active filter
  const getFilteredCategories = () => {
    if (!activeFilter) return categories;
    
    switch (activeFilter) {
      case "done":
        return categories.map(cat => ({
          ...cat,
          items: cat.items.filter(item => item.status === "done")
        })).filter(cat => cat.items.length > 0);
      case "pending":
        return categories.map(cat => ({
          ...cat,
          items: cat.items.filter(item => item.status === "pending" || item.status === "warning")
        })).filter(cat => cat.items.length > 0);
      default:
        return categories;
    }
  };

  const filteredCategories = getFilteredCategories();
  const showDeadlinesSidebar = !activeFilter || activeFilter === "deadlines" || activeFilter === "score";
  const showPendingPanel = !activeFilter || activeFilter === "pending";

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

          {/* Quick stats - Interactive */}
          <StatsGrid 
            stats={stats} 
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />

          {/* Main content area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - Compliance cards */}
            <div className="lg:col-span-2 space-y-6">
              {/* Pending Items Panel - Shows when filtering by pending or no filter */}
              {showPendingPanel && stats.pendingItems > 0 && (
                <PendingItemsPanel 
                  categories={categories}
                  onUpdateStatus={updateItemStatus}
                />
              )}

              {/* Compliance Status Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">
                    {activeFilter === "done" 
                      ? "Sarcini Finalizate" 
                      : activeFilter === "pending" 
                      ? "Sarcini În Așteptare"
                      : "Status Compliance"}
                  </h2>
                  {activeFilter && (
                    <button 
                      onClick={() => setActiveFilter(null)}
                      className="text-sm text-accent hover:underline"
                    >
                      Arată toate
                    </button>
                  )}
                </div>
                
                {filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredCategories.map((category) => (
                      <ComplianceCard
                        key={category.id}
                        category={category}
                        onUpdateStatus={updateItemStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="glass-card-strong rounded-xl p-8 text-center">
                    <p className="text-muted-foreground">
                      {activeFilter === "done" 
                        ? "Nu există sarcini finalizate încă."
                        : "Nu există sarcini în această categorie."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
              {showDeadlinesSidebar && (
                <DeadlinesSidebar
                  deadlines={deadlines}
                  onAdd={addDeadline}
                  onToggle={toggleDeadlineComplete}
                  onDelete={deleteDeadline}
                />
              )}
              <QuickActions />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
