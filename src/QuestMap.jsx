import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  GAMES,
  LEVELS_PER_RANK,
  RANKS,
  SWEEP_BONUS,
  TOTAL_LEVELS,
  isRankMilestone,
  rankIndexForLevel,
  xpToReachLevel,
} from './progress.js';

/* ── Map geometry ───────────────────────────────────────────────────────────
   The board is one tall SVG that scrolls inside a fixed window, so all 45
   levels exist at once and the climb ahead is visible — the point of the
   thing. Nodes weave left and right on a six-level cycle; the connecting path
   is a Catmull-Rom spline through their centres.                            */

const VIEW_W = 300;
const NODE_GAP = 66;
const PAD_Y = 42;
const SWING = 82;
const VIEW_H = PAD_Y * 2 + (TOTAL_LEVELS - 1) * NODE_GAP;

const nodeX = (index) => VIEW_W / 2 + SWING * Math.sin((index * Math.PI) / 3);
const nodeY = (index) => PAD_Y + index * NODE_GAP;

const NODES = Array.from({ length: TOTAL_LEVELS }, (_, i) => ({
  level: i + 1,
  x: nodeX(i),
  y: nodeY(i),
  milestone: isRankMilestone(i + 1),
  rank: RANKS[rankIndexForLevel(i + 1)],
}));

/** A smooth path through every node centre, so the track reads as one journey. */
const TRACK = (() => {
  const pts = NODES;
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
})();

const CARD_STYLE = {
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.45)',
  backdropFilter: 'blur(28px)',
  WebkitBackdropFilter: 'blur(28px)',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 8px 32px rgba(180,100,220,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
};

const STYLES = `
@keyframes qm-pulse {
  0%, 100% { transform: scale(1);    opacity: 0.55; }
  50%      { transform: scale(1.55); opacity: 0;    }
}
@keyframes qm-pop {
  0%   { transform: translateY(6px) scale(0.9); opacity: 0; }
  60%  { transform: translateY(0) scale(1.04);  opacity: 1; }
  100% { transform: translateY(0) scale(1);     opacity: 1; }
}
@keyframes qm-shimmer {
  0%   { background-position: -140% 0; }
  100% { background-position: 240% 0; }
}
.qm-ping { transform-box: fill-box; transform-origin: center; animation: qm-pulse 2.1s ease-out infinite; }
.qm-celebrate { animation: qm-pop 0.34s cubic-bezier(0.2, 0.9, 0.3, 1.2) both; }
.qm-node { cursor: pointer; transition: transform 0.15s ease; transform-box: fill-box; transform-origin: center; }
.qm-node:hover { transform: scale(1.12); }
@media (prefers-reduced-motion: reduce) {
  .qm-ping, .qm-celebrate { animation: none; }
  .qm-ping { opacity: 0; }
}
`;

/* ── Pieces ─────────────────────────────────────────────────────────────── */

function LevelNode({ node, status, selected, onSelect }) {
  const { level, x, y, milestone, rank } = node;
  const done = status === 'done';
  const current = status === 'current';
  const r = milestone ? 21 : current ? 20 : 15;

  const fill = done ? rank.color : current ? '#ffffff' : 'rgba(255,255,255,0.55)';
  const stroke = done || current ? rank.color : 'rgba(0,0,0,0.13)';
  const labelFill = done ? '#ffffff' : current ? rank.color : 'rgba(0,0,0,0.35)';

  return (
    <g className="qm-node" onClick={() => onSelect(level)} role="button" tabIndex={-1}>
      {current && <circle cx={x} cy={y} r={r} fill={rank.color} className="qm-ping" />}
      {selected && <circle cx={x} cy={y} r={r + 6} fill="none" stroke={rank.color} strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />}
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={fill}
        stroke={stroke}
        strokeWidth={current ? 3.5 : done ? 2 : 1.5}
        opacity={done || current ? 1 : 0.9}
      />
      {milestone ? (
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="18" opacity={done || current ? 1 : 0.45}>
          {rank.emoji}
        </text>
      ) : (
        <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="700" fill={labelFill}>
          {level}
        </text>
      )}
      <title>{`Level ${level} — ${rank.name}`}</title>
    </g>
  );
}

