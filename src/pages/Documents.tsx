import { useState } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { 
  FileText, Shield, Users, Receipt, 
  ChevronRight, Download, Eye, Check,
  Building, User, Calendar, Briefcase
} from "lucide-react";

const documentCategories = [
  {
    id: "gdpr",
    name: "GDPR",
    icon: Shield,
    color: "bg-accent/10 text-accent",
    documents: [
      { id: "1", name: "Politică de Confidențialitate", description: "Document obligatoriu pentru orice firmă" },
      { id: "2", name: "Registru Prelucrare Date", description: "Evidența operațiunilor de procesare" },
      { id: "3", name: "Contract Procesare Date", description: "Pentru colaboratori și furnizori" },
      { id: "4", name: "Acord Prelucrare Angajați", description: "Consimțământ GDPR angajați" },
    ],
  },
  {
    id: "contracts",
    name: "Contracte Muncă",
    icon: Users,
    color: "bg-success/10 text-success",
    documents: [
      { id: "5", name: "CIM Full-Time", description: "Contract individual de muncă normă întreagă" },
      { id: "6", name: "CIM Part-Time", description: "Contract pentru program redus" },
      { id: "7", name: "CIM Remote/Telemuncă", description: "Contract pentru lucru la distanță" },
      { id: "8", name: "Fișa Postului", description: "Atribuții și responsabilități" },
    ],
  },
  {
    id: "fiscal",
    name: "Documente Fiscale",
    icon: Receipt,
    color: "bg-warning/10 text-warning",
    documents: [
      { id: "9", name: "Model Factură", description: "Șablon factură fiscală" },
      { id: "10", name: "Contract Prestări Servicii", description: "Pentru colaboratori PFA/SRL" },
      { id: "11", name: "Declarație pe Proprie Răspundere", description: "Model general" },
    ],
  },
];

const formSteps = [
  { id: 1, title: "Tip Document", icon: FileText },
  { id: 2, title: "Date Firmă", icon: Building },
  { id: 3, title: "Detalii Specifice", icon: Briefcase },
  { id: 4, title: "Previzualizare", icon: Eye },
];

const Documents = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyName: "",
    cui: "",
    address: "",
    employees: "",
    representative: "",
  });

  const handleStartGenerator = (docId: string) => {
    setSelectedDocument(docId);
    setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setSelectedDocument(null);
      setSelectedCategory(null);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const selectedDoc = documentCategories
    .flatMap((c) => c.documents)
    .find((d) => d.id === selectedDocument);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Generator Documente</h1>
            <p className="text-muted-foreground">
              Creează documente legale conforme în câteva minute
            </p>
          </div>

          {!selectedDocument ? (
            /* Document selection */
            <div className="space-y-6">
              {documentCategories.map((category) => (
                <div key={category.id} className="glass-card-strong rounded-xl overflow-hidden">
                  {/* Category header */}
                  <button
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                    className="w-full p-5 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${category.color} flex items-center justify-center`}>
                        <category.icon className="w-6 h-6" />
                      </div>
                      <div className="text-left">
                        <h2 className="text-lg font-semibold text-foreground">{category.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {category.documents.length} documente disponibile
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        selectedCategory === category.id ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {/* Documents list */}
                  {selectedCategory === category.id && (
                    <div className="border-t border-border">
                      {category.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors border-b border-border last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-foreground">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">{doc.description}</p>
                            </div>
                          </div>
                          <Button
                            variant="hero"
                            size="sm"
                            onClick={() => handleStartGenerator(doc.id)}
                          >
                            Generează
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* Document generator wizard */
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
                        className={`text-xs mt-2 ${
                          currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < formSteps.length - 1 && (
                      <div
                        className={`w-16 md:w-24 h-0.5 mx-2 ${
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
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Denumire firmă
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          placeholder="SC Exemplu SRL"
                          className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          CUI / CIF
                        </label>
                        <input
                          type="text"
                          value={formData.cui}
                          onChange={(e) => setFormData({ ...formData, cui: e.target.value })}
                          placeholder="RO12345678"
                          className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Adresă sediu social
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Str. Exemplu, Nr. 1, București"
                          className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Număr angajați
                        </label>
                        <input
                          type="number"
                          value={formData.employees}
                          onChange={(e) => setFormData({ ...formData, employees: e.target.value })}
                          placeholder="5"
                          className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                          Reprezentant legal
                        </label>
                        <input
                          type="text"
                          value={formData.representative}
                          onChange={(e) => setFormData({ ...formData, representative: e.target.value })}
                          placeholder="Ion Popescu"
                          className="w-full px-4 py-2 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Detalii pentru: {selectedDoc?.name}
                    </h3>
                    <p className="text-muted-foreground">
                      Completează informațiile specifice pentru acest document.
                    </p>
                    <div className="p-4 bg-muted/30 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        Câmpuri suplimentare vor fi afișate în funcție de tipul documentului selectat.
                      </p>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Previzualizare Document
                    </h3>
                    <div className="p-6 bg-white dark:bg-muted/20 rounded-lg border border-border min-h-[200px]">
                      <div className="text-center mb-6">
                        <h4 className="text-xl font-bold text-foreground">{selectedDoc?.name}</h4>
                        <p className="text-muted-foreground">{formData.companyName || "Denumire firmă"}</p>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>CUI:</strong> {formData.cui || "—"}</p>
                        <p><strong>Adresă:</strong> {formData.address || "—"}</p>
                        <p><strong>Reprezentant:</strong> {formData.representative || "—"}</p>
                      </div>
                      <div className="mt-6 p-4 bg-muted/50 rounded text-center text-sm text-muted-foreground">
                        Previzualizare simplificată. Documentul final va conține toate clauzele necesare.
                      </div>
                    </div>
                    <div className="flex gap-3 justify-center pt-4">
                      <Button variant="outline" className="gap-2">
                        <Eye className="w-4 h-4" />
                        Previzualizare PDF
                      </Button>
                      <Button variant="hero" className="gap-2">
                        <Download className="w-4 h-4" />
                        Descarcă PDF
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between pt-6 border-t border-border mt-6">
                <Button variant="ghost" onClick={handleBack}>
                  Înapoi
                </Button>
                {currentStep < 4 && (
                  <Button variant="hero" onClick={handleNext}>
                    Continuă
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Documents;
