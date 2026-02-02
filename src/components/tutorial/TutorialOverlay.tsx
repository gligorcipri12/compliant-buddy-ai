import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TutorialStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: "[data-tutorial='dashboard-link']",
    title: "Dashboard Compliance",
    description:
      "Aici găsești o vedere de ansamblu asupra tuturor obligațiilor tale de conformitate. Poți vedea scorul compliance, sarcinile în așteptare și deadline-urile importante.",
    position: "bottom",
  },
  {
    target: "[data-tutorial='documents-link']",
    title: "Generator Documente",
    description:
      "Generează documente legale în câteva secunde: contracte de muncă, politici GDPR, declarații și multe altele. Toate personalizate cu datele firmei tale.",
    position: "bottom",
  },
  {
    target: "[data-tutorial='chat-link']",
    title: "Asistent AI",
    description:
      "Întreabă orice despre compliance, legislație sau obligațiile firmei tale. Asistentul nostru AI te va ghida cu răspunsuri personalizate.",
    position: "bottom",
  },
  {
    target: "[data-tutorial='calendar-link']",
    title: "Calendar Deadline-uri",
    description:
      "Vizualizează toate termenele limită într-un calendar interactiv. Nu vei mai rata niciun deadline important!",
    position: "bottom",
  },
  {
    target: "[data-tutorial='theme-toggle']",
    title: "Personalizare Temă",
    description:
      "Alege între modul luminos și întunecat pentru o experiență confortabilă oricând.",
    position: "left",
  },
  {
    target: "[data-tutorial='company-button']",
    title: "Setări Firmă",
    description:
      "Modifică oricând datele firmei tale. Acestea vor fi folosite pentru completarea automată a documentelor generate.",
    position: "bottom",
  },
];

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const TutorialOverlay = ({ isOpen, onClose, onComplete }: TutorialOverlayProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const updateTargetPosition = () => {
      const step = TUTORIAL_STEPS[currentStep];
      const target = document.querySelector(step.target);

      if (target) {
        const rect = target.getBoundingClientRect();
        setTargetRect(rect);

        // Scroll element into view
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        setTargetRect(null);
      }
    };

    updateTargetPosition();
    window.addEventListener("resize", updateTargetPosition);
    window.addEventListener("scroll", updateTargetPosition);

    return () => {
      window.removeEventListener("resize", updateTargetPosition);
      window.removeEventListener("scroll", updateTargetPosition);
    };
  }, [isOpen, currentStep]);

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) {
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (step.position) {
      case "bottom":
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case "top":
        return {
          top: `${targetRect.top - tooltipHeight - padding}px`,
          left: `${Math.max(padding, Math.min(targetRect.left + targetRect.width / 2 - tooltipWidth / 2, window.innerWidth - tooltipWidth - padding))}px`,
        };
      case "left":
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.left - tooltipWidth - padding}px`,
        };
      case "right":
        return {
          top: `${targetRect.top + targetRect.height / 2 - tooltipHeight / 2}px`,
          left: `${targetRect.right + padding}px`,
        };
      default:
        return {
          top: `${targetRect.bottom + padding}px`,
          left: `${targetRect.left + targetRect.width / 2 - tooltipWidth / 2}px`,
        };
    }
  };

  const tooltipPosition = getTooltipPosition();

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Spotlight on target */}
      {targetRect && (
        <div
          className="absolute z-[101] ring-4 ring-accent rounded-lg transition-all duration-300"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
          }}
        />
      )}

      {/* Tooltip Card */}
      <Card
        className="absolute z-[102] w-80 shadow-strong animate-fade-in"
        style={tooltipPosition}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{step.title}</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleSkip}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription className="text-xs">
            Pas {currentStep + 1} din {TUTORIAL_STEPS.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{step.description}</p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1 mb-4">
            {TUTORIAL_STEPS.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  index === currentStep ? "bg-accent" : "bg-muted"
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Înapoi
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Omite
            </Button>
            <Button size="sm" onClick={handleNext}>
              {isLastStep ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Finalizează
                </>
              ) : (
                <>
                  Următorul
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>,
    document.body
  );
};

// Hook for managing tutorial state
export const useTutorial = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(() => {
    return localStorage.getItem("tutorial_completed") === "true";
  });

  const startTutorial = () => {
    setIsOpen(true);
  };

  const closeTutorial = () => {
    setIsOpen(false);
  };

  const completeTutorial = () => {
    setIsOpen(false);
    setHasCompleted(true);
    localStorage.setItem("tutorial_completed", "true");
  };

  const resetTutorial = () => {
    setHasCompleted(false);
    localStorage.removeItem("tutorial_completed");
  };

  return {
    isOpen,
    hasCompleted,
    startTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
  };
};
