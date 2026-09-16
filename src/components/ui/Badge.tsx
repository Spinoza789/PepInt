import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

export function Badge({ children, tone = 'neutral' }: PropsWithChildren<{ tone?: 'neutral' | 'amber' | 'cyan' | 'green' }>) {
  return <span className={clsx('badge', `badge-${tone}`)}>{children}</span>;
}
