'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import Flashcard from '@/components/prep/Flashcard';
import {
  BookOpen, Clock, Target, Zap, Sparkles, Loader2,
  Mic, MicOff, Send, RotateCcw, MessageSquare, Volume2, ChevronRight, HelpCircle,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────── */
interface PrepCard { question: string; answer: string; category: string; }
interface ChatMessage { role: 'ai' | 'user'; text: string; feedback?: string; }
type Mode = 'flashcard' | 'text' | 'voice';

/* ─── Helpers ────────────────────────────────────────── */
const TAB_CONFIG: { id: Mode; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'flashcard', label: 'Flashcards', icon: <BookOpen size={16} />, desc: 'Flip-card practice' },
  { id: 'text',      label: 'Text Chat',  icon: <MessageSquare size={16} />, desc: 'Type your answers' },
  { id: 'voice',     label: 'Voice',      icon: <Mic size={16} />,           desc: 'Speak out loud' },
];

/* ═══════════════════════════════════════════════════════ */
export default function PrepPage() {
  const { profile } = useUserProfile();
  const [mode, setMode] = useState<Mode>('flashcard');

  /* — Flashcard state — */
  const [prepCards, setPrepCards]   = useState<PrepCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  /* — Text chat state — */
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]       = useState('');
  const [chatLoading, setChatLoading]   = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /* — Voice state — */
  const [isListening, setIsListening]   = useState(false);
  const [transcript, setTranscript]     = useState('');
  const [voiceQuestion, setVoiceQuestion] = useState<string | null>(null);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const [voiceLoading, setVoiceLoading]   = useState(false);
  const [voiceError, setVoiceError]       = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const tradeName = profile?.trade
    ? profile.trade.charAt(0).toUpperCase() + profile.trade.slice(1)
    : 'Trades';

  /* ── scroll chat to bottom ── */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  /* ── Generate flashcards ── */
  const handleGenerateCards = async () => {
    if (!profile?.trade) { setError('Please add a trade to your profile first.'); return; }
    setIsGenerating(true); setError(null);
    try {
      const res  = await fetch('/api/prep/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade: profile.trade, skills: profile.skills, certifications: profile.certifications, experienceLevel: profile.yearsExperience ? `${profile.yearsExperience} years` : 'Mid-level' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate cards');
      setPrepCards(data.flashcards);
    } catch (err: any) { setError(err.message); }
    finally { setIsGenerating(false); }
  };

  /* ── Start text chat session ── */
  const startTextChat = async () => {
    if (!profile?.trade) return;
    setChatLoading(true);
    try {
      const res  = await fetch('/api/prep/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade: profile.trade, skills: profile.skills }),
      });
      const data = await res.json();
      const q = data.question || `Tell me about your experience in ${tradeName}.`;
      setCurrentQuestion(q);
      setChatMessages([{ role: 'ai', text: q }]);
    } catch {
      const q = `Tell me about your experience as a ${tradeName} professional.`;
      setCurrentQuestion(q);
      setChatMessages([{ role: 'ai', text: q }]);
    } finally { setChatLoading(false); }
  };

  /* ── Send text answer ── */
  const handleSendText = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userText = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setChatLoading(true);
    try {
      const res  = await fetch('/api/prep/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: currentQuestion, answer: userText, trade: profile?.trade }),
      });
      const data = await res.json();
      const feedback = data.feedback || 'Good answer! Keep practicing.';
      const nextQ    = data.nextQuestion || null;
      setChatMessages(prev => [
        ...prev,
        { role: 'ai', text: feedback, feedback: 'feedback' },
        ...(nextQ ? [{ role: 'ai' as const, text: nextQ }] : []),
      ]);
      if (nextQ) setCurrentQuestion(nextQ);
    } catch {
      setChatMessages(prev => [...prev, { role: 'ai', text: 'Great effort! Keep going.' }]);
    } finally { setChatLoading(false); }
  };

  /* ── Voice: start listening ── */
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setVoiceError('Speech recognition not supported in this browser. Try Chrome.'); return; }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous     = true;
    recognition.interimResults = true;
    recognition.lang           = 'en-US';
    recognition.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        interim += e.results[i][0].transcript;
      }
      setTranscript(interim);
    };
    recognition.onerror = () => { setIsListening(false); };
    recognition.onend   = () => { setIsListening(false); };
    recognition.start();
    setIsListening(true);
    setTranscript('');
    setVoiceFeedback(null);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  /* ── Start voice session ── */
  const startVoiceSession = async () => {
    if (!profile?.trade) return;
    setVoiceLoading(true); setVoiceError(null);
    try {
      const res  = await fetch('/api/prep/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trade: profile.trade, skills: profile.skills }),
      });
      const data = await res.json();
      setVoiceQuestion(data.question || `Tell me about your experience in ${tradeName}.`);
    } catch {
      setVoiceQuestion(`Tell me about your experience as a ${tradeName} professional.`);
    } finally { setVoiceLoading(false); }
  };

  /* ── Submit voice answer ── */
  const submitVoiceAnswer = async () => {
    if (!transcript.trim()) return;
    stopListening();
    setVoiceLoading(true);
    try {
      const res  = await fetch('/api/prep/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: voiceQuestion, answer: transcript, trade: profile?.trade }),
      });
      const data = await res.json();
      setVoiceFeedback(data.feedback || 'Good answer! Keep practicing.');
      if (data.nextQuestion) setVoiceQuestion(data.nextQuestion);
    } catch {
      setVoiceFeedback('Great effort! Keep practicing.');
    } finally { setVoiceLoading(false); setTranscript(''); }
  };

  /* ═══ RENDER ═══════════════════════════════════════════ */
  return (
    <div className="flex flex-col min-h-full">

      {/* ── Page Header ── */}
      <div className="bg-surface border-b border-border px-6 py-5 shrink-0">
        <h1 className="text-[22px] font-extrabold text-text-primary tracking-tight">AI Interview Prep</h1>
        <p className="text-[14px] text-text-secondary mt-0.5">{tradeName} practice — choose your mode below</p>

        {/* Mode Tabs */}
        <div className="flex gap-2 mt-4">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold transition-all ${
                mode === tab.id
                  ? 'bg-[#007AFF] text-white shadow-sm'
                  : 'bg-background border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mode: Flashcards ── */}
      {mode === 'flashcard' && (
        <div className="flex-1 px-5 py-6 max-w-2xl w-full mx-auto space-y-7">
          {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">{error}</div>}

          {prepCards.length > 0 && (
            <div className="grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-4">
              {[
                { val: prepCards.length, label: 'Cards', icon: <BookOpen size={12}/> },
                { val: new Set(prepCards.map(c => c.category)).size, label: 'Topics', icon: <Target size={12}/> },
                { val: `~${prepCards.length * 2}`, label: 'Min', icon: <Clock size={12}/> },
              ].map(stat => (
                <div key={stat.label} className="bg-surface border border-border rounded-[16px] p-4 flex flex-col items-center gap-1">
                  <span className="text-[24px] font-extrabold text-text-primary">{stat.val}</span>
                  <div className="flex items-center gap-1 text-text-secondary">
                    {stat.icon}
                    <span className="text-[11px] font-bold uppercase tracking-wider">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {prepCards.length === 0 && !isGenerating && (
            <div className="bg-white border-2 border-dashed border-[#D1D5DB] rounded-[24px] p-10 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#F5F3FF] flex items-center justify-center mb-5">
                <Sparkles size={32} className="text-[#8B5CF6]" />
              </div>
              <h2 className="text-[20px] font-extrabold text-[#1D1D1F] tracking-tight mb-2">Generate AI Flashcards</h2>
              <p className="w-full max-w-[320px] text-[15px] text-[#6B7280] mb-8 leading-relaxed mx-auto">
                Instantly generate 10 realistic interview questions tailored to your trade, skills, and experience level.
              </p>
              <button
                onClick={handleGenerateCards}
                disabled={!profile?.trade}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#007AFF] text-white rounded-xl font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles size={18} />
                {profile?.trade ? `Generate for ${tradeName}` : 'Add a trade to your profile first'}
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="bg-white border border-[#E8EAF0] rounded-[24px] p-10 flex flex-col items-center justify-center text-center min-h-[400px]">
              <Loader2 size={48} className="text-[#007AFF] animate-spin mb-6" />
              <h2 className="text-[20px] font-extrabold text-[#1D1D1F] tracking-tight mb-2">Analyzing your profile...</h2>
              <p className="text-[15px] text-[#6B7280] max-w-sm leading-relaxed animate-pulse">
                Crafting perfect interview questions based on your unique skills and trade.
              </p>
            </div>
          )}

          {prepCards.length > 0 && !isGenerating && (
            <div className="animate-in fade-in slide-in-from-bottom-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[18px] font-extrabold text-text-primary tracking-tight">Practice Session</h2>
                <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#FF9500]">
                  <Zap size={14} /> Tap card to flip
                </div>
              </div>
              <Flashcard cards={prepCards as any} />
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleGenerateCards}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F5F3FF] text-[#8B5CF6] rounded-full font-bold text-[14px] hover:bg-[#EDE9FE] transition-colors"
                >
                  <Sparkles size={16} /> Generate 10 New Cards
                </button>
              </div>
            </div>
          )}
          <div className="h-8" />
        </div>
      )}

      {/* ── Mode: Text Chat ── */}
      {mode === 'text' && (
        <div className="flex-1 flex flex-col max-w-2xl w-full mx-auto px-5 py-6 min-h-0">

          {chatMessages.length === 0 && !chatLoading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
              <div className="w-16 h-16 rounded-full bg-[#E8F5FF] flex items-center justify-center">
                <MessageSquare size={30} className="text-[#007AFF]" />
              </div>
              <div>
                <h2 className="text-[20px] font-extrabold text-text-primary mb-1">Text Interview Practice</h2>
                <p className="text-[14px] text-text-secondary w-full max-w-[360px] leading-relaxed">
                  The AI will ask you real interview questions. Type your answers and get instant feedback.
                </p>
              </div>
              <button
                onClick={startTextChat}
                disabled={!profile?.trade}
                className="flex items-center gap-2 px-6 py-3.5 bg-[#007AFF] text-white rounded-xl font-bold text-[15px] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} /> Start Practice Session
              </button>
            </div>
          )}

          {chatLoading && chatMessages.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={36} className="text-[#007AFF] animate-spin" />
            </div>
          )}

          {chatMessages.length > 0 && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                    {msg.role === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center mr-2 shrink-0 mt-1">
                        <Sparkles size={14} className="text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#007AFF] text-white rounded-tr-sm'
                          : msg.feedback
                            ? 'bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] rounded-tl-sm'
                            : 'bg-surface border border-border text-text-primary rounded-tl-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#007AFF] flex items-center justify-center shrink-0">
                      <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="bg-surface border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1 items-center h-4">
                        <span className="w-2 h-2 bg-text-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-text-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-text-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="flex flex-col gap-2 pt-3 border-t border-border">
                <div className="flex gap-3">
                  <textarea
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendText(); } }}
                    placeholder="Type your answer, or ask the AI a question..."
                    rows={2}
                    className="flex-1 resize-none bg-background border border-border rounded-xl px-4 py-3 text-[14px] text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
                  />
                  <button
                    onClick={handleSendText}
                    disabled={!chatInput.trim() || chatLoading}
                    className="w-12 h-12 self-end bg-[#007AFF] rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-all disabled:opacity-40 shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setChatInput("I have a question: ")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF9500]/10 text-[#FF9500] rounded-lg text-[12px] font-bold hover:bg-[#FF9500]/20 transition-colors"
                  >
                    <HelpCircle size={14} /> Ask a question
                  </button>
                  <button
                    onClick={() => setChatInput("Can you give me a hint on how to answer this?")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#007AFF]/10 text-[#007AFF] rounded-lg text-[12px] font-bold hover:bg-[#007AFF]/20 transition-colors"
                  >
                    <Sparkles size={14} /> Ask for a hint
                  </button>
                  <button
                    onClick={() => setChatInput("What do employers typically look for when they ask this?")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 dark:bg-white/5 text-text-secondary rounded-lg text-[12px] font-medium hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  >
                    What do employers want?
                  </button>
                </div>
              </div>

              <button
                onClick={() => { setChatMessages([]); setCurrentQuestion(null); }}
                className="mt-3 flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors mx-auto"
              >
                <RotateCcw size={13} /> Start new session
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Mode: Voice ── */}
      {mode === 'voice' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full mx-auto px-5 py-6 gap-6">

          {voiceError && (
            <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">{voiceError}</div>
          )}

          {/* No session yet */}
          {!voiceQuestion && !voiceLoading && (
            <div className="text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] flex items-center justify-center mx-auto shadow-lg">
                <Mic size={36} className="text-white" />
              </div>
              <div>
                <h2 className="text-[20px] font-extrabold text-text-primary mb-1">Voice Interview Practice</h2>
                <p className="text-[14px] text-text-secondary w-full max-w-[360px] mx-auto leading-relaxed">
                  The AI asks a question. You speak your answer. Get instant feedback on your response.
                </p>
              </div>
              <button
                onClick={startVoiceSession}
                disabled={!profile?.trade}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl font-bold text-[15px] hover:opacity-90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
              >
                <Volume2 size={18} /> Start Voice Session
              </button>
            </div>
          )}

          {voiceLoading && (
            <Loader2 size={40} className="text-[#007AFF] animate-spin" />
          )}

          {voiceQuestion && !voiceLoading && (
            <div className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-4">

              {/* Question card */}
              <div className="bg-surface border border-border rounded-2xl p-6 relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-[#007AFF] flex items-center justify-center">
                    <Sparkles size={13} className="text-white" />
                  </div>
                  <span className="text-[12px] font-bold text-[#007AFF] uppercase tracking-wider">AI Question</span>
                </div>
                <p className="text-[16px] font-semibold text-text-primary leading-relaxed">{voiceQuestion}</p>
              </div>

              {/* Feedback card */}
              {voiceFeedback && (
                <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-5 animate-in fade-in">
                  <p className="text-[12px] font-bold text-[#166534] uppercase tracking-wider mb-2">AI Feedback</p>
                  <p className="text-[14px] text-[#166534] leading-relaxed">{voiceFeedback}</p>
                </div>
              )}

              {/* Transcript display */}
              <div className={`w-full min-h-[80px] bg-background border-2 rounded-2xl p-4 transition-colors ${isListening ? 'border-[#FF6B6B] shadow-[0_0_0_4px_rgba(255,107,107,0.12)]' : 'border-border'}`}>
                {transcript ? (
                  <p className="text-[14px] text-text-primary leading-relaxed">{transcript}</p>
                ) : (
                  <p className="text-[14px] text-text-secondary italic">
                    {isListening ? 'Listening… speak now' : 'Your spoken answer will appear here'}
                  </p>
                )}
              </div>

              {/* Mic controls */}
              <div className="flex gap-3 justify-center">
                {!isListening ? (
                  <button
                    onClick={startListening}
                    className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] text-white rounded-xl font-bold text-[15px] hover:opacity-90 transition-all shadow-sm"
                  >
                    <Mic size={18} /> {transcript ? 'Re-record' : 'Tap to Speak'}
                  </button>
                ) : (
                  <button
                    onClick={stopListening}
                    className="flex items-center gap-2 px-6 py-3.5 bg-red-600 text-white rounded-xl font-bold text-[15px] hover:opacity-90 transition-all shadow-sm animate-pulse"
                  >
                    <MicOff size={18} /> Stop Recording
                  </button>
                )}

                {transcript && !isListening && (
                  <button
                    onClick={submitVoiceAnswer}
                    className="flex items-center gap-2 px-6 py-3.5 bg-[#007AFF] text-white rounded-xl font-bold text-[15px] hover:opacity-90 transition-all"
                  >
                    <Send size={18} /> Submit Answer
                  </button>
                )}
              </div>

              <button
                onClick={() => { setVoiceQuestion(null); setVoiceFeedback(null); setTranscript(''); stopListening(); startVoiceSession(); }}
                className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-text-primary transition-colors mx-auto"
              >
                <RotateCcw size={13} /> Next Question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
