import { useEffect, useState } from 'react'

const SadPuppy = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48">
    <style>
      {`
        @keyframes ear-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes tail-wag {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }
        @keyframes blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .puppy-body { animation: float 3s ease-in-out infinite; }
        .puppy-ear-left { transform-origin: 70px 50px; animation: ear-wiggle 2s ease-in-out infinite; }
        .puppy-ear-right { transform-origin: 130px 50px; animation: ear-wiggle 2s ease-in-out infinite 0.5s; }
        .puppy-eye { transform-origin: center; animation: blink 4s ease-in-out infinite; }
        .puppy-tail { transform-origin: 160px 130px; animation: tail-wag 0.5s ease-in-out infinite; }
      `}
    </style>
    <g className="puppy-body">
      {/* Body */}
      <ellipse cx="100" cy="130" rx="50" ry="40" fill="#D4A574" />
      {/* Head */}
      <circle cx="100" cy="80" r="45" fill="#E8C4A0" />
      {/* Ears */}
      <ellipse className="puppy-ear-left" cx="60" cy="55" rx="18" ry="30" fill="#C4956A" />
      <ellipse className="puppy-ear-right" cx="140" cy="55" rx="18" ry="30" fill="#C4956A" />
      {/* Snout */}
      <ellipse cx="100" cy="95" rx="20" ry="15" fill="#F5DFC5" />
      {/* Nose */}
      <ellipse cx="100" cy="88" rx="8" ry="6" fill="#4A3728" />
      {/* Eyes - Sad look */}
      <g className="puppy-eye">
        <ellipse cx="80" cy="72" rx="10" ry="12" fill="white" />
        <circle cx="82" cy="74" r="6" fill="#4A3728" />
        <circle cx="84" cy="72" r="2" fill="white" />
      </g>
      <g className="puppy-eye">
        <ellipse cx="120" cy="72" rx="10" ry="12" fill="white" />
        <circle cx="118" cy="74" r="6" fill="#4A3728" />
        <circle cx="116" cy="72" r="2" fill="white" />
      </g>
      {/* Sad eyebrows */}
      <path d="M70 62 Q80 58 90 64" stroke="#4A3728" strokeWidth="2" fill="none" />
      <path d="M110 64 Q120 58 130 62" stroke="#4A3728" strokeWidth="2" fill="none" />
      {/* Mouth - Slight frown */}
      <path d="M92 102 Q100 98 108 102" stroke="#4A3728" strokeWidth="2" fill="none" />
      {/* Paws */}
      <ellipse cx="70" cy="165" rx="15" ry="10" fill="#E8C4A0" />
      <ellipse cx="130" cy="165" rx="15" ry="10" fill="#E8C4A0" />
      {/* Tail */}
      <path className="puppy-tail" d="M150 130 Q170 120 165 100" stroke="#D4A574" strokeWidth="12" strokeLinecap="round" fill="none" />
      {/* Collar */}
      <path d="M60 110 Q100 125 140 110" stroke="#EF4444" strokeWidth="6" fill="none" />
      <circle cx="100" cy="118" r="6" fill="#FCD34D" />
    </g>
  </svg>
)

