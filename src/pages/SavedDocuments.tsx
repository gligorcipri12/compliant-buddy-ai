import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Trash2, Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { generateDocument } from "@/lib/pdf/pdfGenerator";
import { documentTemplates, type CompanyData } from "@/lib/pdf/documentTemplates";

interface SavedDocument {
  id: string;
  document_type: string;
  document_name: string;
  company_data: CompanyData;
  extra_data: Record<string, string>;
  created_at: string;
}

const SavedDocuments = () => {
  const [documents, setDocuments] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Cast the data to match our SavedDocument interface
      const typedData = (data || []).map((doc: {
        id: string;
        document_type: string;
        document_name: string;
        company_data: unknown;
        extra_data: unknown;
        created_at: string;
      }) => ({
        ...doc,
        company_data: doc.company_data as CompanyData,
        extra_data: (doc.extra_data || {}) as Record<string, string>,
      }));

      setDocuments(typedData);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca documentele.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc: SavedDocument) => {
    try {
      const pdfDoc = generateDocument(doc.document_type, doc.company_data, doc.extra_data);
      
      if (pdfDoc) {
        const sanitizedName = doc.document_name
          .replace(/[^a-zA-Z0-9\u0100-\u017F\s]/g, "")
          .replace(/\s+/g, "_");
        const filename = `${sanitizedName}_${new Date().toISOString().split("T")[0]}.pdf`;
        
        pdfDoc.save(filename);
        
        toast({
          title: "Document descărcat!",
          description: `${filename} a fost descărcat.`,
        });
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut descărca documentul.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    
    try {
      const { error } = await supabase
        .from("saved_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      toast({
        title: "Document șters!",
        description: "Documentul a fost șters din contul tău.",
      });
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge documentul.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Documentele Mele</h1>
              <p className="text-muted-foreground">
                Documentele salvate în contul tău
              </p>
            </div>
            <Button variant="hero" onClick={() => navigate("/documents")} className="gap-2">
              <Plus className="w-4 h-4" />
              Document Nou
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : documents.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nu ai documente salvate
                </h3>
                <p className="text-muted-foreground text-center mb-6">
                  Creează un document nou și salvează-l pentru a-l accesa mai târziu.
                </p>
                <Button variant="hero" onClick={() => navigate("/documents")} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Creează Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {documents.map((doc) => (
                <Card key={doc.id} className="glass-card hover:shadow-medium transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{doc.document_name}</CardTitle>
                          <CardDescription>
                            {doc.company_data.companyName || "Fără denumire firmă"}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(doc)}
                          className="gap-1"
                        >
                          <Download className="w-4 h-4" />
                          Descarcă
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(doc.id)}
                          disabled={deletingId === doc.id}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>CUI: {doc.company_data.cui || "—"}</span>
                      <span>•</span>
                      <span>Creat: {formatDate(doc.created_at)}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default SavedDocuments;
