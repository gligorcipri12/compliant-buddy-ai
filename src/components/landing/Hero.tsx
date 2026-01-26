import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, FileCheck, Bot, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden gradient-bg-animated">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span>Powered by AI • Actualizat cu legislația 2024</span>
          </div>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Compliance Simplificat pentru{" "}
            <span className="gradient-text">Afacerea Ta</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Asistentul AI care te ghidează prin GDPR, TVA, contracte și obligații fiscale. 
            Generează documente conforme în minute, nu ore.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <Link to="/chat">
              <Button variant="hero" size="xl" className="group">
                Începe Conversația
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/documents">
              <Button variant="glass" size="xl">
                Generează Document
              </Button>
            </Link>
          </div>

          {/* Feature badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
            {[
              { icon: Shield, label: "GDPR Compliant", desc: "Politici și registre" },
              { icon: FileCheck, label: "Documente Generate", desc: "CIM, contracte, facturi" },
              { icon: Bot, label: "AI Conversațional", desc: "Răspunsuri instant" },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                  <feature.icon className="w-6 h-6 text-accent" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">{feature.label}</p>
                  <p className="text-sm text-white/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
