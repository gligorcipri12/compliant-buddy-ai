import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
  email?: string;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "pending" | "accepted" | "declined" | "expired";
  invited_by: string;
  expires_at: string;
  created_at: string;
}

export const useTeams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch teams where user is a member
      const { data: membershipData, error: membershipError } = await supabase
        .from("team_members")
        .select("team_id")
        .eq("user_id", user.id);

      if (membershipError) throw membershipError;

      if (membershipData && membershipData.length > 0) {
        const teamIds = membershipData.map((m) => m.team_id);
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("*")
          .in("id", teamIds);

        if (teamsError) throw teamsError;
        setTeams(teamsData || []);

        // Get current team from profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("current_team_id")
          .eq("user_id", user.id)
          .single();

        if (profileData?.current_team_id) {
          const current = teamsData?.find((t) => t.id === profileData.current_team_id);
          setCurrentTeam(current || teamsData?.[0] || null);
        } else if (teamsData && teamsData.length > 0) {
          setCurrentTeam(teamsData[0]);
        }
      }

      // Fetch pending invitations for user's email
      const { data: invitationsData, error: invError } = await supabase
        .from("team_invitations")
        .select("*")
        .eq("email", user.email)
        .eq("status", "pending");

      if (!invError && invitationsData) {
        setInvitations(invitationsData as TeamInvitation[]);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTeamMembers = useCallback(async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("team_id", teamId);

      if (error) throw error;
      setMembers((data || []) as TeamMember[]);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  useEffect(() => {
    if (currentTeam) {
      fetchTeamMembers(currentTeam.id);
    }
  }, [currentTeam, fetchTeamMembers]);

  const createTeam = async (name: string) => {
    if (!user) return null;

    try {
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert({ name, owner_id: user.id })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add owner as team member
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: teamData.id,
          user_id: user.id,
          role: "owner",
        });

      if (memberError) throw memberError;

      // Update current team
      await supabase
        .from("profiles")
        .update({ current_team_id: teamData.id })
        .eq("user_id", user.id);

      setTeams((prev) => [...prev, teamData]);
      setCurrentTeam(teamData);
      toast.success("Echipa a fost creată!");
      return teamData;
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Eroare la crearea echipei");
      return null;
    }
  };

  const inviteMember = async (email: string, role: "admin" | "member" = "member") => {
    if (!user || !currentTeam) return;

    try {
      const { error } = await supabase
        .from("team_invitations")
        .insert({
          team_id: currentTeam.id,
          email,
          role,
          invited_by: user.id,
        });

      if (error) throw error;
      toast.success(`Invitație trimisă către ${email}`);
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error("Eroare la trimiterea invitației");
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    if (!user) return;

    try {
      const invitation = invitations.find((i) => i.id === invitationId);
      if (!invitation) return;

      // Update invitation status
      await supabase
        .from("team_invitations")
        .update({ status: "accepted" })
        .eq("id", invitationId);

      // Add user to team
      await supabase
        .from("team_members")
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          role: invitation.role,
        });

      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      await fetchTeams();
      toast.success("Te-ai alăturat echipei!");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Eroare la acceptarea invitației");
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      await supabase
        .from("team_invitations")
        .update({ status: "declined" })
        .eq("id", invitationId);

      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      toast.success("Invitație refuzată");
    } catch (error) {
      console.error("Error declining invitation:", error);
      toast.error("Eroare la refuzarea invitației");
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success("Membru eliminat");
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Eroare la eliminarea membrului");
    }
  };

  const switchTeam = async (teamId: string) => {
    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({ current_team_id: teamId })
        .eq("user_id", user.id);

      const team = teams.find((t) => t.id === teamId);
      setCurrentTeam(team || null);
      toast.success(`Ai schimbat la echipa ${team?.name}`);
    } catch (error) {
      console.error("Error switching team:", error);
      toast.error("Eroare la schimbarea echipei");
    }
  };

  return {
    teams,
    currentTeam,
    members,
    invitations,
    loading,
    createTeam,
    inviteMember,
    acceptInvitation,
    declineInvitation,
    removeMember,
    switchTeam,
    refetch: fetchTeams,
  };
};