const LookingCat = () => {
  const [lookDir, setLookDir] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLookDir(d => (d + 1) % 3)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const eyeOffset = lookDir === 0 ? 0 : lookDir === 1 ? -3 : 3

  return (
    <svg viewBox="0 0 200 200" className="w-48 h-48">
      <style>
        {`
          @keyframes cat-ear-twitch {
            0%, 90%, 100% { transform: rotate(0deg); }
            93% { transform: rotate(-8deg); }
            96% { transform: rotate(0deg); }
          }
          @keyframes cat-tail-sway {
            0%, 100% { transform: rotate(-15deg); }
            50% { transform: rotate(15deg); }
          }
          @keyframes cat-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .cat-body { animation: cat-float 4s ease-in-out infinite; }
          .cat-ear-left { transform-origin: 65px 35px; animation: cat-ear-twitch 3s ease-in-out infinite; }
          .cat-ear-right { transform-origin: 135px 35px; animation: cat-ear-twitch 3s ease-in-out infinite 1.5s; }
          .cat-tail { transform-origin: 155px 140px; animation: cat-tail-sway 2s ease-in-out infinite; }
        `}
      </style>
      <g className="cat-body">
        {/* Body */}
        <ellipse cx="100" cy="140" rx="45" ry="35" fill="#8B8B8B" />
        {/* Head */}
        <circle cx="100" cy="85" r="40" fill="#A0A0A0" />
        {/* Ears */}
        <polygon className="cat-ear-left" points="65,35 55,75 85,65" fill="#A0A0A0" />
        <polygon className="cat-ear-right" points="135,35 145,75 115,65" fill="#A0A0A0" />
        <polygon points="68,42 62,68 80,62" fill="#FFB6C1" />
        <polygon points="132,42 138,68 120,62" fill="#FFB6C1" />
        {/* Face */}
        <ellipse cx="100" cy="95" rx="12" ry="8" fill="#D4D4D4" />
        {/* Nose */}
        <polygon points="100,90 96,96 104,96" fill="#FFB6C1" />
        {/* Eyes - Looking around */}
        <ellipse cx="78" cy="80" rx="12" ry="14" fill="#90EE90" />
        <ellipse cx="122" cy="80" rx="12" ry="14" fill="#90EE90" />
        <circle cx={78 + eyeOffset} cy="82" r="6" fill="#1a1a1a">
          <animate attributeName="r" values="6;4;6" dur="0.3s" begin="2s" />
        </circle>
        <circle cx={122 + eyeOffset} cy="82" r="6" fill="#1a1a1a">
          <animate attributeName="r" values="6;4;6" dur="0.3s" begin="2s" />
        </circle>
        <circle cx={80 + eyeOffset} cy="79" r="2" fill="white" />
        <circle cx={124 + eyeOffset} cy="79" r="2" fill="white" />
        {/* Whiskers */}
        <g stroke="#666" strokeWidth="1">
          <line x1="60" y1="90" x2="40" y2="85" />
          <line x1="60" y1="95" x2="38" y2="95" />
          <line x1="60" y1="100" x2="40" y2="105" />
          <line x1="140" y1="90" x2="160" y2="85" />
          <line x1="140" y1="95" x2="162" y2="95" />
          <line x1="140" y1="100" x2="160" y2="105" />
        </g>
        {/* Mouth */}
        <path d="M94 100 Q100 105 106 100" stroke="#666" strokeWidth="1.5" fill="none" />
        {/* Paws */}
        <ellipse cx="70" cy="170" rx="14" ry="8" fill="#A0A0A0" />
        <ellipse cx="130" cy="170" rx="14" ry="8" fill="#A0A0A0" />
        {/* Tail */}
        <path className="cat-tail" d="M145 140 Q175 130 170 100 Q168 85 175 75" stroke="#8B8B8B" strokeWidth="10" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  )
}

const SleepingDog = () => (
  <svg viewBox="0 0 200 120" className="w-56 h-32">
    <style>
      {`
        @keyframes sleep-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.05); }
        }
        @keyframes zzz-float {
          0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translate(15px, -20px) scale(1); }
        }
        .sleep-body { transform-origin: center bottom; animation: sleep-breathe 3s ease-in-out infinite; }
        .zzz1 { animation: zzz-float 2s ease-out infinite; }
        .zzz2 { animation: zzz-float 2s ease-out infinite 0.6s; }
        .zzz3 { animation: zzz-float 2s ease-out infinite 1.2s; }
      `}
    </style>
    <g className="sleep-body">
      {/* Body lying down */}
      <ellipse cx="100" cy="85" rx="70" ry="25" fill="#D4A574" />
      {/* Head resting */}
      <ellipse cx="45" cy="75" rx="30" ry="25" fill="#E8C4A0" />
      {/* Ear flopped */}
      <ellipse cx="25" cy="60" rx="12" ry="20" fill="#C4956A" />
      {/* Closed eyes */}
      <path d="M35 70 Q40 68 45 70" stroke="#4A3728" strokeWidth="2" fill="none" />
      <path d="M50 70 Q55 68 60 70" stroke="#4A3728" strokeWidth="2" fill="none" />
      {/* Nose */}
      <ellipse cx="30" cy="78" rx="5" ry="4" fill="#4A3728" />
      {/* Smile while sleeping */}
      <path d="M28 85 Q35 88 42 85" stroke="#4A3728" strokeWidth="1.5" fill="none" />
      {/* Paws */}
      <ellipse cx="75" cy="100" rx="12" ry="8" fill="#E8C4A0" />
      <ellipse cx="125" cy="100" rx="12" ry="8" fill="#E8C4A0" />
      {/* Tail */}
      <ellipse cx="170" cy="80" rx="20" ry="8" fill="#D4A574" />
    </g>
    {/* ZZZ */}
    <text className="zzz1" x="55" y="50" fill="#94A3B8" fontSize="14" fontWeight="bold">z</text>
    <text className="zzz2" x="65" y="40" fill="#94A3B8" fontSize="16" fontWeight="bold">z</text>
    <text className="zzz3" x="78" y="28" fill="#94A3B8" fontSize="18" fontWeight="bold">Z</text>
  </svg>
)

