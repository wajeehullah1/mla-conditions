import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabase';
import posthog from 'posthog-js';

const QUESTION_TYPES = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'symptoms', label: 'Signs & Symptoms' },
  { id: 'investigations', label: 'Investigations' },
  { id: 'management', label: 'Management' },
  { id: 'sba', label: 'SBA Question' },
];

async function callClaude(messages, systemPrompt, condition) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt, condition }),
  });
  if (!response.ok) {
    let errorMsg;
    try {
      const data = await response.json();
      errorMsg = data.error || `HTTP ${response.status}`;
    } catch {
      const text = await response.text().catch(() => '');
      errorMsg = text.slice(0, 200) || `HTTP ${response.status}`;
    }
    throw new Error(errorMsg);
  }
  const data = await response.json();
  return data.content;
}

function buildSystemPrompt(condition, selectionMode) {
  return `You are a senior UK consultant and clinical lecturer running a one-to-one teaching session. You are an expert in your field — direct, sharp, and no-nonsense. You teach the way a consultant would on a ward round: no padding, no hand-holding, straight to the point.

The student is studying: "${condition}"${selectionMode === 'presentation' ? ' (as a clinical presentation)' : ' (as a medical condition)'}

FORMATTING RULES — these are non-negotiable and apply to every single response:
- Never use asterisks for bold or italic (no **text** or *text* ever).
- Never use hashtags for headings.
- Never use markdown table syntax with pipe characters.
- Write in plain prose or simple numbered lists only.
- If you need to show data in columns, use plain spaced text, not pipes.

How you teach:
1. Ask ONE focused clinical question at a time. Start directly — no openers like "Great!" or "Certainly!" or "Of course!". Just ask the question.
2. When the student answers, tell them plainly whether they are right, partially right, or wrong. Give a brief explanation and a key clinical teaching point. Then immediately ask the next question — keep the session going without pause.
3. Use UK clinical practice throughout: NICE guidelines, BNF drug names (paracetamol, salbutamol, etc.), UK investigations and referral pathways.
4. Keep responses to around 150 words unless writing an SBA question. No waffle.
5. Do not repeat questions already asked in this session.

For SBA questions, use this exact format:
---
CLINICAL SCENARIO:
[2-3 sentence realistic clinical vignette]

QUESTION:
[Specific clinical question]

A) [option]
B) [option]
C) [option]
D) [option]
E) [option]
---
Do not reveal the answer or any hints until after the student has responded.
When the student answers an SBA, state: "The correct answer is [X]." and explain why each distractor is wrong. Then ask a new question.`;
}

function getQuestionPrompt(type, condition) {
  const prompts = {
    mixed: `Ask a focused clinical question about "${condition}". Choose the most educational topic: it can cover presentation, symptoms, examination findings, investigations, management, pathophysiology, or generate a UKMLA SBA question. Ask only ONE question and start directly — no preamble.`,
    presentation: `Ask a question specifically about the clinical presentation of "${condition}" — e.g. typical symptoms, onset, history features, or red flag symptoms. Ask only ONE question and start directly.`,
    symptoms: `Ask about the signs and symptoms of "${condition}" including both symptoms the patient reports and clinical signs elicited on examination. Ask only ONE question and start directly.`,
    investigations: `Ask a question about investigations for "${condition}" — first-line tests, expected findings, or interpreting results. Ask only ONE question and start directly.`,
    management: `Ask a question about the management of "${condition}" using UK guidelines (NICE/BNF). Cover acute management, drug therapy with doses, monitoring, or long-term management. Ask only ONE question and start directly.`,
    sba: `Generate a UKMLA finals-level Single Best Answer (SBA) question about "${condition}". Use the required format with a clinical scenario and 5 options (A–E). Do NOT reveal the answer or any clues — wait for the student to respond.`,
  };
  return prompts[type] || prompts.mixed;
}

