import MdiLinkVariant from '~icons/mdi/link-variant';

export interface HeadingWithAnchorProps {
  type: 'h2' | 'h3';
  id: string;
  label: string;
  children: string;
}

export function HeadingWithAnchor({ type: Component, id, label, children }: HeadingWithAnchorProps) {
  return (
    <div className="group has-[h2]:prose-h2-sizing has-[h3]:prose-h3-sizing">
      <Component id={id} className="mt-0 mr-[0.25em] mb-0 inline scroll-mt-6 text-[length:inherit]">
        {children}
      </Component>
      <a
        href={`#${id}`}
        aria-label={label}
        className="anchor-link inline-block pb-0.5 align-middle text-foreground opacity-40 group-hover:opacity-40 hover-supported:opacity-0"
      >
        <MdiLinkVariant width="1em" height="1em" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </a>
    </div>
  );
}
