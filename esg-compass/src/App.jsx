import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are an expert ESG and sustainability advisor built into a diagnostic tool called ESG Compass, created by Kennon & Co. Your role is to guide businesses through a structured but conversational diagnostic to understand where they stand on ESG maturity, then produce a clear, prioritised action plan.

You are warm, calm, and direct — like a trusted advisor, not a compliance officer. You speak plainly. You never use jargon without explaining it. You never overwhelm the user with too much at once.

## YOUR DIAGNOSTIC FLOW

Work through these stages naturally in conversation. Ask one or two questions at a time — never a list of five.

### STAGE 1: ORIENT (understand the business and the trigger)
Find out:
- What the business does, its size (rough headcount), and sector
- What's prompting this right now (B Corp certification, supplier/customer ESG questionnaire, investor due diligence, regulatory reporting like AASB S2, or just wanting to get organised)
- Whether they've done any ESG work before or are starting from scratch

### STAGE 2: RAPID MATURITY ASSESSMENT (5 pillars)
Ask signal questions across these pillars — ones that reveal actual maturity, not just intent. Go pillar by pillar, conversationally.

1. **Governance**: Does the board/leadership receive any formal ESG reporting? Is there a defined person responsible for sustainability?
2. **Environment**: Do they track energy use, emissions, or waste in any form? Have they ever calculated a carbon footprint?
3. **People**: Do they have formal HR policies covering pay equity, flexible work, wellbeing, or DEI? Do they know if they pay a living wage?
4. **Community & Supply Chain**: Do they know where their key suppliers are located? Have they ever reviewed suppliers for social or environmental risk? Do they have a community giving or partnership program?
5. **Reporting & Disclosure**: Have they produced any public sustainability communication — even a paragraph on their website? Have they ever responded to an ESG questionnaire from a customer or investor?

