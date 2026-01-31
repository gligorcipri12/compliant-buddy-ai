import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Bell } from "lucide-react";

const QuickActions = () => {
  return (
    <div className="glass-card-strong rounded-xl p-5">
      <h3 className="font-semibold text-foreground mb-4">Acțiuni Rapide</h3>
      <div className="space-y-2">
        <Link to="/documents">
          <Button variant="outline" className="w-full justify-start gap-2">
            <FileText className="w-4 h-4" />
            Generează CIM nou
          </Button>
        </Link>
        <Link to="/chat">
          <Button variant="outline" className="w-full justify-start gap-2">
            <Shield className="w-4 h-4" />
            Verifică GDPR
          </Button>
        </Link>
        <Button variant="outline" className="w-full justify-start gap-2" disabled>
          <Bell className="w-4 h-4" />
          Setează reminder
        </Button>
      </div>
    </div>
  );
};

export default QuickActions;
