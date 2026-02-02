import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface ComplianceHistoryEntry {
  id: string;
  user_id: string;
  item_id: string | null;
  action: string;
  old_status: string | null;
  new_status: string | null;
  created_at: string;
}

export const useComplianceHistory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ComplianceHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async (limit: number = 50) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("compliance_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching compliance history:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const logAction = async (
    action: string,
    itemId?: string,
    oldStatus?: string,
    newStatus?: string
  ) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("compliance_history")
        .insert({
          user_id: user.id,
          item_id: itemId || null,
          action,
          old_status: oldStatus || null,
          new_status: newStatus || null,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setHistory((prev) => [data, ...prev].slice(0, 50));
      }
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  // Analytics data
  const getAnalytics = useCallback(() => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentHistory = history.filter(
      (h) => new Date(h.created_at) >= last7Days
    );
    const monthlyHistory = history.filter(
      (h) => new Date(h.created_at) >= last30Days
    );

    const completedThisWeek = recentHistory.filter(
      (h) => h.new_status === "done"
    ).length;
    const completedThisMonth = monthlyHistory.filter(
      (h) => h.new_status === "done"
    ).length;

    // Group by day for chart data
    const dailyData: Record<string, { completed: number; pending: number }> = {};
    monthlyHistory.forEach((h) => {
      const date = new Date(h.created_at).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { completed: 0, pending: 0 };
      }
      if (h.new_status === "done") {
        dailyData[date].completed++;
      } else if (h.new_status === "pending") {
        dailyData[date].pending++;
      }
    });

    const chartData = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        completed: data.completed,
        pending: data.pending,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      completedThisWeek,
      completedThisMonth,
      totalActions: history.length,
      chartData,
    };
  }, [history]);

  return {
    history,
    loading,
    logAction,
    getAnalytics,
    refetch: fetchHistory,
  };
};
