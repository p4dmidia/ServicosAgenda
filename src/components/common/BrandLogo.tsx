import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'purple' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showTagline?: boolean;
  className?: string;
}

export const BrandSymbol: React.FC<{ size?: number; className?: string; colorMode?: 'default' | 'white' | 'purple' }> = ({
  size = 40,
  className = '',
  colorMode = 'default',
}) => {
  const gradientId = `brand-grad-${Math.random().toString(36).substring(2, 9)}`;
  const shadowGradId = `brand-shadow-${Math.random().toString(36).substring(2, 9)}`;

  if (colorMode === 'white') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Ribbon A - White Monochromatic */}
        <path
          d="M26 84 C24 72 38 40 48 22 C52 14 62 14 66 22 L82 56 C86 64 82 72 74 72 C64 72 50 54 44 44 C38 34 32 38 34 48 C36 58 46 76 60 76 C70 76 80 68 84 62"
          stroke="#FFFFFF"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Sparkle */}
        <path
          d="M84 14 C84 20 88 24 94 24 C88 24 84 28 84 34 C84 28 80 24 74 24 C80 24 84 20 84 14 Z"
          fill="#FFFFFF"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Main Ribbon Gradient */}
        <linearGradient id={gradientId} x1="15%" y1="90%" x2="85%" y2="10%">
          <stop offset="0%" stopColor="#4C1D95" />
          <stop offset="45%" stopColor="#7C3AED" />
          <stop offset="85%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#C4B5FD" />
        </linearGradient>

        {/* Inner Ribbon Fold Shadow */}
        <linearGradient id={shadowGradId} x1="30%" y1="30%" x2="70%" y2="80%">
          <stop offset="0%" stopColor="#3B0764" />
          <stop offset="60%" stopColor="#6D28D9" />
          <stop offset="100%" stopColor="#8B5CF6" />
        </linearGradient>

        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Ribbon Loop Base Underlay */}
      <path
        d="M28 80 C26 70 38 42 48 24 C52 16 62 16 66 24 C72 36 82 58 84 66 C86 74 78 80 70 78 C60 76 48 60 42 48 C36 36 30 42 32 54 C34 66 46 80 62 80 C72 80 80 72 84 64"
        stroke={`url(#${gradientId})`}
        strokeWidth="11.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Front 3D Ribbon Overlap for Volume */}
      <path
        d="M48 24 C52 16 62 16 66 24 C71 34 78 52 82 64 C84 70 80 76 74 76 C65 76 52 60 44 48"
        stroke={`url(#${shadowGradId})`}
        strokeWidth="9.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />

      {/* Top Right Sparkle Star */}
      <path
        d="M84 12 C84 19 88.5 23 95 23 C88.5 23 84 27 84 34 C84 27 79.5 23 73 23 C79.5 23 84 19 84 12 Z"
        fill="#A78BFA"
      />
      <circle cx="84" cy="23" r="1.5" fill="#FFFFFF" />
    </svg>
  );
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  size = 'md',
  showWordmark = true,
  showTagline = false,
  className = '',
}) => {
  // Sizes
  const symbolSize = {
    sm: 30,
    md: 40,
    lg: 52,
    xl: 68,
  }[size];

  const wordmarkSize = {
    sm: { servicos: 'text-[11px]', agenda: 'text-[17px]' },
    md: { servicos: 'text-[13px]', agenda: 'text-[22px]' },
    lg: { servicos: 'text-[15px]', agenda: 'text-[28px]' },
    xl: { servicos: 'text-[18px]', agenda: 'text-[38px]' },
  }[size];

  const isDarkBg = variant === 'dark';
  const isMonochrome = variant === 'monochrome';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Symbol */}
      <div className="shrink-0 flex items-center justify-center">
        <BrandSymbol
          size={symbolSize}
          colorMode={isMonochrome ? 'white' : 'default'}
        />
      </div>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`${wordmarkSize.servicos} font-medium tracking-tight ${
              isDarkBg ? 'text-purple-200/90' : 'text-slate-500'
            }`}
          >
            serviços
          </span>
          <span
            className={`${wordmarkSize.agenda} font-bold tracking-tight -mt-0.5 ${
              isDarkBg ? 'text-white' : 'text-[#4C1D95]'
            }`}
          >
            Agenda
          </span>

          {showTagline && (
            <span
              className={`text-[10px] mt-1 font-medium ${
                isDarkBg ? 'text-purple-300/80' : 'text-purple-800/80'
              }`}
            >
              Sua agenda. Seu negócio. Tudo em um só lugar.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
