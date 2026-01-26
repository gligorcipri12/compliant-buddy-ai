import { Link } from "react-router-dom";
import { Shield, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Shield className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">
                Compliance<span className="text-accent">Bot</span>
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Asistentul AI pentru conformitatea legală a micro-întreprinderilor și PFA-urilor din România.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Produse</h4>
            <ul className="space-y-3">
              {["Chat AI", "Generator Documente", "Dashboard", "Knowledge Base"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Resurse</h4>
            <ul className="space-y-3">
              {["GDPR Guide", "Legislație Fiscală", "Codul Muncii", "FAQ", "Blog"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-primary-foreground/70 hover:text-accent transition-colors text-sm">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Mail className="w-4 h-4" />
                contact@compliancebot.ro
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <Phone className="w-4 h-4" />
                +40 700 000 000
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/70 text-sm">
                <MapPin className="w-4 h-4" />
                București, România
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/50 text-sm">
            © 2024 ComplianceBot. Toate drepturile rezervate.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
              Termeni și Condiții
            </Link>
            <Link to="#" className="text-primary-foreground/50 hover:text-accent text-sm transition-colors">
              Politica de Confidențialitate
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