const HappyBird = () => (
  <svg viewBox="0 0 200 200" className="w-48 h-48">
    <style>
      {`
        @keyframes bird-hop {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes wing-flap {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-20deg); }
          75% { transform: rotate(20deg); }
        }
        @keyframes head-tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
        .bird-body { animation: bird-hop 1s ease-in-out infinite; }
        .bird-wing { transform-origin: 85px 110px; animation: wing-flap 0.3s ease-in-out infinite; }
        .bird-head { transform-origin: 100px 70px; animation: head-tilt 2s ease-in-out infinite; }
      `}
    </style>
    <g className="bird-body">
      {/* Body */}
      <ellipse cx="100" cy="120" rx="35" ry="30" fill="#FFD93D" />
      {/* Wing */}
      <ellipse className="bird-wing" cx="75" cy="115" rx="20" ry="25" fill="#FFC107" />
      {/* Head */}
      <g className="bird-head">
        <circle cx="100" cy="70" r="28" fill="#FFD93D" />
        {/* Beak */}
        <polygon points="128,70 145,75 128,80" fill="#FF8C00" />
        {/* Eye */}
        <circle cx="108" cy="65" r="8" fill="white" />
        <circle cx="110" cy="66" r="4" fill="#1a1a1a" />
        <circle cx="111" cy="64" r="1.5" fill="white" />
        {/* Cheek */}
        <circle cx="95" cy="78" r="6" fill="#FFB6C1" opacity="0.6" />
        {/* Crest */}
        <ellipse cx="85" cy="48" rx="8" ry="15" fill="#FF8C00" />
      </g>
      {/* Tail */}
      <polygon points="65,130 45,150 50,125 40,140 60,120" fill="#FFC107" />
      {/* Feet */}
      <g fill="#FF8C00">
        <rect x="88" y="148" width="4" height="15" />
        <rect x="108" y="148" width="4" height="15" />
        <path d="M82 163 L90 160 L90 166 Z" />
        <path d="M92 163 L90 160 L90 166 Z" />
        <path d="M102 163 L110 160 L110 166 Z" />
        <path d="M112 163 L110 160 L110 166 Z" />
      </g>
    </g>
  </svg>
)

const WalkingPaws = () => (
  <div className="flex gap-2 justify-center">
    {[0, 1, 2, 3].map((i) => (
      <svg key={i} viewBox="0 0 40 40" className="w-8 h-8" style={{ animationDelay: `${i * 0.2}s` }}>
        <style>
          {`
            @keyframes paw-step {
              0%, 100% { opacity: 0.3; transform: scale(0.8); }
              50% { opacity: 1; transform: scale(1); }
            }
            .paw-${i} { animation: paw-step 1.5s ease-in-out infinite ${i * 0.2}s; }
          `}
        </style>
        <g className={`paw-${i}`} fill="#94A3B8">
          <ellipse cx="20" cy="28" rx="10" ry="8" />
          <circle cx="10" cy="18" r="5" />
          <circle cx="20" cy="14" r="5" />
          <circle cx="30" cy="18" r="5" />
        </g>
      </svg>
    ))}
  </div>
)

export function EmptyState({ type = 'pets', title, subtitle, action }) {
  const illustrations = {
    pets: <SadPuppy />,
    reminders: <SleepingDog />,
    search: <LookingCat />,
    vaccinations: <HappyBird />,
    loading: <WalkingPaws />,
  }

  const defaultContent = {
    pets: {
      title: 'No furry friends yet!',
      subtitle: 'Add your first pet to get started with PawCare',
    },
    reminders: {
      title: 'All caught up!',
      subtitle: 'No reminders right now. Your pets are happy!',
    },
    search: {
      title: 'Nothing found',
      subtitle: 'Try adjusting your search or filters',
    },
    vaccinations: {
      title: 'No vaccination records',
      subtitle: 'Keep your pet healthy by tracking vaccinations',
    },
    loading: {
      title: 'Loading...',
      subtitle: 'Fetching your data',
    },
  }

  const content = defaultContent[type] || defaultContent.pets

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
        {illustrations[type] || illustrations.pets}
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 text-center">
        {title || content.title}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
        {subtitle || content.subtitle}
      </p>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  )
}

export { SadPuppy, LookingCat, SleepingDog, HappyBird, WalkingPaws }
