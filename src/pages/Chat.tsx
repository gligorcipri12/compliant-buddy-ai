import { useState, useRef, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Send, Bot, User, Sparkles, FileText, Bell, HelpCircle, Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/compliance-chat`;

const quickActions = [
  { icon: FileText, label: "Generează document GDPR", action: "Vreau să generez o politică de confidențialitate GDPR pentru firma mea." },
  { icon: HelpCircle, label: "Întreabă despre TVA", action: "Care sunt pragurile pentru înregistrarea la TVA în România?" },
  { icon: Bell, label: "Verifică obligații fiscale", action: "Ce declarații fiscale trebuie să depun luna aceasta ca micro-întreprindere?" },
];

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Bună! 👋 Sunt **ComplianceBot**, asistentul tău pentru conformitate legală.\n\nTe pot ajuta cu:\n- 📋 **GDPR** și protecția datelor\n- 💰 **TVA** și fiscalitate\n- 📝 **Contracte** de muncă\n- ⚖️ **Obligații** fiscale\n\nCum te pot ajuta astăzi?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessages: { role: string; content: string }[]) => {
    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 429) {
        throw new Error("Limită de cereri depășită. Te rugăm să încerci din nou mai târziu.");
      }
      if (response.status === 402) {
        throw new Error("Credite insuficiente. Te rugăm să adaugi credite în workspace.");
      }
      throw new Error(errorData.error || "Eroare la conectarea cu AI.");
    }

    if (!response.body) {
      throw new Error("No response body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            // Update the last assistant message
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && last.id.startsWith("streaming-")) {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return prev;
            });
          }
        } catch {
          // Incomplete JSON, put it back and wait for more data
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
          }
        } catch { /* ignore */ }
      }
    }

    return assistantContent;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    // Create placeholder for streaming assistant message
    const streamingMessage: Message = {
      id: `streaming-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage, streamingMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare messages for API (excluding the initial greeting and streaming placeholder)
      const apiMessages = [...messages.filter(m => m.id !== "1"), userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }));

      const finalContent = await streamChat(apiMessages);

      // Update the streaming message with final content and proper ID
      setMessages(prev => 
        prev.map(m => 
          m.id === streamingMessage.id 
            ? { ...m, id: `final-${Date.now()}`, content: finalContent } 
            : m
        )
      );
    } catch (error) {
      console.error("Chat error:", error);
      
      // Remove the streaming message on error
      setMessages(prev => prev.filter(m => m.id !== streamingMessage.id));
      
      toast({
        title: "Eroare",
        description: error instanceof Error ? error.message : "Nu s-a putut obține răspunsul.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                Online • Powered by AI
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
                  {message.role === "assistant" ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown>{message.content || "..."}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line text-sm leading-relaxed">
                      {message.content}
                    </p>
                  )}
                </div>
                {message.role === "user" && (
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && messages[messages.length - 1]?.content === "" && (
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
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Scrie o întrebare despre GDPR, TVA, contracte..."
                className="flex-1 px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <Button
                variant="hero"
                size="icon"
                className="w-12 h-12"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
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
