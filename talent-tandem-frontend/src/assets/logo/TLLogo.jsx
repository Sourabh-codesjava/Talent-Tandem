import React from 'react';

const TLLogo = ({ width = 50, height = 50, className = '' }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Gradient Definition */}
      <defs>
        <linearGradient id="tlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6A5AE0" />
          <stop offset="50%" stopColor="#7B7FF2" />
          <stop offset="100%" stopColor="#4F8CFF" />
        </linearGradient>
        
        {/* Glow Filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Circle */}
      <circle cx="50" cy="50" r="45" fill="url(#tlGradient)" filter="url(#glow)" />
      
      {/* Letter T */}
      <g>
        {/* T - Horizontal Top */}
        <rect x="25" y="25" width="20" height="6" fill="white" rx="2" />
        {/* T - Vertical Stem */}
        <rect x="32" y="25" width="6" height="30" fill="white" rx="2" />
      </g>
      
      {/* Letter L */}
      <g>
        {/* L - Vertical */}
        <rect x="55" y="25" width="6" height="30" fill="white" rx="2" />
        {/* L - Horizontal Bottom */}
        <rect x="55" y="49" width="20" height="6" fill="white" rx="2" />
      </g>
      
      {/* Decorative Elements - Connection Lines */}
      <line x1="38" y1="40" x2="55" y2="40" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      
      {/* Sparkle/Star Effects */}
      <circle cx="20" cy="20" r="2" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="25" r="1.5" fill="white" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="75" cy="75" r="2" fill="white" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
};

export default TLLogo;
