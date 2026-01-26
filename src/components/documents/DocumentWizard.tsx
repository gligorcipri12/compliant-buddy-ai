import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, Building, Briefcase, Eye, Check, Download, ArrowLeft, Loader2
} from "lucide-react";
import { documentTemplates, type CompanyData } from "@/lib/pdf/documentTemplates";
import { generateDocument } from "@/lib/pdf/pdfGenerator";
import { toast } from "@/hooks/use-toast";

interface DocumentWizardProps {
  documentId: string;
  documentName: string;
  onBack: () => void;
}

const formSteps = [
  { id: 1, title: "Tip Document", icon: FileText },
  { id: 2, title: "Date Firmă", icon: Building },
  { id: 3, title: "Detalii Specifice", icon: Briefcase },
  { id: 4, title: "Previzualizare", icon: Eye },
];

const DocumentWizard = ({ documentId, documentName, onBack }: DocumentWizardProps) => {
  const [currentStep, setCurrentStep] = useState(2);
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: "",
    cui: "",
    address: "",
    employees: "",
    representative: "",
    email: "",
    phone: "",
  });
  const [extraData, setExtraData] = useState<Record<string, string>>({});

  const template = documentTemplates[documentId];

  const handleCompanyChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({ ...prev, [field]: value }));
  };

  const handleExtraChange = (field: string, value: string) => {
    setExtraData(prev => ({ ...prev, [field]: value }));
  };

  const handleBack = () => {
    if (currentStep > 2) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = generateDocument(documentId, companyData, extraData);
      
      if (doc) {
        // Generate filename
        const sanitizedName = documentName
          .replace(/[^a-zA-Z0-9\u0100-\u017F\s]/g, "")
          .replace(/\s+/g, "_");
        const filename = `${sanitizedName}_${new Date().toISOString().split("T")[0]}.pdf`;
        
        doc.save(filename);
        
        toast({
          title: "Document generat cu succes!",
          description: `Fișierul ${filename} a fost descărcat.`,
        });
      } else {
        throw new Error("Nu s-a putut genera documentul");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut genera documentul PDF. Încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewPDF = async () => {
    setIsGenerating(true);
    
    try {
      const doc = generateDocument(documentId, companyData, extraData);
      
      if (doc) {
        // Open in new tab for preview
        const pdfBlob = doc.output("blob");
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, "_blank");
        
        // Clean up URL after a delay
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
      }
    } catch (error) {
      console.error("Error previewing PDF:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut previzualiza documentul.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderField = (field: typeof template.fields[0]) => {
    const value = extraData[field.name] || "";

    switch (field.type) {
      case "textarea":
        return (
          <div key={field.name} className="col-span-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => handleExtraChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1.5 bg-secondary border-border"
              rows={3}
            />
          </div>
        );
      case "select":
        return (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Select value={value} onValueChange={(v) => handleExtraChange(field.name, v)}>
              <SelectTrigger className="mt-1.5 bg-secondary border-border">
                <SelectValue placeholder="Selectează..." />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "date":
        return (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="date"
              value={value}
              onChange={(e) => handleExtraChange(field.name, e.target.value)}
              className="mt-1.5 bg-secondary border-border"
            />
          </div>
        );
      default:
        return (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => handleExtraChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className="mt-1.5 bg-secondary border-border"
            />
          </div>
        );
    }
  };

  return (
    <div className="glass-card-strong rounded-xl p-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-8">
        {formSteps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.id
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs mt-2 hidden sm:block ${
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < formSteps.length - 1 && (
              <div
                className={`w-12 md:w-24 h-0.5 mx-2 ${
                  currentStep > step.id ? "bg-accent" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form content */}
      <div className="min-h-[300px]">
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Date despre firmă
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyName">Denumire firmă *</Label>
                <Input
                  id="companyName"
                  value={companyData.companyName}
                  onChange={(e) => handleCompanyChange("companyName", e.target.value)}
                  placeholder="SC Exemplu SRL"
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="cui">CUI / CIF *</Label>
                <Input
                  id="cui"
                  value={companyData.cui}
                  onChange={(e) => handleCompanyChange("cui", e.target.value)}
                  placeholder="RO12345678"
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="address">Adresă sediu social *</Label>
                <Input
                  id="address"
                  value={companyData.address}
                  onChange={(e) => handleCompanyChange("address", e.target.value)}
                  placeholder="Str. Exemplu, Nr. 1, București"
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="employees">Număr angajați</Label>
                <Input
                  id="employees"
                  type="number"
                  value={companyData.employees}
                  onChange={(e) => handleCompanyChange("employees", e.target.value)}
                  placeholder="5"
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="representative">Reprezentant legal *</Label>
                <Input
                  id="representative"
                  value={companyData.representative}
                  onChange={(e) => handleCompanyChange("representative", e.target.value)}
                  placeholder="Ion Popescu"
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={companyData.email}
                  onChange={(e) => handleCompanyChange("email", e.target.value)}
                  placeholder="contact@exemplu.ro"
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={companyData.phone}
                  onChange={(e) => handleCompanyChange("phone", e.target.value)}
                  placeholder="0721 123 456"
                  className="mt-1.5 bg-secondary border-border"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Detalii pentru: {documentName}
            </h3>
            {template?.fields && template.fields.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {template.fields.map(renderField)}
              </div>
            ) : (
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <p className="text-muted-foreground">
                  Nu sunt necesare informații suplimentare pentru acest document.
                </p>
              </div>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Previzualizare Document
            </h3>
            <div className="p-6 bg-white dark:bg-muted/20 rounded-lg border border-border min-h-[200px]">
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-foreground">{documentName}</h4>
                <p className="text-muted-foreground">{companyData.companyName || "Denumire firmă"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground"><strong>CUI:</strong> {companyData.cui || "—"}</p>
                  <p className="text-muted-foreground"><strong>Adresă:</strong> {companyData.address || "—"}</p>
                  <p className="text-muted-foreground"><strong>Reprezentant:</strong> {companyData.representative || "—"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground"><strong>Nr. angajați:</strong> {companyData.employees || "—"}</p>
                  <p className="text-muted-foreground"><strong>Email:</strong> {companyData.email || "—"}</p>
                  <p className="text-muted-foreground"><strong>Telefon:</strong> {companyData.phone || "—"}</p>
                </div>
              </div>
              
              {Object.keys(extraData).length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="font-semibold text-foreground mb-2">Detalii suplimentare:</p>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {Object.entries(extraData).map(([key, value]) => (
                      value && (
                        <p key={key}>
                          <strong>{template?.fields.find(f => f.name === key)?.label || key}:</strong> {value}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 p-4 bg-muted/50 rounded text-center text-sm text-muted-foreground">
                Documentul PDF final va conține toate clauzele legale necesare.
              </div>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <Button 
                variant="outline" 
                className="gap-2"
                onClick={handlePreviewPDF}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Previzualizare PDF
              </Button>
              <Button 
                variant="hero" 
                className="gap-2"
                onClick={handleGeneratePDF}
                disabled={isGenerating}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Descarcă PDF
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-6 border-t border-border mt-6">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Înapoi
        </Button>
        {currentStep < 4 && (
          <Button variant="hero" onClick={handleNext}>
            Continuă
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentWizard;
