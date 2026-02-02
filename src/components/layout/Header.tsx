import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Shield,
  MessageSquare,
  FileText,
  LayoutDashboard,
  FolderOpen,
  LogOut,
  Building2,
  Calendar,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import EditCompanyDialog from "@/components/settings/EditCompanyDialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { TutorialOverlay, useTutorial } from "@/components/tutorial/TutorialOverlay";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isOpen: isTutorialOpen, startTutorial, closeTutorial, completeTutorial } = useTutorial();

  const navItems = [
    { label: "Acasă", href: "/", icon: null, tutorial: null },
    { label: "Chat AI", href: "/chat", icon: MessageSquare, tutorial: "chat-link" },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, tutorial: "dashboard-link" },
    { label: "Documente", href: "/documents", icon: FileText, tutorial: "documents-link" },
    { label: "Calendar", href: "/calendar", icon: Calendar, tutorial: "calendar-link" },
    ...(user
      ? [
          { label: "Analiză", href: "/analytics", icon: BarChart3, tutorial: "analytics-link" },
          { label: "Salvate", href: "/saved-documents", icon: FolderOpen, tutorial: null },
        ]
      : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
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
                    data-tutorial={item.tutorial}
                  >
                    {item.icon && <item.icon className="w-4 h-4" />}
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>

            {/* Auth Buttons & Theme Toggle */}
            <div className="hidden md:flex items-center gap-2">
              <div data-tutorial="theme-toggle">
                <ThemeToggle />
              </div>
              
              {user ? (
                <>
                  <div data-tutorial="company-button">
                    <EditCompanyDialog
                      trigger={
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Building2 className="w-4 h-4" />
                          Firmă
                        </Button>
                      }
                    />
                  </div>
                  <Link to="/settings">
                    <Button variant="ghost" size="icon">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={startTutorial}
                    title="Tutorial"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground max-w-[120px] truncate">
                    {user.email}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2">
                    <LogOut className="w-4 h-4" />
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
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-slide-up">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link key={item.href} to={item.href} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={isActive(item.href) ? "secondary" : "ghost"}
                      className={`w-full justify-start gap-2 ${
                        isActive(item.href) ? "bg-accent/10 text-accent" : ""
                      }`}
                    >
                      {item.icon && <item.icon className="w-4 h-4" />}
                      {item.label}
                    </Button>
                  </Link>
                ))}
                {user && (
                  <Link to="/settings" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <Settings className="w-4 h-4" />
                      Setări
                    </Button>
                  </Link>
                )}
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

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={isTutorialOpen}
        onClose={closeTutorial}
        onComplete={completeTutorial}
      />
    </>
  );
};

export default Header;
