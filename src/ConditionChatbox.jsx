import React, { useState, useEffect, useRef } from 'react';

const QUESTION_TYPES = [
  { id: 'mixed', label: 'Mixed' },
  { id: 'presentation', label: 'Presentation' },
  { id: 'symptoms', label: 'Signs & Symptoms' },
  { id: 'investigations', label: 'Investigations' },
  { id: 'management', label: 'Management' },
  { id: 'sba', label: 'SBA Question' },
];

async function callClaude(messages, systemPrompt) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }
  const data = await response.json();
  return data.content[0].text;
}

function buildSystemPrompt(condition, selectionMode) {
  return `You are an expert medical education AI tutor for UK medical students preparing for the UKMLA (UK Medical Licensing Assessment) finals.

The student is studying: "${condition}"${selectionMode === 'presentation' ? ' (as a clinical presentation)' : ' (as a medical condition)'}

Your teaching rules:
1. Ask ONE focused clinical question at a time — never ask multiple questions in one response.
2. When the student answers, label it clearly as CORRECT, PARTIALLY CORRECT, or INCORRECT, then give a concise explanation and a teaching pearl.
3. Use UK clinical guidelines (NICE, BNF), UK drug names (e.g. paracetamol, salbutamol), and UK medical terminology throughout.
4. Keep responses concise: 150 words maximum unless generating an SBA question.
5. Do not repeat previous questions in the conversation.

For SBA questions, use this exact format:
---
CLINICAL SCENARIO:
[2–3 sentence realistic clinical vignette]

QUESTION:
[Specific clinical question]

A) [option]
B) [option]
C) [option]
D) [option]
E) [option]
---
Do NOT reveal the answer or any hints until after the student has responded.
When the student answers an SBA, state: "The correct answer is [X]." and explain why each distractor is wrong.`;
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

export default function ConditionChatbox({ condition, selectionMode }) {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionType, setQuestionType] = useState('mixed');
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Start fresh when condition changes
  useEffect(() => {
    if (condition) {
      setMessages([]);
      setUserInput('');
      setError(null);
      setQuestionType('mixed');
      fetchQuestion('mixed', []);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [condition]);

  const fetchQuestion = async (type, priorMessages) => {
    setIsLoading(true);
    setError(null);
    try {
      const prompt = getQuestionPrompt(type, condition);
      const apiMessages = [
        ...priorMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: prompt },
      ];
      const reply = await callClaude(apiMessages, buildSystemPrompt(condition, selectionMode));
      setMessages([...priorMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg = err.message;
      if (msg === 'API_KEY_MISSING') {
        setError('API key not found. Add VITE_ANTHROPIC_API_KEY to your .env.local file and restart the dev server.');
      } else if (msg.startsWith('401')) {
        setError('API key is invalid. Check VITE_ANTHROPIC_API_KEY in .env.local and restart the dev server.');
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
    fetchQuestion(type, []);
  };

  const handleNextQuestion = () => {
    if (isLoading) return;
    setMessages([]);
    setUserInput('');
    fetchQuestion(questionType, []);
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
      const reply = await callClaude(apiMessages, buildSystemPrompt(condition, selectionMode));
      setMessages([...updated, { role: 'assistant', content: reply }]);
    } catch (err) {
      const msg = err.message;
      if (msg === 'API_KEY_MISSING' || msg.startsWith('401')) {
        setError('API key issue — check VITE_ANTHROPIC_API_KEY in .env.local.');
      } else {
        setError(`Error: ${msg}`);
      }
    }
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div className="mt-4 w-full max-w-2xl bg-white rounded-xl shadow-xl overflow-hidden border border-indigo-100">
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
      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
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
              <pre className="whitespace-pre-wrap font-sans m-0 text-[13px]">{msg.content}</pre>
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

        <div ref={messagesEndRef} />
      </div>

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
