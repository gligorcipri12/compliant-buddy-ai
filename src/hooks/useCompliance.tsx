import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface ComplianceItem {
  id: string;
  name: string;
  status: "done" | "warning" | "pending";
  action_label: string | null;
}

export interface ComplianceCategory {
  id: string;
  category: string;
  icon: string;
  items: ComplianceItem[];
}

export interface Deadline {
  id: string;
  title: string;
  deadline_date: string;
  type: string;
  is_completed: boolean;
}

const DEFAULT_CATEGORIES = [
  {
    category: "GDPR",
    icon: "Shield",
    items: [
      { name: "Politică confidențialitate", status: "pending" as const, action_label: "Generează" },
      { name: "Registru prelucrare", status: "pending" as const, action_label: "Creează" },
      { name: "Contract DPO", status: "pending" as const, action_label: "Generează" },
    ],
  },
  {
    category: "TVA",
    icon: "Receipt",
    items: [
      { name: "Înregistrare TVA", status: "pending" as const, action_label: "Verifică" },
      { name: "Declarații lunare", status: "pending" as const, action_label: "Verifică" },
      { name: "Plăți la zi", status: "pending" as const, action_label: "Verifică" },
    ],
  },
  {
    category: "Contracte Muncă",
    icon: "Users",
    items: [
      { name: "CIM actualizate", status: "pending" as const, action_label: "Generează" },
      { name: "Fișe post", status: "pending" as const, action_label: "Creează" },
      { name: "Regulament intern", status: "pending" as const, action_label: "Generează" },
    ],
  },
  {
    category: "Fiscal",
    icon: "FileText",
    items: [
      { name: "Declarația 100", status: "pending" as const, action_label: "Verifică" },
      { name: "Declarația 112", status: "pending" as const, action_label: "Verifică" },
      { name: "Impozit profit", status: "pending" as const, action_label: "Verifică" },
    ],
  },
];

const DEFAULT_DEADLINES = [
  { title: "Declarația 112", deadline_date: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString().split('T')[0], type: "fiscal" },
  { title: "Plată TVA", deadline_date: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString().split('T')[0], type: "tva" },
  { title: "Plată salarii", deadline_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0], type: "hr" },
  { title: "Raport DPO trimestrial", deadline_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 15).toISOString().split('T')[0], type: "gdpr" },
];

