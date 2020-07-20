import { fire } from "../util";

const isLocal = (href: string) => {
  return href && href.indexOf('http') !== 0;
}

const registeredElements = new Map<HTMLAnchorElement, Function>();

const observeAnchors = (shadowRoot: ShadowRoot|Element) => {
  const anchors = Array.from(shadowRoot.querySelectorAll('a'));
  anchors.forEach(anchor => {
    const handler = (event: MouseEvent) => {
      event.preventDefault();
      const href = anchor.getAttribute('href');
      if (!href) {
        return;
      }
      if (isLocal(href)) {
        history.pushState({ page: href }, '', href);
        fire('page-change');
      } else {
        window.location.href = href;
      }
      return false;
    };
    
    if (!registeredElements.has(anchor)) {
      anchor.addEventListener('click', handler);
    }
    registeredElements.set(anchor, handler)
  });
}

export default observeAnchors;