### STAGE 3: GENERATE THE PLAN
Once you have enough information (you don't need perfection — make reasonable inferences for a business of their type and size), produce a structured output using EXACTLY this format:

---
## ESG READINESS REPORT
**Business:** [name or description]
**Goal:** [their primary ESG destination]
**Current Maturity:** [one of: Starting Out / Building Foundations / Developing / Established]

---
### WHERE YOU STAND
[2-3 sentences of honest, specific assessment. What they're doing well. What the main gaps are. No fluff.]

---
### YOUR PRIORITY ACTION PLAN
Ordered by impact and logical sequencing — not alphabetically or by pillar.

**Priority 1: [Action title]**
*Why this first:* [1-2 sentences on why this is the highest leverage starting point]
*What's involved:* [Concrete, practical description — what they actually need to DO]
*Rough effort:* [Low / Medium / High] | *Timeframe:* [e.g., 1-4 weeks / 1-3 months]

**Priority 2: [Action title]**
*Why this matters:* [1-2 sentences]
*What's involved:* [Concrete and practical]
*Rough effort:* [Low / Medium / High] | *Timeframe:* [e.g., 1-4 weeks / 1-3 months]

[Continue for 3-5 priorities total — never more than 5. Quality over quantity.]

---
### WHAT THIS UNLOCKS
[2-3 sentences on what completing these priorities positions them for — B Corp readiness, regulatory compliance, customer confidence, investor readiness, etc.]

---
### WANT HELP EXECUTING THIS?
Kennon & Co works with businesses at exactly this stage — turning ESG readiness into real, documented, defensible practice. If you'd like to talk through your plan with Caroline, you can reach out at cazkennon@gmail.com or visit kennonco.com.

---

## IMPORTANT BEHAVIOURAL RULES
- Never ask more than 2 questions at a time
- If the user gives you enough context early, move forward — don't over-interrogate
- Make reasonable inferences for their sector and size rather than asking exhaustive questions
- Be honest about gaps — don't soften assessments to the point of uselessness
- The priority plan must be genuinely prioritised — not a laundry list. Top priority should always be the highest-leverage starting point given their specific situation
- Never use the words "leverage" or "synergy" or "holistic" or "robust"
- If they ask questions outside the diagnostic, answer them helpfully but gently guide back to the assessment
- Sound like a smart advisor, not a chatbot`;

const WELCOME_MESSAGE = {
  role: "assistant",
  content: `Welcome. I'm ESG Compass — a diagnostic tool built by Kennon & Co to help businesses understand where they stand on ESG and sustainability, and what to actually do about it.

This isn't a questionnaire with a score at the end. It's a conversation that ends with a clear, prioritised action plan — specific to your business, your situation, and what you're trying to achieve.

It takes about 10 minutes.

**To get started — tell me a bit about your business.** What do you do, roughly how many people work there, and what's brought you here today?`
};

const thinkingPhrases = [
  "Thinking through your situation…",
  "Assessing your priorities…",
  "Putting this together…",
  "Analysing your context…",
];

export default function ESGCompass() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [thinkingText, setThinkingText] = useState(thinkingPhrases[0]);
  const messagesEndRef = useRef(null);
  const thinkingInterval = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (loading) {
      let i = 0;
      thinkingInterval.current = setInterval(() => {
        i = (i + 1) % thinkingPhrases.length;
        setThinkingText(thinkingPhrases[i]);
      }, 2000);
    } else {
      clearInterval(thinkingInterval.current);
    }
    return () => clearInterval(thinkingInterval.current);
  }, [loading]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = { role: "user", content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: apiMessages,
        }),
      });

      const data = await response.json();
      const assistantContent = data.content?.[0]?.text || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "Something went wrong connecting to the advisor. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    setInput("");
  };

  const formatMessage = (text) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("## ")) {
        return <h2 key={i} style={styles.h2}>{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={i} style={styles.h3}>{line.replace("### ", "")}</h3>;
      }
      if (line.startsWith("**") && line.endsWith("**") && !line.slice(2,-2).includes("**")) {
        return <p key={i} style={styles.boldLine}>{line.slice(2, -2)}</p>;
      }
      if (line.startsWith("---")) {
        return <hr key={i} style={styles.divider} />;
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j} style={{ color: "#1a1a1a", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
        }
        const italicParts = part.split(/(\*[^*]+\*)/g);
        return italicParts.map((ip, k) => {
          if (ip.startsWith("*") && ip.endsWith("*")) {
            return <em key={k} style={{ color: "#B5341A", fontStyle: "italic" }}>{ip.slice(1, -1)}</em>;
          }
          return ip;
        });
      });
      if (line === "") return <br key={i} />;
      return <p key={i} style={styles.para}>{rendered}</p>;
    });
  };

  return (
    <div style={styles.shell}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoArea}>
            <span style={styles.logoText}>
              KENNON & C<span style={styles.logoO}>o</span>
            </span>
            <svg viewBox="0 0 130 14" style={{ width: 130, height: 14, display: "block", marginTop: 2, marginLeft: -4 }}>
              <path d="M4,9 Q32,3 65,7 Q98,11 126,5" stroke="#B5341A" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M112,5 L126,5 L120,10" stroke="#B5341A" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={styles.productLabel}>
            <span style={styles.productName}>ESG COMPASS</span>
          </div>
        </div>
        <div style={styles.headerRule} />
      </header>

      {/* Yellow intro bar */}
      <div style={styles.introBar}>
        <span style={styles.introText}>KNOW WHERE YOU STAND. KNOW WHAT TO DO NEXT.</span>
      </div>

      {/* Chat */}
      <main style={styles.main}>
        <div style={styles.chatContainer}>
          {messages.map((msg, idx) => (
            <div
              key={idx}
              style={msg.role === "user" ? styles.userBubbleWrap : styles.assistantBubbleWrap}
            >
              {msg.role === "assistant" && (
                <div style={styles.avatar}>K</div>
              )}
              <div style={msg.role === "user" ? styles.userBubble : styles.assistantBubble}>
                {msg.role === "assistant"
                  ? formatMessage(msg.content)
                  : <p style={{ ...styles.para, color: "#fff", marginBottom: 0 }}>{msg.content}</p>}
              </div>
            </div>
          ))}

          {loading && (
            <div style={styles.assistantBubbleWrap}>
              <div style={styles.avatar}>K</div>
              <div style={styles.thinkingBubble}>
                <span style={styles.thinkingText}>{thinkingText}</span>
                <span style={styles.dots}>
                  <span style={{ ...styles.dot, animationDelay: "0s" }}>.</span>
                  <span style={{ ...styles.dot, animationDelay: "0.2s" }}>.</span>
                  <span style={{ ...styles.dot, animationDelay: "0.4s" }}>.</span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Footer input */}
      <footer style={styles.footer}>
        <div style={styles.footerRule} />
        <div style={styles.inputRow}>
          <textarea
            style={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your response…"
            rows={1}
            disabled={loading}
          />
          <button
            style={{ ...styles.sendBtn, opacity: loading || !input.trim() ? 0.3 : 1 }}
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            ↑
          </button>
        </div>
        <div style={styles.footerMeta}>
          <span style={styles.footerNote}>ENTER TO SEND · SHIFT+ENTER FOR NEW LINE</span>
          <button style={styles.resetBtn} onClick={handleReset}>Start over</button>
        </div>
        <div style={styles.disclaimer}>
          <span style={styles.disclaimerIcon}>🔒</span>
          <span>This tool is powered by AI. No conversation data is stored by Kennon & Co. Please avoid sharing sensitive commercial or personal information.</span>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,300;0,400;0,600;1,300&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #fff; }
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        textarea:focus { outline: none; border-color: #1a1a1a !important; }
        textarea { resize: none; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }
      `}</style>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#ffffff",
    fontFamily: "'Lato', sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: "#fff",
    paddingTop: 20,
  },
  headerInner: {
    maxWidth: 820,
    margin: "0 auto",
    padding: "0 32px 14px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  logoArea: {
    display: "flex",
    flexDirection: "column",
  },
  logoText: {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: 20,
    fontWeight: 400,
    letterSpacing: "0.14em",
    color: "#1a1a1a",
    lineHeight: 1,
  },
  logoO: {
    fontStyle: "italic",
    fontWeight: 300,
  },
  productLabel: {
    paddingBottom: 6,
  },
  productName: {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: 10,
    letterSpacing: "0.22em",
    color: "#B5341A",
    fontWeight: 600,
  },
  headerRule: {
    height: 1,
    background: "#1a1a1a",
  },
  introBar: {
    background: "#F5C842",
    padding: "10px 32px",
    textAlign: "center",
  },
  introText: {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: 10,
    letterSpacing: "0.2em",
    color: "#1a1a1a",
    fontWeight: 600,
  },
  main: {
    flex: 1,
    overflowY: "auto",
    padding: "28px 24px",
  },
  chatContainer: {
    maxWidth: 756,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  assistantBubbleWrap: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    animation: "fadeUp 0.3s ease",
  },
  userBubbleWrap: {
    display: "flex",
    justifyContent: "flex-end",
    animation: "fadeUp 0.3s ease",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#F5C842",
    color: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.05em",
    flexShrink: 0,
    marginTop: 2,
  },
  assistantBubble: {
    background: "#fff",
    border: "1px solid #e8e8e8",
    borderRadius: "2px 14px 14px 14px",
    padding: "18px 22px",
    maxWidth: 640,
    boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
    color: "#1a1a1a",
    fontSize: 14.5,
    lineHeight: 1.7,
  },
  userBubble: {
    background: "#1a1a1a",
    borderRadius: "14px 2px 14px 14px",
    padding: "14px 20px",
    maxWidth: 520,
    color: "#fff",
    fontSize: 14.5,
    lineHeight: 1.65,
  },
  thinkingBubble: {
    background: "#fffbea",
    border: "1px solid #F5C842",
    borderRadius: "2px 14px 14px 14px",
    padding: "14px 20px",
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontStyle: "italic",
    color: "#7a6000",
  },
  thinkingText: { color: "#7a6000" },
  dots: { display: "flex", gap: 1 },
  dot: {
    display: "inline-block",
    animation: "dotPulse 1.4s infinite ease-in-out",
    fontSize: 20,
    color: "#B5341A",
    lineHeight: 1,
  },
  footer: {
    background: "#fff",
    padding: "0 24px 20px",
  },
  footerRule: {
    height: 1,
    background: "#1a1a1a",
    marginBottom: 16,
  },
  inputRow: {
    maxWidth: 756,
    margin: "0 auto",
    display: "flex",
    gap: 10,
    alignItems: "flex-end",
  },
  textarea: {
    flex: 1,
    background: "#f7f7f7",
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    padding: "12px 16px",
    fontFamily: "'Lato', sans-serif",
    fontSize: 14.5,
    color: "#1a1a1a",
    lineHeight: 1.5,
    transition: "border-color 0.2s",
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    background: "#1a1a1a",
    color: "#F5C842",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "opacity 0.2s",
    flexShrink: 0,
    fontWeight: 700,
  },
  footerMeta: {
    maxWidth: 756,
    margin: "8px auto 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerNote: {
    fontSize: 9,
    color: "#bbb",
    letterSpacing: "0.1em",
    fontFamily: "'Josefin Sans', sans-serif",
  },
  disclaimer: {
    maxWidth: 756,
    margin: "10px auto 0",
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    fontSize: 10.5,
    color: "#bbb",
    fontFamily: "'Josefin Sans', sans-serif",
    letterSpacing: "0.03em",
    lineHeight: 1.6,
  },
  disclaimerIcon: {
    fontSize: 10,
    flexShrink: 0,
    marginTop: 1,
  },
  resetBtn: {
    background: "none",
    border: "none",
    color: "#B5341A",
    fontSize: 11,
    cursor: "pointer",
    textDecoration: "underline",
    fontFamily: "'Josefin Sans', sans-serif",
    letterSpacing: "0.06em",
  },
  para: {
    marginBottom: 6,
    lineHeight: 1.7,
    color: "#1a1a1a",
  },
  h2: {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: 15,
    fontWeight: 600,
    color: "#1a1a1a",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    marginBottom: 12,
    marginTop: 8,
  },
  h3: {
    fontFamily: "'Josefin Sans', sans-serif",
    fontSize: 9,
    fontWeight: 600,
    color: "#B5341A",
    marginBottom: 8,
    marginTop: 16,
    textTransform: "uppercase",
    letterSpacing: "0.2em",
  },
  boldLine: {
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: 4,
    fontSize: 14.5,
  },
  divider: {
    border: "none",
    borderTop: "1px solid #efefef",
    margin: "14px 0",
  },
};
