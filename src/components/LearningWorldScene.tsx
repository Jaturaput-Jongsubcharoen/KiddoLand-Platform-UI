import React from 'react';
import { Box } from '@mui/material';

/**
 * LearningWorldScene - Playful Learning World Background
 * Creates a kid-friendly backdrop: sky, rainbow, clouds, hills, sparkles
 * ONE main mascot (Owl guide) + subtle background elements
 * Lightweight inline SVG + CSS animations
 */

// Color Constants (easy to customize)
const COLORS = {
  sky: {
    top: '#6BB5D8',      // Deeper sky blue (for depth)
    middle: '#B4E4FF',   // Light blue
    bottom: '#FFF9E6',   // Warm cream
  },
  rainbow: ['#FF6B6B', '#FFB347', '#FFD93D', '#6BCB77', '#4D96FF', '#9B72CB', '#FF6B9D'],
  clouds: '#FFFFFF',
  hills: {
    back: '#A8E6A1',     // Light green
    middle: '#7FD77F',   // Medium green
    front: '#5BB667',    // Stronger green (for depth)
  },
  sparkles: '#FFD700',   // Gold
};

// Animation speeds (easy to adjust)
const ANIMATIONS = {
  cloudDrift: '60s',     // Slow cloud movement
  sparkle: '3s',         // Twinkle speed
  rainbowPulse: '8s',    // Rainbow glow pulse
};