export const useCompliance = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ComplianceCategory[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch categories with items
      const { data: categoriesData, error: catError } = await supabase
        .from("compliance_categories")
        .select("*")
        .eq("user_id", user.id);

      if (catError) throw catError;

      if (categoriesData && categoriesData.length > 0) {
        // Fetch items for all categories
        const { data: itemsData, error: itemsError } = await supabase
          .from("compliance_items")
          .select("*")
          .eq("user_id", user.id);

        if (itemsError) throw itemsError;

        const categoriesWithItems = categoriesData.map((cat) => ({
          ...cat,
          items: (itemsData || [])
            .filter((item) => item.category_id === cat.id)
            .map((item) => ({
              id: item.id,
              name: item.name,
              status: item.status as "done" | "warning" | "pending",
              action_label: item.action_label,
            })),
        }));

        setCategories(categoriesWithItems);
      } else {
        // Initialize with defaults
        await initializeDefaults();
      }

      // Fetch deadlines
      const { data: deadlinesData, error: deadError } = await supabase
        .from("deadlines")
        .select("*")
        .eq("user_id", user.id)
        .order("deadline_date", { ascending: true });

      if (deadError) throw deadError;

      if (deadlinesData && deadlinesData.length > 0) {
        setDeadlines(deadlinesData);
      } else {
        // Initialize with default deadlines
        await initializeDefaultDeadlines();
      }
    } catch (error) {
      console.error("Error fetching compliance data:", error);
      toast.error("Eroare la încărcarea datelor");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const initializeDefaults = async () => {
    if (!user) return;

    try {
      for (const cat of DEFAULT_CATEGORIES) {
        const { data: categoryData, error: catError } = await supabase
          .from("compliance_categories")
          .insert({
            user_id: user.id,
            category: cat.category,
            icon: cat.icon,
          })
          .select()
          .single();

        if (catError) throw catError;

        const itemsToInsert = cat.items.map((item) => ({
          category_id: categoryData.id,
          user_id: user.id,
          name: item.name,
          status: item.status,
          action_label: item.action_label,
        }));

        const { error: itemsError } = await supabase
          .from("compliance_items")
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      // Refetch after initialization
      await fetchData();
    } catch (error) {
      console.error("Error initializing defaults:", error);
    }
  };

  const initializeDefaultDeadlines = async () => {
    if (!user) return;

    try {
      const deadlinesToInsert = DEFAULT_DEADLINES.map((d) => ({
        user_id: user.id,
        title: d.title,
        deadline_date: d.deadline_date,
        type: d.type,
        is_completed: false,
      }));

      const { data, error } = await supabase
        .from("deadlines")
        .insert(deadlinesToInsert)
        .select();

      if (error) throw error;
      if (data) setDeadlines(data);
    } catch (error) {
      console.error("Error initializing deadlines:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateItemStatus = async (itemId: string, newStatus: "done" | "warning" | "pending") => {
    try {
      const { error } = await supabase
        .from("compliance_items")
        .update({ status: newStatus })
        .eq("id", itemId);

      if (error) throw error;

      setCategories((prev) =>
        prev.map((cat) => ({
          ...cat,
          items: cat.items.map((item) =>
            item.id === itemId ? { ...item, status: newStatus } : item
          ),
        }))
      );

      toast.success("Status actualizat");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Eroare la actualizarea statusului");
    }
  };

  const addDeadline = async (title: string, deadline_date: string, type: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("deadlines")
        .insert({
          user_id: user.id,
          title,
          deadline_date,
          type,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setDeadlines((prev) => [...prev, data].sort(
          (a, b) => new Date(a.deadline_date).getTime() - new Date(b.deadline_date).getTime()
        ));
        toast.success("Deadline adăugat");
      }
    } catch (error) {
      console.error("Error adding deadline:", error);
      toast.error("Eroare la adăugarea deadline-ului");
    }
  };

  const toggleDeadlineComplete = async (id: string) => {
    const deadline = deadlines.find((d) => d.id === id);
    if (!deadline) return;

    try {
      const { error } = await supabase
        .from("deadlines")
        .update({ is_completed: !deadline.is_completed })
        .eq("id", id);

      if (error) throw error;

      setDeadlines((prev) =>
        prev.map((d) => (d.id === id ? { ...d, is_completed: !d.is_completed } : d))
      );

      toast.success(deadline.is_completed ? "Deadline reactivat" : "Deadline marcat complet");
    } catch (error) {
      console.error("Error toggling deadline:", error);
      toast.error("Eroare la actualizarea deadline-ului");
    }
  };

  const deleteDeadline = async (id: string) => {
    try {
      const { error } = await supabase.from("deadlines").delete().eq("id", id);

      if (error) throw error;

      setDeadlines((prev) => prev.filter((d) => d.id !== id));
      toast.success("Deadline șters");
    } catch (error) {
      console.error("Error deleting deadline:", error);
      toast.error("Eroare la ștergerea deadline-ului");
    }
  };

  // Calculate stats
  const stats = {
    totalItems: categories.reduce((acc, cat) => acc + cat.items.length, 0),
    doneItems: categories.reduce(
      (acc, cat) => acc + cat.items.filter((i) => i.status === "done").length,
      0
    ),
    pendingItems: categories.reduce(
      (acc, cat) => acc + cat.items.filter((i) => i.status === "pending" || i.status === "warning").length,
      0
    ),
    upcomingDeadlines: deadlines.filter((d) => !d.is_completed).length,
    complianceScore: categories.length > 0
      ? Math.round(
          (categories.reduce(
            (acc, cat) => acc + cat.items.filter((i) => i.status === "done").length,
            0
          ) /
            categories.reduce((acc, cat) => acc + cat.items.length, 0)) *
            100
        )
      : 0,
  };

  return {
    categories,
    deadlines,
    loading,
    stats,
    updateItemStatus,
    addDeadline,
    toggleDeadlineComplete,
    deleteDeadline,
    refetch: fetchData,
  };
};