function RankLabel({ node, reached }) {
  const onLeft = node.x > VIEW_W / 2;
  return (
    <text
      x={onLeft ? node.x - 30 : node.x + 30}
      y={node.y}
      textAnchor={onLeft ? 'end' : 'start'}
      dominantBaseline="central"
      fontSize="11"
      fontWeight="700"
      fill={reached ? node.rank.color : 'rgba(0,0,0,0.3)'}
      style={{ letterSpacing: '0.02em' }}
    >
      {node.rank.short}
    </text>
  );
}

function CelebrationBanner({ celebration }) {
  if (!celebration || celebration.kind === 'xp') return null;
  const isRank = celebration.kind === 'rank';
  return (
    <div
      key={celebration.at}
      className="qm-celebrate rounded-xl px-3 py-2 mb-3 flex items-center gap-2"
      style={{
        background: isRank
          ? `linear-gradient(90deg, ${celebration.rank.color}22, ${celebration.rank.color}08)`
          : 'rgba(255,255,255,0.6)',
        border: `1px solid ${isRank ? `${celebration.rank.color}55` : 'rgba(255,255,255,0.8)'}`,
      }}
    >
      <span className="text-lg">{isRank ? celebration.rank.emoji : '⭐'}</span>
      <div className="min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">
          {isRank ? `You made ${celebration.rank.name}!` : `Level ${celebration.level}!`}
        </p>
        <p className="text-gray-600" style={{ fontSize: '0.75rem' }}>
          {isRank ? 'New rank unlocked' : `Keep going — ${celebration.rank.name}`}
        </p>
      </div>
    </div>
  );
}

/* ── The sidebar block ──────────────────────────────────────────────────── */

