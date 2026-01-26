import { MessageSquare, FileText, LayoutDashboard, Bell, Search, Shield } from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat AI Inteligent",
    description: "Pune întrebări despre GDPR, TVA, contracte și primești răspunsuri clare, adaptate situației tale.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: FileText,
    title: "Generator Documente",
    description: "Creează politici GDPR, contracte de muncă, CIM și alte documente legale în câteva minute.",
    color: "bg-success/10 text-success",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Compliance",
    description: "Vizualizează statusul conformității: GDPR, TVA, contracte angajați - totul într-un singur loc.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: Bell,
    title: "Notificări Smart",
    description: "Primești alerte pentru deadline-uri: declarație 112, plată TVA, expirare contracte.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Search,
    title: "Bază de Cunoștințe",
    description: "Caută în legislația actualizată: GDPR, Codul Muncii, legislație fiscală - cu explicații simple.",
    color: "bg-danger/10 text-danger",
  },
  {
    icon: Shield,
    title: "Securitate Maximă",
    description: "Datele tale sunt criptate și stocate în siguranță. Respectăm cele mai înalte standarde de securitate.",
    color: "bg-accent/10 text-accent",
  },
];

const Features = () => {
  return (
    <section className="py-24 bg-background relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--accent)/0.05)_0%,transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Funcționalități</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Tot ce ai nevoie pentru compliance
          </h2>
          <p className="text-muted-foreground text-lg">
            Simplifică-ți obligațiile legale cu ajutorul inteligenței artificiale
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl glass-card hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
