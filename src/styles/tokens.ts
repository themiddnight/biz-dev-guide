/**
 * Design Tokens for Business ↔ Engineering Interactive Guide
 * 
 * Palette:
 * - Base/Body/Cards: Monochrome (black / neutral gray / white) for a crisp, professional look
 * - Accents: Preserved semantic tokens (Business: Amber, Eng: Indigo, Both: Neutral, Friction: Flame, Mindset: Emerald)
 * - Typography: Geist (English) + Prompt (Thai) for sans body & headings
 * - Shapes: Preserved friendly rounded curves (rounded-xl, rounded-2xl, rounded-full)
 * - Spacing: Consistent responsive scales for mobile (sm), tablet (md), desktop (lg/xl)
 */

export const tokens = {
  colors: {
    // Base Canvas & Surface Backgrounds
    canvas: 'bg-[#fafafa] dark:bg-[#0a0a0a]',
    canvasAlt: 'bg-neutral-100 dark:bg-[#111111]',
    
    // Cards & Surfaces (Preserving layout shape with clean black/gray/white)
    card: 'bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626]',
    cardElevated: 'bg-neutral-50 dark:bg-[#1a1a1a] border border-neutral-200 dark:border-[#2a2a2a]',
    cardSubtle: 'bg-neutral-100/60 dark:bg-[#161616] border border-neutral-200/70 dark:border-[#222222]',
    cardInteractive: 'bg-white dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] hover:border-neutral-400 dark:hover:border-[#404040] hover:bg-neutral-50/50 dark:hover:bg-[#171717] transition-all',
    
    // Inputs & Form Controls
    input: 'bg-neutral-50 dark:bg-[#141414] border border-neutral-200 dark:border-[#262626] text-neutral-900 dark:text-[#e5e5e5] placeholder-neutral-400 dark:placeholder-[#737373] focus:border-neutral-900 dark:focus:border-white focus:outline-none transition-colors',
    
    // Text Hierarchy
    text: {
      primary: 'text-neutral-900 dark:text-[#e5e5e5]',
      secondary: 'text-neutral-600 dark:text-[#a3a3a3]',
      muted: 'text-neutral-500 dark:text-[#737373]',
      subtle: 'text-neutral-400 dark:text-[#525252]',
      inverse: 'text-white dark:text-neutral-950',
    },

    // Borders
    border: {
      subtle: 'border-neutral-200 dark:border-[#262626]',
      medium: 'border-neutral-300 dark:border-[#333333]',
      strong: 'border-neutral-400 dark:border-[#404040]',
      divider: 'divide-neutral-200 dark:divide-[#262626]',
    },

    // Semantic Accents (Friendly, accessible badges & highlights)
    accent: {
      business: {
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        border: 'border-amber-500/25',
        badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-500/20',
        icon: 'text-amber-500',
      },
      engineer: {
        text: 'text-indigo-700 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-950/30',
        border: 'border-indigo-500/25',
        badge: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-500/20',
        icon: 'text-indigo-500',
      },
      bridge: {
        text: 'text-neutral-900 dark:text-white',
        bg: 'bg-neutral-100 dark:bg-[#1a1a1a]',
        border: 'border-neutral-300 dark:border-[#333333]',
        badge: 'bg-neutral-100 dark:bg-[#1e1e1e] text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-[#333333]',
        icon: 'text-neutral-700 dark:text-neutral-300',
      },
      friction: {
        badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25',
        icon: 'text-amber-500',
      },
      mindset: {
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25',
        icon: 'text-emerald-500',
      },
      xp: {
        text: 'text-amber-600 dark:text-amber-400',
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold',
        fill: 'fill-amber-500 text-amber-500',
      },
      success: {
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25',
        icon: 'text-emerald-500',
      },
    },
  },

  // Typography Tokens
  typography: {
    fontSans: "font-['Geist','Prompt',-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]",
    
    // Hierarchical Scales
    display: 'text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-neutral-900 dark:text-[#e5e5e5] leading-tight',
    h1: 'text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-neutral-900 dark:text-[#e5e5e5] leading-tight',
    h2: 'text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-[#e5e5e5] leading-snug',
    h3: 'text-base sm:text-lg font-semibold text-neutral-900 dark:text-[#e5e5e5] leading-snug',
    h4: 'text-sm sm:text-base font-semibold text-neutral-900 dark:text-[#e5e5e5]',
    
    body: 'text-sm sm:text-base text-neutral-700 dark:text-[#d4d4d4] leading-relaxed',
    bodySm: 'text-xs sm:text-sm text-neutral-600 dark:text-[#a3a3a3] leading-relaxed',
    caption: 'text-[11px] sm:text-xs text-neutral-500 dark:text-[#737373]',
    
    // Specialized
    labelMono: 'text-[10px] sm:text-[11px] tracking-wider uppercase font-semibold text-neutral-500 dark:text-[#737373]',
    code: 'text-xs sm:text-sm bg-neutral-100 dark:bg-[#1a1a1a] text-neutral-900 dark:text-[#e5e5e5] px-1.5 py-0.5 rounded border border-neutral-200 dark:border-[#262626]',
  },

  // Responsive Spacing Variations
  spacing: {
    screenContainer: 'max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8',
    cardPadding: 'p-4 sm:p-5 lg:p-6',
    cardPaddingDense: 'p-3 sm:p-4',
    cardPaddingSpacious: 'p-5 sm:p-7 lg:p-8',
    sectionGap: 'gap-4 sm:gap-6 lg:gap-8',
    itemGap: 'gap-2 sm:gap-3',
    stack: 'space-y-4 sm:space-y-6',
    stackDense: 'space-y-2 sm:space-y-3',
  },

  // Layout Shapes (Maintaining accessible rounded corners)
  shapes: {
    card: 'rounded-xl sm:rounded-2xl',
    cardLg: 'rounded-2xl sm:rounded-3xl',
    cardSm: 'rounded-lg sm:rounded-xl',
    pill: 'rounded-full',
    button: 'rounded-lg sm:rounded-xl',
    badge: 'rounded-md sm:rounded-lg',
  },
} as const;

// Helper to concatenate clean token strings
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}