function renderMessageContent(content) {
  // Strip markdown bold/italic markers
  const cleaned = content
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s+/g, '');

  const lines = cleaned.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect start of a markdown table (line with pipes on both ends)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      // Filter out separator rows (e.g. | --- | --- |)
      const dataRows = tableLines.filter(l => !l.replace(/\|/g, '').trim().match(/^[-:\s]+$/));
      const parsed = dataRows.map(row =>
        row.split('|').slice(1, -1).map(cell => cell.trim())
      );
      if (parsed.length > 0) {
        result.push(
          <table key={`table-${i}`} className="w-full border-collapse text-xs my-2 table-fixed">
            <thead>
              <tr>
                {parsed[0].map((cell, ci) => (
                  <th key={ci} className="border border-gray-300 px-2 py-1.5 bg-indigo-50 text-left font-semibold text-gray-700">{cell}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {parsed.slice(1).map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-gray-300 px-2 py-1.5 text-gray-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
    } else {
      // Collect consecutive non-table lines
      let block = '';
      while (i < lines.length) {
        const t = lines[i].trim();
        if (t.startsWith('|') && t.endsWith('|') && t.length > 2) break;
        block += lines[i] + '\n';
        i++;
      }
      if (block.trim()) {
        result.push(
          <span key={`text-${i}`} style={{ whiteSpace: 'pre-wrap' }}>{block}</span>
        );
      }
    }
  }

  return result;
}

export default function ConditionChatbox({ condition, selectionMode, userId, onShowAuth }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionType, setQuestionType] = useState('mixed');
  const [error, setError] = useState(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const retryCount = useRef(0);
  const nextQCount = useRef(0);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackDone, setFeedbackDone] = useState(false);

  // Scroll within the message container only — never scroll the page
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Start fresh when condition changes
  useEffect(() => {
    if (condition) {
      setMessages([]);
      setUserInput('');
      setError(null);
      setQuestionType('mixed');
      retryCount.current = 0;
      nextQCount.current = 0;
      setShowFeedback(false);
      setFeedbackRating(null);
      setFeedbackComment('');
      setFeedbackDone(false);
      fetchQuestion('mixed');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);

  const fetchQuestion = async (type, historyContext = []) => {
    setIsLoading(true);
    setError(null);
    try {
      const prompt = getQuestionPrompt(type, condition);
      const apiMessages = [
        ...historyContext.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt },
      ];
      const reply = await callClaude(apiMessages, buildSystemPrompt(condition, selectionMode), condition);
      // Always display only the new question — history is context only
      setMessages([{ role: 'assistant', content: reply }]);
      // Save question to history
      if (userId) {
        supabase.from('question_history').insert({
          user_id: userId,
          condition,
          question_type: type,
          question: reply,
        }).then(() => {});
      }
    } catch (err) {
      const msg = err.message;
      if (msg === 'API_KEY_MISSING') {
        setError('API key not configured. Add ANTHROPIC_API_KEY to your .env.local file and restart the server.');
      } else if (retryCount.current < 1) {
        // Auto-retry once — handles cold starts on Vercel
        retryCount.current += 1;
        setTimeout(() => fetchQuestion(type, historyContext), 1500);
        return;
      } else {
        setError(`Could not load question: ${msg}`);
      }
    }
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleTabChange = (type) => {
    if (isLoading) return;
    setQuestionType(type);
    setMessages([]);
    setUserInput('');
    posthog.capture('question_type_selected', { type, condition });
    fetchQuestion(type);
  };

  const handleNextQuestion = () => {
    if (isLoading) return;
    const history = messages;
    setMessages([]);
    setUserInput('');
    nextQCount.current += 1;
    if (nextQCount.current === 2 && !feedbackDone) {
      setShowFeedback(true);
    }
    posthog.capture('next_question_pressed', { type: questionType, condition });
    fetchQuestion(questionType, history);
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    const updated = [...messages, { role: 'user', content: userInput.trim() }];
    setMessages(updated);
    setUserInput('');
    setIsLoading(true);
    setError(null);
    try {
      const apiMessages = updated.map(m => ({ role: m.role, content: m.content }));
      const reply = await callClaude(apiMessages, buildSystemPrompt(condition, selectionMode), condition);
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const submitFeedback = async (rating) => {
    setFeedbackRating(rating);
    await supabase.from('feedback').insert({
      user_id: userId || null,
      rating,
      comment: feedbackComment.trim() || null,
      condition,
    });
    posthog.capture('feedback_submitted', { rating, condition, question_type: questionType });
    setFeedbackDone(true);
    setTimeout(() => setShowFeedback(false), 2000);
  };

  if (!userId) {
    return (
      <div className="mt-4 w-full bg-white rounded-xl shadow-xl overflow-hidden border border-indigo-100">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-5 py-3">
          <h3 className="text-white font-bold text-sm tracking-wide uppercase">Test Yourself</h3>
          <p className="text-indigo-200 text-xs mt-0.5">Studying: {condition}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-gray-900 font-bold text-lg mb-2">AI Consultant</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Create a free account to get grilled on {condition} in UK clinical style.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => onShowAuth('signup')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg transition-colors shadow"
            >
              Sign up free
            </button>
            <button
              onClick={() => onShowAuth('login')}
              className="px-5 py-2.5 border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 w-full bg-white rounded-xl shadow-xl overflow-hidden border border-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-5 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-sm tracking-wide uppercase">Test Yourself</h3>
          <p className="text-indigo-200 text-xs mt-0.5">Studying: {condition}</p>
        </div>
        <span className="text-indigo-200 text-xs">UKMLA Finals Level</span>
      </div>

      {/* Question type tabs */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-1.5">
        {QUESTION_TYPES.map(qt => (
          <button
            key={qt.id}
            onClick={() => handleTabChange(qt.id)}
            disabled={isLoading}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              questionType === qt.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-indigo-50 border border-gray-200 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed'
            }`}
          >
            {qt.label}
          </button>
        ))}
      </div>

      {/* Message list */}
      <div ref={messagesContainerRef} className="h-[420px] sm:h-[540px] overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 && !isLoading && !error && (
          <p className="text-center text-gray-400 text-sm mt-10">Loading your first question…</p>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1 select-none">
                AI
              </div>
            )}
            <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-indigo-600 text-white rounded-tr-sm'
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
            }`}>
              {msg.role === 'user' ? (
                <span className="text-[13px]">{msg.content}</span>
              ) : (
                <div className="text-[13px]">{renderMessageContent(msg.content)}</div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">
              AI
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 flex gap-1 items-center">
              {[0, 150, 300].map(delay => (
                <div
                  key={delay}
                  className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            <strong>Error: </strong>{error}
            {error.includes('API key') && (
              <p className="mt-2 text-xs text-red-600">
                Create a file called <code className="bg-red-100 px-1 py-0.5 rounded font-mono">.env.local</code> in the project root:<br />
                <code className="bg-red-100 px-1 py-0.5 rounded font-mono">ANTHROPIC_API_KEY=sk-ant-api03-...</code><br />
                Then restart the dev server with <code className="bg-red-100 px-1 py-0.5 rounded font-mono">npm run dev</code>.
              </p>
            )}
          </div>
        )}

      </div>

      {/* Disclaimer */}
      <div className="px-5 py-2 bg-amber-50 border-t border-amber-100">
        <p className="text-xs text-amber-700 text-center">
          AI-generated content. Always verify with current NICE guidelines and the BNF before applying clinically.
        </p>
      </div>

      {/* Feedback strip */}
      {showFeedback && (
        <div className="border-t border-indigo-100 bg-indigo-50 px-4 py-3">
          {feedbackDone ? (
            <p className="text-center text-sm text-indigo-600 font-semibold">Thanks for the feedback!</p>
          ) : feedbackRating ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Anything else? (optional)"
                className="flex-1 text-xs border border-indigo-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white"
                onKeyDown={(e) => { if (e.key === 'Enter') submitFeedback(feedbackRating); }}
                autoFocus
              />
              <button
                onClick={() => submitFeedback(feedbackRating)}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                Send
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Skip
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-indigo-700 font-semibold whitespace-nowrap">How's the session?</span>
              <div className="flex gap-1">
                {[['😕',1],['😐',2],['🙂',3],['😊',4],['🤩',5]].map(([emoji, rating]) => (
                  <button
                    key={rating}
                    onClick={() => setFeedbackRating(rating)}
                    className="text-xl hover:scale-125 transition-transform"
                    title={rating}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      )}

      {/* Input bar */}
      <div className="px-4 py-3 bg-white border-t border-gray-100">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your answer…"
            disabled={isLoading}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Send
          </button>
          <button
            type="button"
            onClick={handleNextQuestion}
            disabled={isLoading}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Next Q
          </button>
        </form>
      </div>
    </div>
  );
}
