import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Shield, MessageSquare, FileText, LayoutDashboard, FolderOpen, LogOut, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import EditCompanyDialog from "@/components/settings/EditCompanyDialog";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: "Acasă", href: "/", icon: null },
    { label: "Chat AI", href: "/chat", icon: MessageSquare },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Documente", href: "/documents", icon: FileText },
    ...(user ? [{ label: "Salvate", href: "/saved-documents", icon: FolderOpen }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card-strong">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-medium group-hover:shadow-strong transition-all duration-300">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Compliance<span className="text-accent">Bot</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive(item.href) ? "secondary" : "ghost"}
                  className={`gap-2 ${isActive(item.href) ? "bg-accent/10 text-accent" : ""}`}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <EditCompanyDialog
                  trigger={
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Building2 className="w-4 h-4" />
                      Firmă
                    </Button>
                  }
                />
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Deconectare
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">
                    Autentificare
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    Încearcă Gratuit
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} to={item.href} onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-2 ${isActive(item.href) ? "bg-accent/10 text-accent" : ""}`}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </Button>
                </Link>
              ))}
              <div className="flex gap-2 pt-4 border-t border-border mt-2">
                {user ? (
                  <Button variant="ghost" className="flex-1 gap-2" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    Deconectare
                  </Button>
                ) : (
                  <>
                    <Link to="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Autentificare
                      </Button>
                    </Link>
                    <Link to="/auth" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="hero" className="w-full">
                        Încearcă Gratuit
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
