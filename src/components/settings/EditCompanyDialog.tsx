import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2, Settings, Save } from "lucide-react";
import { CompanyFormData, useCompanyProfile } from "@/hooks/useCompanyProfile";

interface EditCompanyDialogProps {
  trigger?: React.ReactNode;
}

const EditCompanyDialog = ({ trigger }: EditCompanyDialogProps) => {
  const { formData: profileData, saving, saveProfile } = useCompanyProfile();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: "",
    cui: "",
    address: "",
    representative: "",
    phone: "",
    email: "",
    employeeCount: "",
  });

  useEffect(() => {
    if (open && profileData) {
      setFormData(profileData);
    }
  }, [open, profileData]);

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveProfile(formData);
    if (success) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Date Firmă
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-accent" />
            </div>
            <div>
              <DialogTitle>Editează datele firmei</DialogTitle>
              <DialogDescription>
                Modifică informațiile pentru completarea automată a documentelor
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="edit-companyName">Denumire firmă *</Label>
              <Input
                id="edit-companyName"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="SC Exemplu SRL"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="edit-cui">CUI / CIF *</Label>
              <Input
                id="edit-cui"
                value={formData.cui}
                onChange={(e) => handleChange("cui", e.target.value)}
                placeholder="RO12345678"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="edit-employeeCount">Număr angajați</Label>
              <Input
                id="edit-employeeCount"
                type="number"
                value={formData.employeeCount}
                onChange={(e) => handleChange("employeeCount", e.target.value)}
                placeholder="5"
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="edit-address">Adresă sediu social</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Str. Exemplu, Nr. 1, București"
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="edit-representative">Reprezentant legal *</Label>
              <Input
                id="edit-representative"
                value={formData.representative}
                onChange={(e) => handleChange("representative", e.target.value)}
                placeholder="Ion Popescu"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="contact@firma.ro"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="edit-phone">Telefon</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="0721 123 456"
                className="mt-1.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Anulează
            </Button>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Se salvează...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvează
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCompanyDialog;
