import React from 'react';

interface KernelBaseLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
  showDescriptor?: boolean;
  iconOnly?: boolean;
  monochrome?: boolean;
}

export const KernelBaseLogo: React.FC<KernelBaseLogoProps> = ({
  size = 28,
  className = '',
  showWordmark = true,
  showDescriptor = false,
  iconOnly = false,
}) => {
  const logoImg = (
    <img
      src="/logo.png"
      alt="Kernel Base"
      width={size}
      height={size}
      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 object-contain ${className}`}
      aria-hidden={showWordmark ? true : undefined}
    />
  );

  if (iconOnly) {
    return logoImg;
  }

  return (
    <div className="flex items-center gap-3 group select-none">
      {logoImg}

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-slate-900 dark:text-[#F8F5F2] font-sans leading-none">
              KERNEL BASE
            </span>
          </div>
          {showDescriptor && (
            <span className="text-[9px] font-mono text-slate-500 dark:text-[#A89B95] tracking-wider uppercase mt-0.5">
              AI-Native Multi-Agent IDE
            </span>
          )}
        </div>
      )}
    </div>
  );
};
