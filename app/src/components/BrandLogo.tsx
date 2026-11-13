import { cn } from '@/lib/utils';

/** Consistent transparent brand artwork for full and collapsed navigation. */
export function BrandLogo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn(compact ? 'relative h-14 w-14 overflow-hidden shrink-0' : 'w-full', className)}>
      <img
        src="/dow-elef-logo-transparent.png"
        alt="DOW ELEF International (T) Ltd — For fast and reliable freight logistics"
        className={compact ? 'absolute left-0 top-0 h-14 w-auto max-w-none' : 'block h-auto w-full object-contain'}
      />
    </div>
  );
}
