import type { TocItem } from './toc.utils';
import { debounce } from 'lodash-es';
import MdiClose from '~icons/mdi/close';
import MdiToc from '~icons/mdi/toc';
import { useEffect, useRef, useState } from 'preact/hooks';
import styles from './toc.module.css';
import type { RefObject } from 'preact';

interface Props {
  toc: TocItem[];
  t: {
    title: string;
    labelOpen: string;
    labelClose: string;
  };
}

export function TocPreact({ toc, t }: Props) {
  const navRef = useRef<HTMLElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  useTrackActiveHeading(navRef);

  useEffect(() => {
    document.body.classList[isOpen ? 'add' : 'remove']('overflow-toc');
  }, [isOpen]);

  const handleLinkClick = (e: MouseEvent) => {
    if (e.target instanceof HTMLAnchorElement && window.matchMedia('(max-width: 1320px)').matches) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? t.labelClose : t.labelOpen}
      >
        {isOpen ? <MdiClose /> : <MdiToc />}
      </button>
      <div aria-hidden="true" className={styles.backdrop} onClick={() => setIsOpen(false)} />
      <aside data-open={isOpen} className={styles.sidebar}>
        <nav ref={navRef}>
          <h2>{t.title}</h2>
          <TocLinks toc={toc} onClick={handleLinkClick} />
        </nav>
      </aside>
    </>
  );
}

interface TocLinksProps {
  toc: TocItem[];
  onClick: (e: MouseEvent) => void;
}

function TocLinks({ toc, onClick }: TocLinksProps) {
  if (toc.length === 0) return null;

  return (
    <ul>
      {toc.map((item) => (
        <li>
          <a href={`#${item.slug}`} onClick={onClick}>
            {item.text}
          </a>
          {item.children.length > 0 && <TocLinks toc={item.children} onClick={onClick} />}
        </li>
      ))}
    </ul>
  );
}

function useTrackActiveHeading(navRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('h2[id], h3[id]'));
    if (headings.length === 0) return;

    const markActive = (a: Element) => a.setAttribute('aria-current', 'true');
    const markInactive = (a: Element) => a.removeAttribute('aria-current');
    const getTocLinkFromHeading = (h: Element) => navRef.current?.querySelector(`a[href="#${h.id}"]`);

    const firstTocLink = getTocLinkFromHeading(headings[0]!);
    if (firstTocLink) {
      markActive(firstTocLink);
    }

    let prevActiveHeading = headings[0];

    const handleScroll = debounce(() => {
      const firstHeading = Array.from(headings).toSorted(
        (a, b) => Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top),
      )[0];

      if (prevActiveHeading === firstHeading) return;
      prevActiveHeading = firstHeading;

      headings.forEach((heading) => {
        const tocLink = getTocLinkFromHeading(heading);
        if (!tocLink) return;

        if (heading === firstHeading) {
          markActive(tocLink);
        } else {
          markInactive(tocLink);
        }
      });
    }, 100);

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
}
