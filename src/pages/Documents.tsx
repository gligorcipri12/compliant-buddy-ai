import { useState } from "react";
import Header from "@/components/layout/Header";
import DocumentCategories from "@/components/documents/DocumentCategories";
import DocumentWizard from "@/components/documents/DocumentWizard";

const Documents = () => {
  const [selectedDocument, setSelectedDocument] = useState<{ id: string; name: string } | null>(null);

  const handleSelectDocument = (docId: string, docName: string) => {
    setSelectedDocument({ id: docId, name: docName });
  };

  const handleBack = () => {
    setSelectedDocument(null);
  };

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
            <DocumentCategories onSelectDocument={handleSelectDocument} />
          ) : (
            <DocumentWizard
              documentId={selectedDocument.id}
              documentName={selectedDocument.name}
              onBack={handleBack}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Documents;
