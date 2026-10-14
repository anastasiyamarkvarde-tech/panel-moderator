import React, { useState, useRef, useCallback, useEffect } from 'react';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface Participant {
  id: string;
  name: string;
  org: string;
  lens: string;
  contribution: string;
}

interface FlowSegment {
  id: string;
  time: string;
  title: string;
  purpose: string;
  leadVoices: string;
  questions: string;
}

interface PanelData {
  title: string;
  event: string;
  dateTime: string;
  venue: string;
  whyPanel: string;
  objectives: string[];
  desiredOutcome: string;
  participants: Participant[];
  flow: FlowSegment[];
}

interface InlineSuggestion {
  questions: string[];
  note: string;
  speakerIds: string[];
}

type AgentStatus = 'idle' | 'running' | 'done';

/* ─────────────────────────────────────────────
   Speaker photo map (id → /speakers/name.jpg)
───────────────────────────────────────────── */
const SPEAKER_PHOTOS: Record<string, string> = {
  p1: '/speakers/kelle.jpg',
  p2: '/speakers/marie.jpg',
  p3: '/speakers/melindah.jpg',
  p4: '/speakers/dana.jpg',
  p5: '/speakers/jessica.jpg',
};

/* ─────────────────────────────────────────────
   Speaker colour palette (for inline suggestions)
───────────────────────────────────────────── */
const SPEAKER_COLORS = [
  { bg: 'bg-rose-50',   border: 'border-rose-300',   text: 'text-rose-800',   dot: 'bg-rose-400',   ring: 'ring-rose-300'   },
  { bg: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-800', dot: 'bg-indigo-400', ring: 'ring-indigo-300' },
  { bg: 'bg-teal-50',   border: 'border-teal-300',   text: 'text-teal-800',   dot: 'bg-teal-400',   ring: 'ring-teal-300'   },
  { bg: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-800', dot: 'bg-violet-400', ring: 'ring-violet-300' },
  { bg: 'bg-amber-50',  border: 'border-amber-300',  text: 'text-amber-800',  dot: 'bg-amber-400',  ring: 'ring-amber-300'  },
];

/* ─────────────────────────────────────────────
   Default BioEurope 2026 content
───────────────────────────────────────────── */
const DEFAULT_PANEL: PanelData = {
  title: "Women's Health: Healthcare's Largest Underserved Market and Biggest Growth Opportunity",
  event: "BIO-Europe 2026",
  dateTime: "Tuesday 10 November 2026 · 11:15–12:15",
  venue: "The Big Picture Stage, Koelnmesse, Cologne",
  whyPanel: "Women's health innovation can stall at several points: the biology may be poorly understood, the evidence may be incomplete, regulatory and ethical practice may limit what is studied, the value may be hard to demonstrate, and capital or health systems may not support adoption. The panel follows that pathway and asks where decisions need to change.",
  objectives: [
    "Trace the route from biological discovery and evidence generation to regulation, investment and patient access.",
    "Identify the specific gaps and hand-offs that slow progress, rather than treating women's health as one undifferentiated problem.",
    "Clarify what pharma, regulators, investors, public finance and commercial partners need from one another.",
    "Give founders and decision-makers practical priorities they can act on."
  ],
  desiredOutcome: "The audience leaves with two or three clear changes that would improve the path from women's health research to products that are adopted in clinical practice, plus a sharper understanding of who must act.",
  participants: [
    {
      id: 'p1',
      name: 'Kelle Moley',
      org: 'Eli Lilly and Company',
      lens: 'Biology and new medicines',
      contribution: 'VP, Women\'s Health and Early Clinical Development. Which mechanisms and conditions are ready for development, where foundational biology is still missing, and what makes early science credible to pharma.'
    },
    {
      id: 'p2',
      name: 'Marie Teil',
      org: 'UCB',
      lens: 'Clinical evidence and R&D practice',
      contribution: 'Global Head of Special Patient Populations. How trial design, pregnancy/lactation evidence and inclusion of women can improve the evidence base and inform regulatory decisions.'
    },
    {
      id: 'p3',
      name: 'Melindah Sharma',
      org: 'Dassault Systèmes',
      lens: 'Development, implementation and access',
      contribution: 'Global Senior VP, Life Sciences & Healthcare, Strategic Engagement & New Growth. How evidence and technology translate into real-world care across health systems and markets.'
    },
    {
      id: 'p4',
      name: 'Dana Burduja',
      org: 'European Investment Bank (EIB)',
      lens: 'Economic value and public finance',
      contribution: 'Head of Life Sciences and Health. How value is assessed, which outcomes are missed, and where public finance or public–private partnerships can address gaps.'
    },
    {
      id: 'p5',
      name: 'Jessica Federer',
      org: "Women's Health Fund",
      lens: 'Private capital and governance',
      contribution: 'Managing Director. What makes a company investable, how investors evaluate risk, and how ethics and institutional practice shape what gets studied.'
    }
  ],
  flow: [
    {
      id: 'f1',
      time: '00–04 min',
      title: 'Opening: define the problem',
      purpose: 'Frame women\'s health broadly and explain why the panel follows the full development pathway.',
      leadVoices: 'Anastasiya opens; introduce each panellist by the role they play in this pathway.',
      questions: 'Where does the path from a relevant scientific finding to a product that reaches patients most often break down?'
    },
    {
      id: 'f2',
      time: '04–17 min',
      title: '1. Biology → evidence generation',
      purpose: 'Start with what is known, what remains unknown, and what evidence is needed to make a development decision.',
      leadVoices: 'Kelle leads on biology and discovery; Marie on trial evidence and R&D practice.',
      questions: `Kelle: Which women's health conditions or biological mechanisms are ready for serious drug development today, and where is the underlying biology still too weak?\n\nMarie: Where do current trial designs fail to capture how a condition or treatment affects women differently? What specific changes to protocols or evidence plans would make the biggest difference?\n\nCross: What should a startup bring to a pharma partner to show that its finding is robust enough to justify further development?`
    },
    {
      id: 'f3',
      time: '17–28 min',
      title: '2. Evidence → regulatory and ethical decisions',
      purpose: 'Explore how evidence standards, risk tolerance and research practice shape what can be learned and who is included.',
      leadVoices: 'Marie leads on R&D practice; Jessica brings the investor, governance and ethics perspective.',
      questions: `Marie: What makes it difficult to generate useful evidence in pregnancy and lactation, and which changes can companies make now?\n\nJessica: When pregnant or breastfeeding women are excluded from studies, how much is driven by genuine scientific uncertainty, and how much by liability, convention or institutional practice?\n\nCross: Who needs to change the protocol, guidance or internal incentives for better evidence to become routine?`
    },
    {
      id: 'f4',
      time: '28–39 min',
      title: '3. Evidence → value, adoption and access',
      purpose: 'Test whether evidence translates into recognised value, reimbursement and use in different health systems.',
      leadVoices: 'Dana leads on economic evaluation and public finance; Melindah on implementation and market access.',
      questions: `Dana: Which benefits are standard health-economic evaluations least likely to capture in women's health—productivity, caregiving or effects over time—and how does that affect funding decisions?\n\nMelindah: Even when the evidence is convincing, what most often prevents adoption in practice: clinical workflow, reimbursement, procurement, local infrastructure or something else?\n\nCross: What must a company establish early about the payer, user and care pathway to avoid proving clinical value without creating a route to adoption?`
    },
    {
      id: 'f5',
      time: '39–49 min',
      title: '4. Value and adoption → capital',
      purpose: 'Examine how evidence, commercial readiness and uncertainty affect private and public investment.',
      leadVoices: 'Jessica leads on private capital; Dana on public finance; Kelle adds the discovery perspective.',
      questions: `Jessica: What separates an important unmet need from an investable women's health company?\n\nDana: Where can public finance, guarantees, venture debt or blended finance help bridge a gap that private capital is unlikely to fund alone?\n\nKelle: Where might a different funding model be needed to support promising science before it reaches a conventional pharma or venture threshold?`
    },
    {
      id: 'f6',
      time: '49–60 min',
      title: '5. Audience Q&A + Close',
      purpose: 'Turn the pathway into a small number of priorities. End with individual actions.',
      leadVoices: 'All panellists; moderator directs questions to the person best placed to answer.',
      questions: `Lightning round: If you could change one decision in this pathway—which would have the greatest effect, and who has the power to make it?\n\nAnastasiya closes by naming the key hand-off the panel believes needs attention.`
    }
  ]
};

/* ─────────────────────────────────────────────
   Editable field component
───────────────────────────────────────────── */
function EditableText({
  value,
  onChange,
  className = '',
  multiline = false,
  placeholder = 'Click to edit…'
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (ref.current && !focused) {
      ref.current.textContent = value;
    }
  }, [value, focused]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        setFocused(false);
        onChange(e.currentTarget.textContent || '');
      }}
      className={`outline-none focus:ring-1 focus:ring-amber-400 focus:ring-offset-1 rounded px-0.5 -mx-0.5 transition-all cursor-text ${className} ${!value ? 'text-stone-300' : ''}`}
      data-placeholder={placeholder}
      style={{ minHeight: multiline ? '2.5rem' : undefined }}
    />
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function PanelModerator() {
  const [panel, setPanel] = useState<PanelData>(DEFAULT_PANEL);
  const [inlineSuggestions, setInlineSuggestions] = useState<Record<string, InlineSuggestion>>({});
  const [agentStatus, setAgentStatus] = useState<{ research: AgentStatus; flow: AgentStatus; orchestrator: AgentStatus }>({
    research: 'idle', flow: 'idle', orchestrator: 'idle'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKey, setApiKey] = useState(() =>
    typeof window !== 'undefined'
      ? (import.meta.env.VITE_ANTHROPIC_API_KEY || sessionStorage.getItem('am_anthropic_key') || '')
      : ''
  );
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [error, setError] = useState('');
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null);
  const panelRef = useRef(panel);
  panelRef.current = panel;

  const updateField = useCallback(<K extends keyof PanelData>(key: K, value: PanelData[K]) => {
    setPanel(prev => ({ ...prev, [key]: value }));
  }, []);

  const updateObjective = (index: number, value: string) => {
    const next = [...panel.objectives];
    next[index] = value;
    updateField('objectives', next);
  };

  const addObjective = () => updateField('objectives', [...panel.objectives, '']);
  const removeObjective = (index: number) => updateField('objectives', panel.objectives.filter((_, i) => i !== index));

  const updateParticipant = (id: string, field: keyof Participant, value: string) => {
    setPanel(prev => ({
      ...prev,
      participants: prev.participants.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const updateFlow = (id: string, field: keyof FlowSegment, value: string) => {
    setPanel(prev => ({
      ...prev,
      flow: prev.flow.map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  /* ─── Parse total panel duration from dateTime, default 60 min ─── */
  const getTotalMinutes = () => {
    const m = panel.dateTime.match(/(\d{2}):(\d{2})–(\d{2}):(\d{2})/);
    if (!m) return 60;
    return (parseInt(m[3]) * 60 + parseInt(m[4])) - (parseInt(m[1]) * 60 + parseInt(m[2]));
  };

  /* ─── Reorder flow + recalculate timing ─── */
  const moveSegment = (idx: number, dir: 'up' | 'down') => {
    setPanel(prev => {
      const flow = [...prev.flow];
      const swap = dir === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= flow.length) return prev;
      [flow[idx], flow[swap]] = [flow[swap], flow[idx]];
      // Recalculate timings: parse durations from each segment, reapply in order
      const total = getTotalMinutes();
      const durations = flow.map(s => {
        const m = s.time.match(/(\d+)–(\d+)/);
        return m ? parseInt(m[2]) - parseInt(m[1]) : Math.round(total / flow.length);
      });
      let cursor = 0;
      const updated = flow.map((s, i) => {
        const start = cursor;
        cursor += durations[i];
        return { ...s, time: `${String(start).padStart(2, '0')}–${String(cursor).padStart(2, '0')} min` };
      });
      return { ...prev, flow: updated };
    });
  };

  const saveKey = (key: string) => {
    setApiKey(key);
    sessionStorage.setItem('am_anthropic_key', key);
    setShowKeyInput(false);
  };

  /* ─── API call ─── */
  const callClaude = async (systemPrompt: string, userPrompt: string, key: string): Promise<string> => {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: { message?: string } }).error?.message || `API error ${response.status}`);
    }
    const data = await response.json() as { content: Array<{ type: string; text: string }> };
    return data.content[0]?.text || '';
  };

  /* ─── Multi-agent generation ─── */
  const generateSuggestions = useCallback(async (keyOverride?: string) => {
    const key = keyOverride || apiKey;
    if (!key) { setShowKeyInput(true); return; }
    if (isGenerating) return;

    setIsGenerating(true);
    setError('');
    setAgentStatus({ research: 'idle', flow: 'idle', orchestrator: 'idle' });

    try {
      const p = panelRef.current;
      const panelContext = `
PANEL: ${p.title}
EVENT: ${p.event} | ${p.dateTime} | ${p.venue}
WHY: ${p.whyPanel}
OBJECTIVES: ${p.objectives.join(' | ')}
DESIRED OUTCOME: ${p.desiredOutcome}
PARTICIPANTS: ${p.participants.map(pt => `${pt.name} (${pt.org}) — ${pt.lens}: ${pt.contribution}`).join('\n')}
FLOW: ${p.flow.map(s => `[${s.time}] ${s.title}: ${s.questions}`).join('\n\n')}`;

      setAgentStatus(s => ({ ...s, research: 'running' }));
      const researchResult = await callClaude(
        `You are a speaker research agent preparing briefing notes for panel moderator Anastasiya Markvarde.
For each panellist, surface 2-3 recent, specific facts about their work — recent publications, company milestones, stated positions, or notable data — that could anchor a sharp, specific question.
Output only facts with source type. No generic observations. Be specific.`,
        `Research these panellists for this panel:\n${panelContext}\n\nFor each speaker, list 2-3 specific recent facts a moderator could reference. Format as: [Name]: fact 1 | fact 2 | fact 3`,
        key
      );
      setAgentStatus(s => ({ ...s, research: 'done' }));

      setAgentStatus(s => ({ ...s, flow: 'running' }));
      const flowResult = await callClaude(
        `You are a narrative flow agent. Ensure panel questions form a tight storyline — each segment builds on the previous, hand-offs are explicit, no redundancy.
Identify: (1) flow gaps, (2) redundant questions, (3) the single most important narrative thread.`,
        `Analyse the narrative flow of this panel:\n${panelContext}\n\nResearch:\n${researchResult}\n\nOutput: (1) Flow gaps, (2) Key narrative thread, (3) One cross-panel question.`,
        key
      );
      setAgentStatus(s => ({ ...s, flow: 'done' }));

      setAgentStatus(s => ({ ...s, orchestrator: 'running' }));
      const orchestratorResult = await callClaude(
        `You are the orchestrator for panel moderator Anastasiya Markvarde.
Her style: specific over generic, evidence-led, asks about decisions and trade-offs not opinions, follows biology → evidence → regulation → value → capital pathway.
Output JSON only: array of objects with keys: segmentId (f1-f6), segmentTitle, speakerIds (array of participant ids p1-p5 that are addressed in the questions), questions (array of 1-3 specific question strings), note (one line on why these questions serve the flow).`,
        `Based on this panel, speaker research, and flow analysis, generate specific question suggestions per segment.
Panel:\n${panelContext}
Research:\n${researchResult}
Flow:\n${flowResult}

Return JSON array. Each object: {segmentId, segmentTitle, speakerIds: string[], questions: string[], note: string}. Only output valid JSON.`,
        key
      );
      setAgentStatus(s => ({ ...s, orchestrator: 'done' }));

      try {
        const jsonMatch = orchestratorResult.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed: Array<{ segmentId: string; segmentTitle: string; speakerIds?: string[]; questions: string[]; note: string }> = JSON.parse(jsonMatch[0]);
          const map: Record<string, InlineSuggestion> = {};
          parsed.forEach(s => {
            map[s.segmentId] = { questions: s.questions, note: s.note, speakerIds: s.speakerIds || [] };
          });
          setInlineSuggestions(map);
        }
      } catch {
        setInlineSuggestions({
          all: { questions: [orchestratorResult], note: 'Raw output', speakerIds: [] }
        });
      }
    } catch (err) {
      setError((err as Error).message);
      setAgentStatus({ research: 'idle', flow: 'idle', orchestrator: 'idle' });
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, isGenerating]);

  /* ─── Auto-generate after edit pause (debounced, 8s) ─── */
  const autoGenerateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!apiKey || isGenerating) return;
    if (autoGenerateTimer.current) clearTimeout(autoGenerateTimer.current);
    autoGenerateTimer.current = setTimeout(() => {
      if (panelRef.current.title && panelRef.current.participants.length > 0) {
        generateSuggestions();
      }
    }, 8000);
    return () => { if (autoGenerateTimer.current) clearTimeout(autoGenerateTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panel, apiKey]);

  /* ─── Speaker colour helper ─── */
  const speakerColorIndex = (pid: string) =>
    panel.participants.findIndex(p => p.id === pid) % SPEAKER_COLORS.length;

  const speakerColor = (pid: string) => SPEAKER_COLORS[speakerColorIndex(pid)];

  /* ─── Check if segment leads contain selected speaker ─── */
  const segmentHasSpeaker = (seg: FlowSegment, speakerId: string) => {
    const speaker = panel.participants.find(p => p.id === speakerId);
    if (!speaker) return false;
    return (
      seg.leadVoices.toLowerCase().includes(speaker.name.toLowerCase().split(' ')[0]) ||
      seg.questions.toLowerCase().includes(speaker.name.toLowerCase().split(' ')[0])
    );
  };

  const hasSuggestions = Object.keys(inlineSuggestions).length > 0;

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-body text-[#1A1A1A]">

      {/* ── Header ── */}
      <header className="bg-[#0D1B2E] text-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/speakers/anastasiya.jpg"
              alt="Anastasiya Markvarde"
              className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-amber-400/50"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <p className="font-display text-sm font-semibold text-white leading-tight">Anastasiya Markvarde</p>
              <p className="text-[11px] text-stone-400 leading-tight">Panel Moderator · Eir Accelerator</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="https://www.linkedin.com/in/anastasiyamarkvarde/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] text-stone-400 hover:text-white transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            <button
              onClick={() => setShowKeyInput(v => !v)}
              className="text-[11px] text-stone-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              {apiKey ? '✓ key' : 'Set key'}
            </button>
          </div>
        </div>
      </header>

      {/* ── API key drawer ── */}
      {showKeyInput && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3 flex-wrap">
            <p className="text-xs text-amber-800 font-medium whitespace-nowrap">Anthropic API key (session only):</p>
            <input
              type="password"
              defaultValue={apiKey}
              placeholder="sk-ant-…"
              className="flex-1 min-w-48 max-w-xs text-xs px-3 py-1.5 rounded-lg border border-amber-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-400 font-mono"
              onKeyDown={e => { if (e.key === 'Enter') saveKey((e.target as HTMLInputElement).value); }}
            />
            <button
              onClick={e => saveKey(((e.currentTarget.previousElementSibling) as HTMLInputElement).value)}
              className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >Save</button>
            <p className="text-[10px] text-amber-600">Add VITE_ANTHROPIC_API_KEY to Vercel env vars to skip this step.</p>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* ── Panel title & meta ── */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-stone-400 font-medium">
            <EditableText value={panel.event} onChange={v => updateField('event', v)} className="text-amber-600 font-semibold" />
            <span>·</span>
            <EditableText value={panel.dateTime} onChange={v => updateField('dateTime', v)} />
            <span>·</span>
            <EditableText value={panel.venue} onChange={v => updateField('venue', v)} />
          </div>
          <EditableText
            value={panel.title}
            onChange={v => updateField('title', v)}
            className="font-display text-4xl md:text-5xl text-[#0D1B2E] leading-[1.1] font-semibold"
            multiline
          />
        </div>

        {/* ── Context row: why / objectives / outcome ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-stone-200 pt-8">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-400">Why this panel</p>
            <EditableText
              value={panel.whyPanel}
              onChange={v => updateField('whyPanel', v)}
              className="text-sm text-stone-600 leading-relaxed"
              multiline
            />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-400">Objectives</p>
            <div className="space-y-1.5">
              {panel.objectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2 group">
                  <span className="text-amber-500 font-display font-bold text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                  <EditableText
                    value={obj}
                    onChange={v => updateObjective(i, v)}
                    className="text-sm text-stone-600 leading-relaxed flex-1"
                    multiline
                    placeholder="Objective…"
                  />
                  <button onClick={() => removeObjective(i)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-red-400 transition-all text-[10px] mt-0.5 flex-shrink-0">✕</button>
                </div>
              ))}
              <button onClick={addObjective} className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors flex items-center gap-0.5 mt-1">
                <span className="text-sm leading-none">+</span> add
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-400">Desired outcome</p>
            <EditableText
              value={panel.desiredOutcome}
              onChange={v => updateField('desiredOutcome', v)}
              className="text-sm text-stone-700 leading-relaxed font-medium"
              multiline
            />
          </div>
        </div>

        {/* ── Speakers ── */}
        <div className="space-y-4 border-t border-stone-200 pt-8">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-400">Speakers</p>
            {selectedSpeakerId && (
              <button
                onClick={() => setSelectedSpeakerId(null)}
                className="text-[10px] text-stone-400 hover:text-stone-700 transition-colors underline underline-offset-2"
              >
                Show all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {panel.participants.map((p, idx) => {
              const col = SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
              const isSelected = selectedSpeakerId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedSpeakerId(isSelected ? null : p.id)}
                  className={`
                    group flex items-center gap-2.5 rounded-2xl px-3 py-2 border transition-all text-left
                    ${isSelected
                      ? `${col.bg} ${col.border} ring-2 ${col.ring}`
                      : 'bg-white border-stone-200 hover:border-stone-300'}
                  `}
                >
                  {SPEAKER_PHOTOS[p.id] ? (
                    <img
                      src={SPEAKER_PHOTOS[p.id]}
                      alt={p.name}
                      className={`w-9 h-9 rounded-full object-cover flex-shrink-0 border-2 ${isSelected ? col.border : 'border-stone-200'}`}
                    />
                  ) : (
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold ${col.dot}`}>
                      {p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className={`text-xs font-semibold leading-tight ${isSelected ? col.text : 'text-stone-800'}`}>
                      <EditableText value={p.name} onChange={v => updateParticipant(p.id, 'name', v)} className="inline" />
                    </p>
                    <p className={`text-[10px] leading-tight ${isSelected ? col.text : 'text-stone-400'}`}>
                      <EditableText value={p.org} onChange={v => updateParticipant(p.id, 'org', v)} className="inline" />
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Speaker detail (expanded when selected) */}
          {selectedSpeakerId && (() => {
            const sp = panel.participants.find(p => p.id === selectedSpeakerId);
            const idx = panel.participants.findIndex(p => p.id === selectedSpeakerId);
            const col = SPEAKER_COLORS[idx % SPEAKER_COLORS.length];
            if (!sp) return null;
            return (
              <div className={`rounded-2xl border p-4 space-y-2 ${col.bg} ${col.border}`}>
                <p className={`text-[10px] font-semibold tracking-wider uppercase ${col.text} opacity-70`}>Lens</p>
                <EditableText
                  value={sp.lens}
                  onChange={v => updateParticipant(sp.id, 'lens', v)}
                  className={`text-sm font-semibold ${col.text}`}
                />
                <EditableText
                  value={sp.contribution}
                  onChange={v => updateParticipant(sp.id, 'contribution', v)}
                  className={`text-sm leading-relaxed ${col.text} opacity-80`}
                  multiline
                />
              </div>
            );
          })()}
        </div>

        {/* ── Generate button ── */}
        <div className="flex flex-col items-center gap-3 border-t border-stone-200 pt-8">
          <button
            onClick={() => generateSuggestions()}
            disabled={isGenerating}
            className="group flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#0D1B2E] text-white hover:bg-[#162540] disabled:opacity-60 disabled:cursor-not-allowed transition-all text-sm font-semibold tracking-wide shadow-lg hover:shadow-xl"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Agents running…
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {hasSuggestions ? 'Regenerate AI questions' : 'Generate AI questions'}
              </>
            )}
          </button>

          {/* Agent status row */}
          {(isGenerating || hasSuggestions) && (
            <div className="flex items-center gap-5">
              {(['research', 'flow', 'orchestrator'] as const).map(agent => (
                <div key={agent} className="flex items-center gap-1.5 text-[11px]">
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-500 ${
                    agentStatus[agent] === 'idle' ? 'bg-stone-300' :
                    agentStatus[agent] === 'running' ? 'bg-amber-400 animate-pulse' :
                    'bg-emerald-500'
                  }`} />
                  <span className={agentStatus[agent] === 'running' ? 'text-amber-700' : agentStatus[agent] === 'done' ? 'text-emerald-700' : 'text-stone-400'}>
                    {agent === 'research' ? 'Research' : agent === 'flow' ? 'Flow' : 'Orchestrator'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {hasSuggestions && !isGenerating && (
            <p className="text-[10px] text-stone-400">Suggestions appear inline ↓ · Auto-regenerates after edits</p>
          )}

          {error && (
            <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-2 max-w-md text-center">{error}</div>
          )}
        </div>

        {/* ── Panel Flow ── */}
        <div className="space-y-0 border-t border-stone-200 pt-8">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-400 mb-6">Panel flow</p>

          {panel.flow.map((seg, idx) => {
            const suggestion = inlineSuggestions[seg.id];
            const isFiltered = selectedSpeakerId !== null;
            const isActive = !isFiltered || segmentHasSpeaker(seg, selectedSpeakerId!);

            // Find which speakers' colors to use for this segment
            const segSpeakerColors = suggestion?.speakerIds?.map(sid => {
              const pidx = panel.participants.findIndex(p => p.id === sid);
              return pidx >= 0 ? SPEAKER_COLORS[pidx % SPEAKER_COLORS.length] : null;
            }).filter(Boolean) || [];

            return (
              <div
                key={seg.id}
                className={`flex gap-5 group transition-opacity duration-300 ${isFiltered && !isActive ? 'opacity-20' : 'opacity-100'}`}
              >
                {/* Timeline */}
                <div className="flex flex-col items-center flex-shrink-0 w-5 pt-1.5">
                  <div className={`w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 flex-shrink-0 transition-colors ${isActive && isFiltered ? 'bg-amber-500' : 'bg-amber-300'}`} />
                  {idx < panel.flow.length - 1 && (
                    <div className="w-px flex-1 bg-stone-200 mt-1" style={{ minHeight: '2rem' }} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  {/* Segment header */}
                  <div className="flex items-center gap-3 mb-1">
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button
                        onClick={() => moveSegment(idx, 'up')}
                        disabled={idx === 0}
                        className="w-5 h-4 flex items-center justify-center text-stone-300 hover:text-stone-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-[10px] leading-none"
                        title="Move up"
                      >▲</button>
                      <button
                        onClick={() => moveSegment(idx, 'down')}
                        disabled={idx === panel.flow.length - 1}
                        className="w-5 h-4 flex items-center justify-center text-stone-300 hover:text-stone-600 disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-[10px] leading-none"
                        title="Move down"
                      >▼</button>
                    </div>
                    <EditableText
                      value={seg.time}
                      onChange={v => updateFlow(seg.id, 'time', v)}
                      className="text-[10px] font-mono text-stone-400 flex-shrink-0"
                    />
                    <EditableText
                      value={seg.title}
                      onChange={v => updateFlow(seg.id, 'title', v)}
                      className="font-display text-xl font-semibold text-[#0D1B2E] leading-tight"
                    />
                  </div>

                  {/* Purpose */}
                  <EditableText
                    value={seg.purpose}
                    onChange={v => updateFlow(seg.id, 'purpose', v)}
                    className="text-sm text-stone-500 leading-relaxed mb-2 italic"
                    multiline
                  />

                  {/* Lead voices */}
                  <div className="flex items-start gap-2 mb-3">
                    <span className="text-[9px] font-semibold tracking-wider uppercase text-stone-400 mt-0.5 flex-shrink-0 pt-0.5">Lead</span>
                    <EditableText
                      value={seg.leadVoices}
                      onChange={v => updateFlow(seg.id, 'leadVoices', v)}
                      className="text-sm text-stone-500 leading-relaxed"
                      multiline
                    />
                  </div>

                  {/* Questions block */}
                  <div className="rounded-xl bg-white border border-stone-200 p-4 space-y-3">
                    <div>
                      <span className="text-[9px] font-semibold tracking-wider uppercase text-stone-400 block mb-2">Questions</span>
                      <EditableText
                        value={seg.questions}
                        onChange={v => updateFlow(seg.id, 'questions', v)}
                        className="text-[15px] text-stone-800 leading-relaxed whitespace-pre-line"
                        multiline
                      />
                    </div>

                    {/* Inline AI suggestions */}
                    {suggestion && (
                      <div className="border-t border-dashed border-stone-200 pt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-semibold tracking-wider uppercase text-stone-400">AI suggestions</span>
                          {segSpeakerColors.length > 0 && (
                            <div className="flex gap-1">
                              {segSpeakerColors.map((col, i) => (
                                <span key={i} className={`w-2 h-2 rounded-full ${col!.dot}`} />
                              ))}
                            </div>
                          )}
                        </div>
                        {suggestion.questions.map((q, qi) => {
                          const col = segSpeakerColors[qi % (segSpeakerColors.length || 1)] || SPEAKER_COLORS[0];
                          return (
                            <div key={qi} className={`rounded-lg border-l-2 pl-3 py-1 ${col.border} ${col.bg}`}>
                              <p className={`text-[15px] font-medium leading-relaxed ${col.text}`}>{q}</p>
                            </div>
                          );
                        })}
                        {suggestion.note && (
                          <p className="text-[10px] text-stone-400 italic">{suggestion.note}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Guardrails ── */}
        <div className="border-t border-stone-200 pt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-400 col-span-full mb-1">Moderator guardrails</p>
          {[
            'Keep the sequence: biology → evidence → regulation → value → capital',
            'Ask for a concrete example whenever an answer goes broad',
            'Separate regulatory requirements from company policy or convention',
            'Avoid asking every panellist the same question',
            'Protect time for audience Q&A and the closing round'
          ].map((g, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-xl p-3">
              <p className="text-xs text-stone-600 leading-relaxed">{g}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-8 border-t border-stone-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-[11px] text-stone-400">Panel Moderator · Anastasiya Markvarde · Eir Accelerator</p>
          <p className="text-[11px] text-stone-400">{panel.event} · {panel.dateTime}</p>
        </div>
      </footer>
    </div>
  );
}
