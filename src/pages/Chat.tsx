import { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles, FileText, Bell, HelpCircle, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: FileText, label: "Generează document GDPR", action: "Vreau să generez o politică de confidențialitate GDPR pentru firma mea." },
  { icon: HelpCircle, label: "Întreabă despre TVA", action: "Care sunt pragurile pentru înregistrarea la TVA?" },
  { icon: Bell, label: "Verifică obligații fiscale", action: "Ce declarații fiscale trebuie să depun luna aceasta?" },
];

const sampleResponses: Record<string, string> = {
  default: "Bună! Sunt ComplianceBot, asistentul tău pentru conformitate legală. Cum te pot ajuta astăzi cu GDPR, TVA, contracte sau obligații fiscale?",
  gdpr: "Da, conform Regulamentului GDPR, orice entitate care prelucrează date personale trebuie să aibă:\n\n✅ **Politică de confidențialitate** - care să explice ce date colectezi și cum le folosești\n\n✅ **Registru de prelucrare** - document intern cu toate operațiunile de procesare\n\n✅ **Contract GDPR cu angajații** - pentru protecția datelor pe care le accesează\n\nVrei să generez aceste documente pentru tine? Pot crea un pachet complet personalizat pentru firma ta.",
  tva: "Conform legislației actuale din România, pragurile pentru TVA sunt:\n\n📊 **Plafonul de scutire**: 300.000 RON/an cifră de afaceri\n\nDacă depășești acest plafon, ai **10 zile** pentru înregistrare la TVA.\n\n⚠️ **Atenție**: Anumite activități necesită înregistrare obligatorie, indiferent de cifra de afaceri.\n\nVrei să verific situația specifică a firmei tale?",
  fiscal: "Pentru luna curentă, iată obligațiile fiscale principale:\n\n📅 **25 ale lunii**:\n- Declarația 100 (impozit pe venit)\n- Declarația 112 (contribuții sociale)\n- Plată TVA (dacă ești plătitor)\n\n📅 **Ultima zi a lunii**:\n- Plată salarii\n\nPot să setez remindere automate pentru aceste deadline-uri. Vrei?",
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: sampleResponses.default,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    if (lowerMessage.includes("gdpr") || lowerMessage.includes("confidențialitate") || lowerMessage.includes("angajați")) {
      return sampleResponses.gdpr;
    }
    if (lowerMessage.includes("tva") || lowerMessage.includes("plafon") || lowerMessage.includes("înregistrare")) {
      return sampleResponses.tva;
    }
    if (lowerMessage.includes("fiscal") || lowerMessage.includes("declarații") || lowerMessage.includes("obligații")) {
      return sampleResponses.fiscal;
    }
    return "Înțeleg întrebarea ta. Pot să te ajut cu informații despre GDPR, TVA, contracte de muncă sau obligații fiscale. Ce anume te interesează mai mult?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getResponse(input),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 pt-16 flex flex-col">
        <div className="container mx-auto px-4 py-6 flex-1 flex flex-col max-w-4xl">
          {/* Chat header */}
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">ComplianceBot AI</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 bg-success rounded-full" />
                Online • Gata să te ajute
              </p>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto py-6 space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-slide-up ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-accent" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 ${
                    message.role === "user"
                      ? "chat-bubble-user"
                      : "chat-bubble-bot"
                  }`}
                >
                  <p className="whitespace-pre-line text-sm leading-relaxed">
                    {message.content}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div className="chat-bubble-bot p-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span className="text-sm text-muted-foreground">Se gândește...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          {messages.length === 1 && (
            <div className="py-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Sugestii rapide
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="pt-4 border-t border-border">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Scrie o întrebare despre GDPR, TVA, contracte..."
                className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground"
              />
              <Button
                variant="hero"
                size="icon"
                className="w-12 h-12"
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              ComplianceBot poate face greșeli. Verificați informațiile importante cu un specialist.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
