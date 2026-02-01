import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface CompanyProfile {
  id: string;
  user_id: string;
  company_name: string | null;
  company_cui: string | null;
  company_address: string | null;
  company_representative: string | null;
  company_phone: string | null;
  email: string | null;
  employee_count: number | null;
  onboarding_completed: boolean;
}

export interface CompanyFormData {
  companyName: string;
  cui: string;
  address: string;
  representative: string;
  phone: string;
  email: string;
  employeeCount: string;
}

const mapProfileToFormData = (profile: CompanyProfile | null): CompanyFormData => ({
  companyName: profile?.company_name || "",
  cui: profile?.company_cui || "",
  address: profile?.company_address || "",
  representative: profile?.company_representative || "",
  phone: profile?.company_phone || "",
  email: profile?.email || "",
  employeeCount: profile?.employee_count?.toString() || "",
});

const mapFormDataToProfile = (formData: CompanyFormData) => ({
  company_name: formData.companyName || null,
  company_cui: formData.cui || null,
  company_address: formData.address || null,
  company_representative: formData.representative || null,
  company_phone: formData.phone || null,
  email: formData.email || null,
  employee_count: formData.employeeCount ? parseInt(formData.employeeCount) : null,
  onboarding_completed: true,
});

export const useCompanyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Derived state
  const needsOnboarding = profile ? !profile.onboarding_completed : false;
  const formData = mapProfileToFormData(profile);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        // Profile might not exist yet (created by trigger but we need to check)
        if (error.code === "PGRST116") {
          // No profile found - this shouldn't happen with our trigger
          console.warn("No profile found for user");
        } else {
          throw error;
        }
      }

      setProfile(data as CompanyProfile);
    } catch (error) {
      console.error("Error fetching company profile:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (formData: CompanyFormData): Promise<boolean> => {
    if (!user) {
      toast.error("Trebuie să fii autentificat");
      return false;
    }

    setSaving(true);

    try {
      const updateData = mapFormDataToProfile(formData);

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;

      // Update local state
      setProfile((prev) => prev ? { ...prev, ...updateData } : null);
      
      toast.success("Datele firmei au fost salvate!");
      return true;
    } catch (error) {
      console.error("Error saving company profile:", error);
      toast.error("Eroare la salvarea datelor firmei");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const skipOnboarding = async (): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, onboarding_completed: true } : null);
      return true;
    } catch (error) {
      console.error("Error skipping onboarding:", error);
      return false;
    }
  };

  return {
    profile,
    formData,
    loading,
    saving,
    needsOnboarding,
    saveProfile,
    skipOnboarding,
    refetch: fetchProfile,
  };
};