export const LearningWorldScene: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}
    >
      {/* Sky Gradient with Depth */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 60% 40% at 50% 15%, rgba(135, 206, 250, 0.3) 0%, transparent 60%),
            linear-gradient(180deg, ${COLORS.sky.top} 0%, ${COLORS.sky.middle} 45%, ${COLORS.sky.bottom} 100%)
          `,
        }}
      />

      {/* Main SVG Layer */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <defs>
          {/* Rainbow Gradient - Softer */}
          <linearGradient id="rainbowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            {COLORS.rainbow.map((color, index) => (
              <stop
                key={index}
                offset={`${(index / (COLORS.rainbow.length - 1)) * 100}%`}
                stopColor={color}
                stopOpacity="0.4"
              />
            ))}
          </linearGradient>
          
          {/* Soft blur for dreamy effect */}
          <filter id="softBlur">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>

          {/* Glow filter for rainbow - even more blur */}
          <filter id="rainbowGlow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Bold Rainbow Arc (Behind Content) - Lowered */}
        <g className="rainbow-arc">
          <path
            d="M 100,600 Q 720,220 1340,600"
            stroke="url(#rainbowGradient)"
            strokeWidth="60"
            fill="none"
            strokeLinecap="round"
            filter="url(#rainbowGlow)"
          >
            <animate
              attributeName="opacity"
              values="0.6;0.75;0.6"
              dur={ANIMATIONS.rainbowPulse}
              repeatCount="indefinite"
            />
          </path>
        </g>

        {/* Soft Clouds (Drifting) */}
        <g className="clouds" opacity="0.85">
          {/* Cloud 1 */}
          <g>
            <ellipse cx="250" cy="140" rx="65" ry="42" fill={COLORS.clouds} />
            <ellipse cx="295" cy="135" rx="55" ry="38" fill={COLORS.clouds} />
            <ellipse cx="215" cy="152" rx="48" ry="32" fill={COLORS.clouds} />
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 100,0; 0,0"
              dur={ANIMATIONS.cloudDrift}
              repeatCount="indefinite"
            />
          </g>

          {/* Cloud 2 */}
          <g>
            <ellipse cx="1100" cy="170" rx="75" ry="48" fill={COLORS.clouds} />
            <ellipse cx="1155" cy="165" rx="60" ry="40" fill={COLORS.clouds} />
            <ellipse cx="1055" cy="185" rx="52" ry="35" fill={COLORS.clouds} />
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -80,0; 0,0"
              dur={ANIMATIONS.cloudDrift}
              repeatCount="indefinite"
            />
          </g>

          {/* Cloud 3 (smaller, middle) */}
          <g opacity="0.7">
            <ellipse cx="600" cy="100" rx="50" ry="32" fill={COLORS.clouds} />
            <ellipse cx="635" cy="98" rx="42" ry="28" fill={COLORS.clouds} />
            <ellipse cx="572" cy="108" rx="38" ry="24" fill={COLORS.clouds} />
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 60,0; 0,0"
              dur="50s"
              repeatCount="indefinite"
            />
          </g>

          {/* Cloud 4 (extra soft, top-left edge) */}
          <g opacity="0.5">
            <ellipse cx="100" cy="60" rx="45" ry="28" fill={COLORS.clouds} />
            <ellipse cx="130" cy="58" rx="38" ry="24" fill={COLORS.clouds} />
            <ellipse cx="75" cy="68" rx="32" ry="20" fill={COLORS.clouds} />
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 80,0; 0,0"
              dur="70s"
              repeatCount="indefinite"
            />
          </g>

          {/* Cloud 5 (extra soft, top-right edge) */}
          <g opacity="0.55">
            <ellipse cx="1340" cy="70" rx="50" ry="30" fill={COLORS.clouds} />
            <ellipse cx="1310" cy="75" rx="40" ry="25" fill={COLORS.clouds} />
            <ellipse cx="1370" cy="78" rx="35" ry="22" fill={COLORS.clouds} />
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -70,0; 0,0"
              dur="65s"
              repeatCount="indefinite"
            />
          </g>

          {/* Cloud 6 (top-left corner) */}
          <g opacity="0.45">
            <ellipse cx="50" cy="35" rx="42" ry="26" fill={COLORS.clouds} />
            <ellipse cx="22" cy="40" rx="35" ry="22" fill={COLORS.clouds} />
            <ellipse cx="75" cy="42" rx="30" ry="18" fill={COLORS.clouds} />
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; 90,0; 0,0"
              dur="75s"
              repeatCount="indefinite"
            />
          </g>

          {/* Cloud 7 (top-right corner) */}
          <g opacity="0.5">
            <ellipse cx="1390" cy="40" rx="45" ry="28" fill={COLORS.clouds} />
            <ellipse cx="1420" cy="45" rx="38" ry="24" fill={COLORS.clouds} />
            <ellipse cx="1365" cy="48" rx="32" ry="20" fill={COLORS.clouds} />
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -85,0; 0,0"
              dur="70s"
              repeatCount="indefinite"
            />
          </g>
        </g>

        {/* Gentle Hills at Bottom - Improved Depth */}
        <g className="hills">
          {/* Far back hill (new layer) */}
          <path
            d="M 0,750 Q 480,680 960,720 Q 1200,740 1440,710 L 1440,900 L 0,900 Z"
            fill={COLORS.hills.back}
            opacity="0.4"
          />
          {/* Back hill */}
          <path
            d="M 0,780 Q 360,710 720,750 Q 1080,790 1440,770 L 1440,900 L 0,900 Z"
            fill={COLORS.hills.back}
            opacity="0.6"
          />
          {/* Middle hill - more curved */}
          <path
            d="M 0,820 Q 360,760 720,800 Q 1080,840 1440,820 L 1440,900 L 0,900 Z"
            fill={COLORS.hills.middle}
            opacity="0.75"
          />
          {/* Front ground - stronger */}
          <path
            d="M 0,860 Q 360,850 720,855 Q 1080,860 1440,850 L 1440,900 L 0,900 Z"
            fill={COLORS.hills.front}
            opacity="0.9"
          />
        </g>

        {/* Floating Sparkles/Stars (Enhanced) */}
        <g className="sparkles">
          {[
            { cx: 180, cy: 90, r: 3, dur: '6s', delay: '0s', opacity: 0.35 },
            { cx: 1250, cy: 120, r: 4, dur: '7s', delay: '0.5s', opacity: 0.4 },
            { cx: 520, cy: 70, r: 3, dur: '6.5s', delay: '1s', opacity: 0.3 },
            { cx: 880, cy: 95, r: 3, dur: '8s', delay: '1.5s', opacity: 0.35 },
            { cx: 400, cy: 180, r: 2.5, dur: '7.5s', delay: '2s', opacity: 0.3 },
            { cx: 1000, cy: 150, r: 2.5, dur: '8.5s', delay: '2.5s', opacity: 0.35 },
            { cx: 300, cy: 140, r: 3.5, dur: '9s', delay: '0.8s', opacity: 0.4 },
            { cx: 1150, cy: 90, r: 3, dur: '8.5s', delay: '1.2s', opacity: 0.35 },
            { cx: 650, cy: 160, r: 2.8, dur: '7.2s', delay: '2.2s', opacity: 0.3 },
            { cx: 950, cy: 200, r: 3.2, dur: '8.2s', delay: '1.8s', opacity: 0.35 },
            { cx: 220, cy: 60, r: 3, dur: '9.5s', delay: '0.3s', opacity: 0.3 },
            { cx: 1300, cy: 80, r: 3.5, dur: '8.8s', delay: '1.5s', opacity: 0.35 },
            { cx: 450, cy: 110, r: 2.8, dur: '7.8s', delay: '2.8s', opacity: 0.3 },
            { cx: 1050, cy: 75, r: 3.2, dur: '9.2s', delay: '0.5s', opacity: 0.4 },
            { cx: 750, cy: 130, r: 2.5, dur: '8s', delay: '2s', opacity: 0.3 },
            { cx: 120, cy: 180, r: 3, dur: '7.5s', delay: '1s', opacity: 0.35 },
          ].map((sparkle, index) => (
            <circle
              key={index}
              cx={sparkle.cx}
              cy={sparkle.cy}
              r={sparkle.r}
              fill={COLORS.sparkles}
              opacity={sparkle.opacity}
            >
              <animate
                attributeName="opacity"
                values={`${sparkle.opacity * 0.5};${sparkle.opacity};${sparkle.opacity * 0.5}`}
                dur={sparkle.dur}
                begin={sparkle.delay}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values={`${sparkle.r};${sparkle.r * 1.2};${sparkle.r}`}
                dur={sparkle.dur}
                begin={sparkle.delay}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </g>

        {/* Learning-themed Icons (Ambient) */}
        <g className="learning-icons" opacity="0.22">
          {/* ABC letters */}
          <text x="200" y="420" fontSize="28" fill="#4D96FF" fontWeight="bold" fontFamily="Arial">ABC</text>
          
          {/* Book icon */}
          <g transform="translate(1100, 350)">
            <rect x="0" y="0" width="30" height="22" rx="2" fill="#FF6B9D" />
            <line x1="15" y1="0" x2="15" y2="22" stroke="#FFFFFF" strokeWidth="2" />
          </g>
          
          {/* Pencil icon */}
          <g transform="translate(350, 300)">
            <rect x="0" y="0" width="8" height="35" rx="1" fill="#FFD93D" transform="rotate(-30 4 17)" />
            <polygon points="0,35 4,40 8,35" fill="#FF8C42" transform="rotate(-30 4 37)" />
          </g>
          
          {/* Music note */}
          <g transform="translate(1200, 480)">
            <circle cx="0" cy="20" r="6" fill="#9B72CB" />
            <rect x="6" y="0" width="3" height="21" fill="#9B72CB" />
          </g>
          
          {/* Math symbols */}
          <text x="280" y="520" fontSize="24" fill="#6BCB77" fontWeight="bold" fontFamily="Arial">1+2</text>
          
          {/* Star outline */}
          <g transform="translate(1050, 430)">
            <path d="M 0,-10 L 3,-3 L 10,-3 L 4,2 L 6,9 L 0,4 L -6,9 L -4,2 L -10,-3 L -3,-3 Z" 
                  fill="none" stroke="#FF6B6B" strokeWidth="2" />
          </g>
        </g>

        {/* Wise Owl Guide (Left-Middle Edge) - COMMENTED OUT */}
        {/* <g transform="translate(180, 420)" className="owl-guide"> */}
          {/* Welcoming pose - larger and centered */}
          
          {/* Glow/Aura behind owl */}
          {/* <circle cx="0" cy="0" r="70" fill="#FFE5B4" opacity="0.3">
            <animate
              attributeName="opacity"
              values="0.2;0.4;0.2"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle> */}

          {/* Body */}
          {/* <ellipse cx="0" cy="10" rx="38" ry="48" fill="#8B7355" /> */}
          {/* Belly */}
          {/* <ellipse cx="0" cy="15" rx="26" ry="38" fill="#D4A574" /> */}
          
          {/* Head */}
          {/* <circle cx="0" cy="-30" r="32" fill="#A0826D" /> */}
          
          {/* Eyes (wide and friendly) */}
          {/* <circle cx="-12" cy="-30" r="10" fill="#FFFFFF" />
          <circle cx="12" cy="-30" r="10" fill="#FFFFFF" />
          <circle cx="-12" cy="-30" r="5" fill="#2C1810" />
          <circle cx="12" cy="-30" r="5" fill="#2C1810" /> */}
          {/* Eye shine */}
          {/* <circle cx="-10" cy="-32" r="2" fill="#FFFFFF" />
          <circle cx="14" cy="-32" r="2" fill="#FFFFFF" /> */}
          
          {/* Beak */}
          {/* <polygon points="0,-24 -6,-18 6,-18" fill="#F4A460" /> */}
          
          {/* Ear tufts */}
          {/* <polygon points="-22,-48 -26,-60 -18,-50" fill="#8B7355" />
          <polygon points="22,-48 26,-60 18,-50" fill="#8B7355" /> */}
          
          {/* Wings (slightly out, welcoming) */}
          {/* <ellipse cx="-35" cy="15" rx="12" ry="30" fill="#8B7355" transform="rotate(-20 -35 15)" />
          <ellipse cx="35" cy="15" rx="12" ry="30" fill="#8B7355" transform="rotate(20 35 15)" /> */}
          
          {/* Book (owl is reading) */}
          {/* <g transform="translate(0, 45)">
            <rect x="-18" y="0" width="36" height="28" rx="2" fill="#E74C3C" />
            <line x1="0" y1="0" x2="0" y2="28" stroke="#C0392B" strokeWidth="2" /> */}
            {/* Pages */}
            {/* <rect x="-15" y="3" width="13" height="22" fill="#FFF9E6" />
            <rect x="2" y="3" width="13" height="22" fill="#FFF9E6" />
          </g> */}

          {/* Gentle bob animation */}
          {/* <animateTransform
            attributeName="transform"
            type="translate"
            values="180,420; 180,418; 180,420"
            dur="10s"
            repeatCount="indefinite"
          />
        </g> */}

        {/* Decorative Animals (Ambient) */}
        {/* Friendly Fox - Right-Middle Edge */}
        <g transform="translate(1270, 450)" opacity="0.85">
          <ellipse cx="0" cy="0" rx="18" ry="22" fill="#FF8C42" />
          <circle cx="0" cy="-14" r="14" fill="#FF8C42" />
          <ellipse cx="0" cy="-10" rx="8" ry="10" fill="#FFFFFF" />
          <polygon points="-10,-22 -12,-28 -8,-24" fill="#FF8C42" />
          <polygon points="10,-22 12,-28 8,-24" fill="#FF8C42" />
          <circle cx="-5" cy="-14" r="2" fill="#2C1810" />
          <circle cx="5" cy="-14" r="2" fill="#2C1810" />
          <circle cx="0" cy="-12" r="2.5" fill="#2C1810" />
          {/* Gentle sway */}
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 0 0; -3 0 0; 0 0 0; 3 0 0; 0 0 0"
            dur="8s"
            repeatCount="indefinite"
          />
        </g>

        {/* Cute Penguin - Bottom-Right Near Hill */}
        <g transform="translate(1300, 810)" opacity="0.85">
          {/* Body (black) */}
          <ellipse cx="0" cy="0" rx="20" ry="26" fill="#2C3E50" />
          {/* Belly (white) */}
          <ellipse cx="0" cy="2" rx="14" ry="20" fill="#FFFFFF" />
          {/* Head */}
          <circle cx="0" cy="-20" r="16" fill="#2C3E50" />
          {/* Face (white) */}
          <ellipse cx="0" cy="-18" rx="11" ry="13" fill="#FFFFFF" />
          {/* Eyes */}
          <circle cx="-5" cy="-20" r="3" fill="#2C1810" />
          <circle cx="5" cy="-20" r="3" fill="#2C1810" />
          {/* Eye shine */}
          <circle cx="-4" cy="-21" r="1.2" fill="#FFFFFF" />
          <circle cx="6" cy="-21" r="1.2" fill="#FFFFFF" />
          {/* Beak (orange) */}
          <polygon points="0,-16 -4,-14 4,-14" fill="#FF8C42" />
          {/* Wings */}
          <ellipse cx="-18" cy="5" rx="7" ry="18" fill="#34495E" transform="rotate(-15 -18 5)" />
          <ellipse cx="18" cy="5" rx="7" ry="18" fill="#34495E" transform="rotate(15 18 5)" />
          {/* Feet (orange) */}
          <ellipse cx="-8" cy="26" rx="6" ry="4" fill="#FF8C42" />
          <ellipse cx="8" cy="26" rx="6" ry="4" fill="#FF8C42" />
          {/* Gentle bob animation */}
          <animateTransform
            attributeName="transform"
            type="translate"
            values="1300,810; 1300,808; 1300,810"
            dur="12s"
            repeatCount="indefinite"
          />
        </g>
      </svg>

      {/* Prefers Reduced Motion: Disable all animations */}
      <style>
        {`
          @media (prefers-reduced-motion: reduce) {
            .clouds animateTransform,
            .sparkles animate,
            .sparkles animateTransform,
            .rainbow-arc animate,
            /* .owl-guide animateTransform, */
            /* .owl-guide circle animate, */
            .learning-icons animate,
            g[transform*="translate(1270, 450)"] animateTransform,
            g[transform*="translate(1300, 810)"] animateTransform {
              animation: none !important;
              animation-duration: 0s !important;
            }
            svg animate,
            svg animateTransform {
              animation-play-state: paused !important;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default LearningWorldScene;
