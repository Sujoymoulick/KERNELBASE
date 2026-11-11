import React from 'react';

export type RobotState = 'listening' | 'thinking' | 'speaking' | 'error' | 'idle';

/**
 * Kernel's animated robot. Pure SVG + CSS (no network, no WebGL) so it runs offline and stays light.
 * States: listening (head tilt, ear lights, sound rings), thinking (eyes up, visor scan),
 * speaking (mouth + arm motion, `beat` restarts the mouth on each spoken word), error (red X eyes).
 */
export const KernelRobot: React.FC<{ state: RobotState; beat?: number; size?: number }> = ({ state, beat = 0, size = 210 }) => (
  <div className="kb-robot" data-state={state} style={{ width: size, height: size * 1.27 }} data-testid="kernel-robot">
    <svg viewBox="-120 -128 240 305" role="img" aria-label={`Kernel robot, ${state}`}>
      <defs>
        <radialGradient id="kbr-shell" cx=".38" cy=".3" r=".8">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#e6ebf1" />
          <stop offset="1" stopColor="#a9b6c3" />
        </radialGradient>
        <radialGradient id="kbr-shell-dark" cx=".35" cy=".3" r=".9">
          <stop offset="0" stopColor="#f4f7fa" />
          <stop offset="1" stopColor="#8e9cab" />
        </radialGradient>
        <linearGradient id="kbr-visor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3328" />
          <stop offset=".45" stopColor="#24170f" />
          <stop offset="1" stopColor="#0d0805" />
        </linearGradient>
        <radialGradient id="kbr-floor">
          <stop offset="0" stopColor="#e97451" stopOpacity=".9" />
          <stop offset="1" stopColor="#e97451" stopOpacity="0" />
        </radialGradient>
        <filter id="kbr-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="2.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="kbr-vclip">
          <rect x="-62" y="-74" width="124" height="74" rx="37" />
        </clipPath>
      </defs>
      <circle className="ring a" cy="-10" r="96" fill="none" stroke="#e3963e" strokeWidth="2" />
      <circle className="ring b" cy="-10" r="96" fill="none" stroke="#e3963e" strokeWidth="2" />
      <circle className="ring c" cy="-10" r="96" fill="none" stroke="#e3963e" strokeWidth="2" />
      <ellipse className="floor" cx="0" cy="164" rx="62" ry="9" fill="url(#kbr-floor)" />
      <g className="float">
        <g className="arm arm-l">
          <ellipse cx="-72" cy="84" rx="13" ry="33" transform="rotate(14 -72 84)" fill="url(#kbr-shell-dark)" />
        </g>
        <g className="arm arm-r">
          <ellipse cx="72" cy="84" rx="13" ry="33" transform="rotate(-14 72 84)" fill="url(#kbr-shell-dark)" />
        </g>
        <path d="M-50 44C-60 92-42 142 0 144C42 142 60 92 50 44C30 32-30 32-50 44Z" fill="url(#kbr-shell)" />
        <path d="M-55 78Q0 100 55 78" stroke="#cc5500" strokeWidth="4" fill="none" strokeLinecap="round" filter="url(#kbr-glow)" />
        <circle className="core" cx="0" cy="112" r="6" filter="url(#kbr-glow)" />
        <circle cx="-54" cy="56" r="11" fill="#c9d2dc" />
        <path d="M-62 50a11 11 0 0 0 2 16" stroke="#cc5500" strokeWidth="3" fill="none" />
        <circle cx="54" cy="56" r="11" fill="#c9d2dc" />
        <path d="M62 50a11 11 0 0 1-2 16" stroke="#cc5500" strokeWidth="3" fill="none" />
        <ellipse cx="0" cy="34" rx="28" ry="9" fill="#b9c4cf" />
        <g className="head">
          <ellipse cx="-80" cy="-36" rx="15" ry="27" fill="url(#kbr-shell-dark)" />
          <ellipse cx="80" cy="-36" rx="15" ry="27" fill="url(#kbr-shell-dark)" />
          <path
            d="M-86 -48h10M-87 -42h12M-87 -36h12M-87 -30h12M-86 -24h10M76 -48h10M75 -42h12M75 -36h12M75 -30h12M76 -24h10"
            stroke="#7d8a98"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <ellipse className="ear" cx="-92" cy="-36" rx="3" ry="14" />
          <ellipse className="ear" cx="92" cy="-36" rx="3" ry="14" />
          <ellipse cx="0" cy="-38" rx="78" ry="70" fill="url(#kbr-shell)" />
          <ellipse cx="0" cy="-94" rx="42" ry="16" fill="#f4f7fa" stroke="#c9d2dc" strokeWidth="1.5" />
          <ellipse cx="-12" cy="-98" rx="20" ry="5" fill="#ffffff" />
          <rect className="visor" x="-62" y="-74" width="124" height="74" rx="37" fill="url(#kbr-visor)" stroke="#c9b6a6" strokeWidth="3" />
          <g clipPath="url(#kbr-vclip)">
            <rect className="scan" x="-10" y="-74" width="20" height="74" fill="#ffb45c" opacity=".2" />
            <ellipse cx="-24" cy="-68" rx="40" ry="10" fill="#ffffff" opacity=".18" />
            <g className="eyes">
              <rect className="eye" x="-31" y="-54" width="15" height="26" rx="7.5" filter="url(#kbr-glow)" />
              <rect className="eye" x="16" y="-54" width="15" height="26" rx="7.5" filter="url(#kbr-glow)" />
            </g>
            <g className="xeye" stroke="#f85149" strokeWidth="4" strokeLinecap="round">
              <path d="M-31 -49l14 14M-17 -49l-14 14M17 -49l14 14M31 -49l-14 14" />
            </g>
            <g className="mouth" key={beat % 2} filter="url(#kbr-glow)">
              <rect x="-14" y="-17" width="3" height="4" rx="1.5" />
              <rect x="-8" y="-19" width="3" height="8" rx="1.5" style={{ animationDelay: '.08s' }} />
              <rect x="-2" y="-20" width="3" height="10" rx="1.5" style={{ animationDelay: '.16s' }} />
              <rect x="4" y="-19" width="3" height="8" rx="1.5" style={{ animationDelay: '.04s' }} />
              <rect x="10" y="-17" width="3" height="4" rx="1.5" style={{ animationDelay: '.12s' }} />
            </g>
          </g>
        </g>
      </g>
    </svg>
  </div>
);
