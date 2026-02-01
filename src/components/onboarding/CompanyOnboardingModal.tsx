import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { CompanyFormData } from "@/hooks/useCompanyProfile";

interface CompanyOnboardingModalProps {
  open: boolean;
  onComplete: (data: CompanyFormData) => Promise<boolean>;
  onSkip: () => Promise<boolean>;
  saving: boolean;
  initialData?: CompanyFormData;
}

const CompanyOnboardingModal = ({
  open,
  onComplete,
  onSkip,
  saving,
  initialData,
}: CompanyOnboardingModalProps) => {
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: "",
    cui: "",
    address: "",
    representative: "",
    phone: "",
    email: "",
    employeeCount: "",
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof CompanyFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onComplete(formData);
    if (success) {
      // Modal will close automatically when needsOnboarding becomes false
    }
  };

  const handleSkip = async () => {
    await onSkip();
  };

  const isStep1Valid = formData.companyName && formData.cui;
  const isStep2Valid = formData.representative;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[500px] gap-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-accent" />
            </div>
            <div>
              <DialogTitle className="text-xl">Bine ai venit! 🎉</DialogTitle>
              <DialogDescription className="text-sm">
                Completează datele firmei pentru generare automată de documente
              </DialogDescription>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="flex items-center gap-2 mt-4">
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-accent" : "bg-muted"}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-accent" : "bg-muted"}`} />
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-accent/5 rounded-lg border border-accent/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground">
                  Aceste date vor fi folosite pentru completarea automată a documentelor legale.
                  Le poți modifica oricând din setări.
                </p>
              </div>

              <div>
                <Label htmlFor="companyName">Denumire firmă *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  placeholder="SC Exemplu SRL"
                  className="mt-1.5"
                  autoFocus
                />
              </div>

              <div>
                <Label htmlFor="cui">CUI / CIF *</Label>
                <Input
                  id="cui"
                  value={formData.cui}
                  onChange={(e) => handleChange("cui", e.target.value)}
                  placeholder="RO12345678"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="address">Adresă sediu social</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Str. Exemplu, Nr. 1, București"
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" onClick={handleSkip} disabled={saving}>
                  Completez mai târziu
                </Button>
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="gap-2"
                >
                  Continuă
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <Label htmlFor="representative">Reprezentant legal *</Label>
                <Input
                  id="representative"
                  value={formData.representative}
                  onChange={(e) => handleChange("representative", e.target.value)}
                  placeholder="Ion Popescu"
                  className="mt-1.5"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="contact@firma.ro"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="0721 123 456"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="employeeCount">Număr angajați</Label>
                <Input
                  id="employeeCount"
                  type="number"
                  value={formData.employeeCount}
                  onChange={(e) => handleChange("employeeCount", e.target.value)}
                  placeholder="5"
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button type="button" variant="ghost" onClick={() => setStep(1)} disabled={saving}>
                  Înapoi
                </Button>
                <Button type="submit" disabled={!isStep2Valid || saving} className="gap-2">
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Se salvează...
                    </>
                  ) : (
                    <>
                      Finalizează
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CompanyOnboardingModal;
