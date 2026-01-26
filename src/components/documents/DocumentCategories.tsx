import { Button } from "@/components/ui/button";
import { 
  FileText, Shield, Users, Receipt, ChevronRight
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  description: string;
}

interface Category {
  id: string;
  name: string;
  icon: typeof Shield;
  color: string;
  documents: Document[];
}

const documentCategories: Category[] = [
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

interface DocumentCategoriesProps {
  onSelectDocument: (docId: string, docName: string) => void;
}

const DocumentCategories = ({ onSelectDocument }: DocumentCategoriesProps) => {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);

  return (
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
                    onClick={() => onSelectDocument(doc.id, doc.name)}
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
  );
};

import React from "react";

export default DocumentCategories;
