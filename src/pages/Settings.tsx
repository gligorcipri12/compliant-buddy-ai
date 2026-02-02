import { useState } from "react";
import Header from "@/components/layout/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Bell,
  Palette,
  Users,
  Shield,
  Building2,
  Mail,
  Plus,
  Trash2,
  Crown,
  UserPlus,
  Loader2,
} from "lucide-react";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { useTeams } from "@/hooks/useTeams";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const { user } = useAuth();
  const { profile, loading: profileLoading, saveProfile, formData: profileFormData } = useCompanyProfile();
  const { preferences, loading: prefsLoading, updatePreferences } = useNotificationPreferences();
  const {
    teams,
    currentTeam,
    members,
    invitations,
    loading: teamsLoading,
    createTeam,
    inviteMember,
    acceptInvitation,
    declineInvitation,
    removeMember,
    switchTeam,
  } = useTeams();

  const [companyForm, setCompanyForm] = useState({
    company_name: "",
    company_cui: "",
    company_address: "",
    company_phone: "",
    company_representative: "",
  });

  const [newTeamName, setNewTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Initialize form with profile data
  useState(() => {
    if (profile) {
      setCompanyForm({
        company_name: profile.company_name || "",
        company_cui: profile.company_cui || "",
        company_address: profile.company_address || "",
        company_phone: profile.company_phone || "",
        company_representative: profile.company_representative || "",
      });
    }
  });

  const handleSaveCompany = async () => {
    await saveProfile({
      companyName: companyForm.company_name,
      cui: companyForm.company_cui,
      address: companyForm.company_address,
      phone: companyForm.company_phone,
      representative: companyForm.company_representative,
      email: profile?.email || "",
      employeeCount: profile?.employee_count?.toString() || "",
    });
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setIsCreatingTeam(true);
    await createTeam(newTeamName);
    setNewTeamName("");
    setIsCreatingTeam(false);
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;
    setIsInviting(true);
    await inviteMember(inviteEmail, inviteRole);
    setInviteEmail("");
    setIsInviting(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Proprietar";
      case "admin":
        return "Admin";
      default:
        return "Membru";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Setări</h1>
            <p className="text-muted-foreground">
              Gestionează profilul, notificările și echipa ta
            </p>
          </div>

          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="company" className="gap-2">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Firmă</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notificări</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="gap-2">
                <Palette className="w-4 h-4" />
                <span className="hidden sm:inline">Aspect</span>
              </TabsTrigger>
              <TabsTrigger value="team" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Echipă</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Securitate</span>
              </TabsTrigger>
            </TabsList>

            {/* Company Tab */}
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Informații Firmă
                  </CardTitle>
                  <CardDescription>
                    Aceste date vor fi folosite pentru completarea automată a documentelor
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profileLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Denumire Firmă</Label>
                          <Input
                            id="company_name"
                            value={companyForm.company_name || profile?.company_name || ""}
                            onChange={(e) =>
                              setCompanyForm((prev) => ({
                                ...prev,
                                company_name: e.target.value,
                              }))
                            }
                            placeholder="SC Exemplu SRL"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_cui">CUI</Label>
                          <Input
                            id="company_cui"
                            value={companyForm.company_cui || profile?.company_cui || ""}
                            onChange={(e) =>
                              setCompanyForm((prev) => ({
                                ...prev,
                                company_cui: e.target.value,
                              }))
                            }
                            placeholder="RO12345678"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company_address">Adresă Sediu</Label>
                        <Input
                          id="company_address"
                          value={companyForm.company_address || profile?.company_address || ""}
                          onChange={(e) =>
                            setCompanyForm((prev) => ({
                              ...prev,
                              company_address: e.target.value,
                            }))
                          }
                          placeholder="Str. Exemplu Nr. 1, București"
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="company_phone">Telefon</Label>
                          <Input
                            id="company_phone"
                            value={companyForm.company_phone || profile?.company_phone || ""}
                            onChange={(e) =>
                              setCompanyForm((prev) => ({
                                ...prev,
                                company_phone: e.target.value,
                              }))
                            }
                            placeholder="+40 123 456 789"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_representative">Reprezentant Legal</Label>
                          <Input
                            id="company_representative"
                            value={
                              companyForm.company_representative ||
                              profile?.company_representative ||
                              ""
                            }
                            onChange={(e) =>
                              setCompanyForm((prev) => ({
                                ...prev,
                                company_representative: e.target.value,
                              }))
                            }
                            placeholder="Ion Popescu"
                          />
                        </div>
                      </div>
                      <Button onClick={handleSaveCompany} className="mt-4">
                        Salvează Modificările
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Preferințe Notificări
                  </CardTitle>
                  <CardDescription>
                    Configurează cum și când primești notificări
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {prefsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email_notifications">Notificări Email</Label>
                          <p className="text-sm text-muted-foreground">
                            Primește alerte pentru deadline-uri și actualizări importante
                          </p>
                        </div>
                        <Switch
                          id="email_notifications"
                          checked={preferences?.email_notifications ?? true}
                          onCheckedChange={(checked) =>
                            updatePreferences({ email_notifications: checked })
                          }
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>
                            Reminder Deadline:{" "}
                            <span className="font-bold">
                              {preferences?.deadline_reminder_days || 3} zile înainte
                            </span>
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Primește notificare cu câte zile înainte de deadline
                          </p>
                          <Slider
                            value={[preferences?.deadline_reminder_days || 3]}
                            onValueChange={([value]) =>
                              updatePreferences({ deadline_reminder_days: value })
                            }
                            min={1}
                            max={14}
                            step={1}
                            className="max-w-md"
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="weekly_summary">Sumar Săptămânal</Label>
                          <p className="text-sm text-muted-foreground">
                            Primește un raport săptămânal cu statusul compliance
                          </p>
                        </div>
                        <Switch
                          id="weekly_summary"
                          checked={preferences?.weekly_summary ?? true}
                          onCheckedChange={(checked) =>
                            updatePreferences({ weekly_summary: checked })
                          }
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Aspect
                  </CardTitle>
                  <CardDescription>
                    Personalizează aspectul aplicației
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Temă</Label>
                      <p className="text-sm text-muted-foreground">
                        Alege între modul luminos, întunecat sau automat
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team">
              <div className="space-y-6">
                {/* Pending Invitations */}
                {invitations.length > 0 && (
                  <Card className="border-accent">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-accent">
                        <Mail className="w-5 h-5" />
                        Invitații Primite
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {invitations.map((invitation) => (
                          <div
                            key={invitation.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                          >
                            <div>
                              <p className="font-medium">
                                Ai fost invitat să te alături unei echipe
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Rol: {getRoleLabel(invitation.role)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => declineInvitation(invitation.id)}
                              >
                                Refuză
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => acceptInvitation(invitation.id)}
                              >
                                Acceptă
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Team Management */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="w-5 h-5" />
                          Echipa Mea
                        </CardTitle>
                        <CardDescription>
                          Gestionează membrii echipei și permisiunile
                        </CardDescription>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Echipă Nouă
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Creează Echipă Nouă</DialogTitle>
                            <DialogDescription>
                              Creează o echipă pentru a colabora cu colegii tăi
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="teamName">Numele Echipei</Label>
                              <Input
                                id="teamName"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                placeholder="Ex: Departament Contabilitate"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              onClick={handleCreateTeam}
                              disabled={isCreatingTeam || !newTeamName.trim()}
                            >
                              {isCreatingTeam && (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              )}
                              Creează
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {teamsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : teams.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="font-medium mb-2">Nu faci parte din nicio echipă</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Creează o echipă pentru a colabora cu colegii
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Team Selector */}
                        {teams.length > 1 && (
                          <div className="space-y-2">
                            <Label>Echipa Activă</Label>
                            <Select
                              value={currentTeam?.id}
                              onValueChange={switchTeam}
                            >
                              <SelectTrigger className="w-full max-w-xs">
                                <SelectValue placeholder="Selectează echipa" />
                              </SelectTrigger>
                              <SelectContent>
                                {teams.map((team) => (
                                  <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {currentTeam && (
                          <>
                            <Separator />

                            {/* Invite Member */}
                            <div className="space-y-4">
                              <h4 className="font-medium">Invită Membri Noi</h4>
                              <div className="flex gap-2">
                                <Input
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  placeholder="email@exemplu.com"
                                  type="email"
                                  className="flex-1"
                                />
                                <Select
                                  value={inviteRole}
                                  onValueChange={(v) =>
                                    setInviteRole(v as "admin" | "member")
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="member">Membru</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button
                                  onClick={handleInviteMember}
                                  disabled={isInviting || !inviteEmail.trim()}
                                >
                                  {isInviting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <UserPlus className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>

                            <Separator />

                            {/* Members List */}
                            <div className="space-y-3">
                              <h4 className="font-medium">
                                Membri ({members.length})
                              </h4>
                              {members.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      {member.role === "owner" ? (
                                        <Crown className="w-5 h-5 text-warning" />
                                      ) : (
                                        <User className="w-5 h-5 text-muted-foreground" />
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {member.user_id === user?.id
                                          ? "Tu"
                                          : `Membru ${member.id.slice(0, 8)}`}
                                      </p>
                                      <Badge variant={getRoleBadgeVariant(member.role)}>
                                        {getRoleLabel(member.role)}
                                      </Badge>
                                    </div>
                                  </div>
                                  {member.role !== "owner" &&
                                    currentTeam.owner_id === user?.id && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeMember(member.id)}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Securitate
                  </CardTitle>
                  <CardDescription>
                    Gestionează setările de securitate ale contului
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{user?.email}</p>
                      </div>
                      <Badge variant="outline">Verificat</Badge>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Parolă</p>
                        <p className="text-sm text-muted-foreground">
                          Ultima modificare: necunoscut
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Schimbă Parola
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">Autentificare în doi pași (2FA)</p>
                        <p className="text-sm text-muted-foreground">
                          Adaugă un strat extra de securitate
                        </p>
                      </div>
                      <Badge variant="secondary">În curând</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
