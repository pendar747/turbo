import { fire } from "../util";
import isEqual from 'lodash-es/isEqual';

interface EventDesc {
  domEvent: string, 
  userEvent: string
}

const getEventDescriptions = (attributeValue: string): EventDesc[] => {
  const parts = attributeValue.split(';');
  return parts
    .map(part => {
      const match = part.match(/([a-zA-Z-_\d]*):([a-zA-Z-_\d]*)/);
      return match ? { domEvent: match[1], userEvent: match[2] } : undefined;
    })
    .filter(x => x !== undefined) as EventDesc[];
}

const registeredElements = new Map<Element, Map<string, { domEvent: string, handler: () => any }>>();

const applyDescs = ({ el, eventDescs }: { el: Element, eventDescs: EventDesc[] }) => {
  // TODO: find the event descs that are not in attributes and remove their listener
  eventDescs.forEach((desc) => {
    const { domEvent, userEvent } = desc;
    const handler = () => fire(userEvent);
    if (registeredElements.has(el)) {
      if (registeredElements.get(el)?.get(userEvent)?.domEvent !== domEvent) {
        console.log('applying', desc);
        el.addEventListener(domEvent, handler);
        registeredElements.get(el)?.set(userEvent, { domEvent, handler });
      }
    } else {
      console.log('applying', desc);
      el.addEventListener(domEvent, handler);
      registeredElements.set(el, new Map([[userEvent, { domEvent, handler }]]));
    }
  });
}

const applyActions = () => {
  const elements = Array.from(document.querySelectorAll('[tb-action]'));

  const eventDescsForAll: { el: Element, eventDescs: EventDesc[] }[] = elements.map((el) => {
    const action = el.getAttribute('tb-action');
    return {
      eventDescs: getEventDescriptions(action ?? ''),
      el
    }
  });

  eventDescsForAll.forEach(applyDescs);
}

const observeActions = (targetNode: Node): MutationObserver => {
  const config = { attributes: true, childList: true, subtree: true };

  const observer = new MutationObserver((mutationsList, observer) => {
    // console.log('mutation!!');
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        applyActions();
        // console.log('element added');
      } else if (mutation.type === 'attributes' && mutation.attributeName === 'tb-action') {
        applyActions();
      }
    }
  });

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);

  return observer;
}

export default observeActions;