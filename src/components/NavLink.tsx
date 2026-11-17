import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { navigate } from '../lib/navigation';

type NavLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** A real link (so open-in-new-tab and copy link work) that navigates in-app on a plain click. */
export function NavLink({ href, onClick, ...rest }: NavLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    if (event.defaultPrevented || event.button !== 0 || isModifiedClick) return;
    event.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={handleClick} {...rest} />;
}