export default function QuestMap({ state, celebration, onLaunch }) {
  const [selected, setSelected] = useState(state.level);
  const scrollerRef = useRef(null);
  const doneToday = useMemo(() => new Set(state.todayGames), [state.todayGames]);

  // Follow the player: levelling up should move the map's focus with them, but
  // only on the level-up itself — otherwise tapping ahead to scout a future rank
  // would snap straight back. Adjusted during render rather than in an effect so
  // the caption never paints one frame behind.
  const [levelAtLastFollow, setLevelAtLastFollow] = useState(state.level);
  if (levelAtLastFollow !== state.level) {
    setLevelAtLastFollow(state.level);
    setSelected(state.level);
  }

  // Centre the current node. Layout effect so the map never flashes at the top,
  // and unanimated on first paint but smooth for level-ups afterwards.
  const hasScrolled = useRef(false);
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const scale = el.clientWidth / VIEW_W;
    const target = nodeY(state.level - 1) * scale - el.clientHeight / 2;
    el.scrollTo({ top: Math.max(0, target), behavior: hasScrolled.current ? 'smooth' : 'auto' });
    hasScrolled.current = true;
  }, [state.level]);

  const selectedRank = RANKS[rankIndexForLevel(selected)];
  const selectedCost = xpToReachLevel(selected);
  const selectedStatus = selected < state.level ? 'done' : selected === state.level ? 'current' : 'locked';

  const progressPct = state.isMaxLevel ? 100 : (state.xpIntoLevel / state.xpForLevel) * 100;

  return (
    <>
      <style>{STYLES}</style>

      {/* ── Rank card ── */}
      <div className="rounded-2xl p-6" style={CARD_STYLE}>
        <CelebrationBanner celebration={celebration} />

        <div className="flex items-center gap-4">
          <div
            key={state.rankIndex}
            className="qm-celebrate rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: '60px',
              height: '60px',
              fontSize: '28px',
              background: `${state.rank.color}1f`,
              border: `2px solid ${state.rank.color}`,
              boxShadow: `0 4px 16px ${state.rank.color}33`,
            }}
          >
            {state.rank.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Level {state.level} of {TOTAL_LEVELS}</p>
            <h3 className="font-bold text-gray-900 truncate" style={{ fontSize: '1.125rem' }}>{state.rank.name}</h3>
            <p className="text-gray-500" style={{ fontSize: '0.8125rem' }}>
              {state.isMaxLevel
                ? 'Top of the tree — nothing left to climb'
                : `${state.xpToNextLevel} XP to level ${state.level + 1}`}
            </p>
          </div>
        </div>

        <div className="mt-4 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(progressPct, 100)}%`,
              background: `linear-gradient(90deg, ${state.rank.color}, ${(state.nextRank || state.rank).color})`,
            }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-gray-500">
            <span className="font-bold text-gray-900">{state.xp}</span> XP total
          </span>
          {state.streak > 0 && (
            <span className="font-semibold text-gray-700">🔥 {state.streak}-day streak</span>
          )}
        </div>

        {state.nextRank && (
          <p className="text-gray-500 mt-3 pt-3 border-t border-gray-100" style={{ fontSize: '0.8125rem' }}>
            {state.levelsToNextRank} {state.levelsToNextRank === 1 ? 'level' : 'levels'} until{' '}
            <span className="font-semibold" style={{ color: state.nextRank.color }}>{state.nextRank.emoji} {state.nextRank.name}</span>
          </p>
        )}
      </div>

      {/* ── Today's rounds ── */}
      <div className="rounded-2xl p-6" style={CARD_STYLE}>
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="font-bold text-gray-900" style={{ fontSize: '1.125rem' }}>Today&apos;s Rounds</h3>
          <span className="text-sm font-bold text-gray-900">{doneToday.size}/{GAMES.length}</span>
        </div>
        <p className="text-gray-500 mb-4" style={{ fontSize: '0.8125rem' }}>
          {state.sweptToday
            ? `Full house — that's +${SWEEP_BONUS} bonus XP banked 🎉`
            : `1 XP a game, once a day. Clear all ${GAMES.length} for +${SWEEP_BONUS} bonus.`}
        </p>

        <div className="space-y-1.5">
          {GAMES.map((game) => {
            const done = doneToday.has(game.id);
            return (
              <button
                key={game.id}
                onClick={() => onLaunch(game.id)}
                className="w-full rounded-xl px-3 py-2.5 flex items-center gap-3 text-left transition-all hover:scale-[1.015]"
                style={{
                  borderRadius: '12px',
                  background: done ? `${game.tint.replace('0.9', '0.16')}` : 'rgba(255,255,255,0.5)',
                  border: `1px solid ${done ? game.tint.replace('0.9', '0.45') : 'rgba(255,255,255,0.7)'}`,
                }}
              >
                <span className="text-lg flex-shrink-0" style={{ opacity: done ? 1 : 0.75 }}>{game.emoji}</span>
                <span className={`flex-1 truncate ${done ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`} style={{ fontSize: '0.875rem' }}>
                  {game.label}
                </span>
                <span
                  className="rounded-full flex items-center justify-center flex-shrink-0 text-white"
                  style={{
                    width: '20px',
                    height: '20px',
                    fontSize: '11px',
                    background: done ? '#059669' : 'rgba(0,0,0,0.12)',
                  }}
                >
                  {done ? '✓' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── The map ── */}
      <div className="rounded-2xl p-6" style={CARD_STYLE}>
        <h3 className="font-bold text-gray-900" style={{ fontSize: '1.125rem' }}>The Path to Consultant</h3>
        <p className="text-gray-500 mt-0.5 mb-4" style={{ fontSize: '0.8125rem' }}>
          {state.isMaxLevel
            ? `All ${TOTAL_LEVELS} levels cleared 👑`
            : `${state.xpToConsultant} XP left across ${TOTAL_LEVELS - state.level} levels`}
        </p>

        <div
          ref={scrollerRef}
          className="rounded-xl"
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.7)',
            padding: '0 4px',
          }}
        >
          <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} width="100%" style={{ display: 'block' }}>
            {/* Track: the full route in grey, with the walked part drawn over it. */}
            <path d={TRACK} fill="none" stroke="rgba(0,0,0,0.09)" strokeWidth="9" strokeLinecap="round" strokeDasharray="1 14" />
            <path
              d={TRACK}
              fill="none"
              stroke={state.rank.color}
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.35"
              pathLength={TOTAL_LEVELS - 1}
              strokeDasharray={`${state.level - 1} ${TOTAL_LEVELS}`}
            />

            {NODES.map((node) => (
              node.milestone
                ? <RankLabel key={`label-${node.level}`} node={node} reached={state.level >= node.level} />
                : null
            ))}

            {NODES.map((node) => (
              <LevelNode
                key={node.level}
                node={node}
                status={node.level < state.level ? 'done' : node.level === state.level ? 'current' : 'locked'}
                selected={node.level === selected}
                onSelect={setSelected}
              />
            ))}
          </svg>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2.5">
          <span className="text-base">{selectedRank.emoji}</span>
          <div className="min-w-0">
            <p className="font-bold text-gray-900" style={{ fontSize: '0.875rem' }}>
              Level {selected} · {selectedRank.name}
            </p>
            <p className="text-gray-500" style={{ fontSize: '0.75rem' }}>
              {selectedStatus === 'done' && 'Cleared'}
              {selectedStatus === 'current' && `You are here — ${state.xpToNextLevel} XP to go`}
              {selectedStatus === 'locked' && `Unlocks at ${selectedCost} XP · ${selectedCost - state.xp} to go`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Mobile ─────────────────────────────────────────────────────────────────
   The sidebar is desktop-only, so on a phone the same progress arrives as a
   compact strip under the greeting that opens the full map as a sheet. Both
   render the very same QuestMap, so there is one implementation to keep true. */

/** The tappable progress bar phones get in place of the sidebar. */
export function QuestStrip({ state, onOpen }) {
  const progressPct = state.isMaxLevel ? 100 : (state.xpIntoLevel / state.xpForLevel) * 100;

  return (
    <>
      <style>{STYLES}</style>
      <button
        onClick={onOpen}
        className="w-full rounded-2xl p-4 text-left transition-transform active:scale-[0.99]"
        style={CARD_STYLE}
      >
        <div className="flex items-center gap-3">
          <div
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: '44px',
              height: '44px',
              fontSize: '22px',
              background: `${state.rank.color}1f`,
              border: `2px solid ${state.rank.color}`,
            }}
          >
            {state.rank.emoji}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="font-bold text-gray-900 truncate" style={{ fontSize: '0.9375rem' }}>
                Level {state.level} · {state.rank.name}
              </p>
              <span className="text-xs font-bold text-gray-700 flex-shrink-0">
                {state.todayGames.length}/{GAMES.length} today
              </span>
            </div>

            <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(progressPct, 100)}%`,
                  background: `linear-gradient(90deg, ${state.rank.color}, ${(state.nextRank || state.rank).color})`,
                }}
              />
            </div>

            <p className="text-gray-500 mt-1.5 truncate" style={{ fontSize: '0.75rem' }}>
              {state.isMaxLevel ? 'Top of the tree 👑' : `${state.xpToNextLevel} XP to level ${state.level + 1}`}
              {state.streak > 0 && ` · 🔥 ${state.streak} days`}
            </p>
          </div>

          {/* Affordance for the sheet, kept out of the copy so nothing wraps. */}
          <span className="text-gray-400 flex-shrink-0 text-lg leading-none" aria-hidden="true">›</span>
        </div>
      </button>
    </>
  );
}

/** Full-screen quest map for phones, opened from the strip. */
export function QuestSheet({ state, celebration, onLaunch, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #d9f5e5 30%, #dcf5e0 65%, #e6faf0 100%)' }}
    >
      <div className="max-w-md mx-auto px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900" style={{ fontSize: '1.25rem' }}>Your Progress</h2>
          <button
            onClick={onClose}
            className="rounded-full flex items-center justify-center text-gray-700 text-lg leading-none"
            style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.9)' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <QuestMap state={state} celebration={celebration} onLaunch={onLaunch} />
        <div className="h-4" />
      </div>
    </div>
  );
}
