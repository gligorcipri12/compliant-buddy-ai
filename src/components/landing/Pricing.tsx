import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Gratuit",
    price: "0",
    description: "Pentru a explora platforma",
    features: [
      "10 întrebări AI / lună",
      "1 document generat / lună",
      "Dashboard basic",
      "Email support",
    ],
    cta: "Începe Gratuit",
    popular: false,
  },
  {
    name: "Starter",
    price: "149",
    description: "Pentru micro-întreprinderi",
    features: [
      "100 întrebări AI / lună",
      "10 documente generate / lună",
      "Dashboard complet",
      "Calendar deadline-uri",
      "Notificări email",
      "Support prioritar",
    ],
    cta: "Alege Starter",
    popular: true,
  },
  {
    name: "Pro",
    price: "429",
    description: "Pentru afaceri în creștere",
    features: [
      "Întrebări nelimitate",
      "50 documente / lună",
      "Dashboard avansat",
      "Integrări API",
      "Multiple utilizatori",
      "Support dedicat",
      "Consultanță lunară",
    ],
    cta: "Alege Pro",
    popular: false,
  },
];

const Pricing = () => {
  return (
    <section className="py-24 bg-muted/30 relative">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-accent font-semibold text-sm uppercase tracking-wider">Prețuri</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            Planuri pentru orice afacere
          </h2>
          <p className="text-muted-foreground text-lg">
            Alege planul potrivit pentru nevoile tale. Poți face upgrade oricând.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl transition-all duration-300 ${
                plan.popular
                  ? "bg-primary text-primary-foreground shadow-strong scale-105 z-10"
                  : "glass-card-strong hover:shadow-medium"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-accent-foreground rounded-full text-sm font-semibold flex items-center gap-1 shadow-medium">
                  <Sparkles className="w-4 h-4" />
                  Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? "" : "text-foreground"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-4 ${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className={`${plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    RON/lună
                  </span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      plan.popular ? "bg-accent/20" : "bg-accent/10"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.popular ? "text-accent" : "text-accent"}`} />
                    </div>
                    <span className={`${plan.popular ? "text-primary-foreground/90" : "text-muted-foreground"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "outline"}
                size="lg"
                className="w-full"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
