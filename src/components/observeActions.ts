import { fire } from "../util";
import uniq from 'lodash-es/uniq';

interface EventDesc {
  domEvent: string, 
  userEvent: string
}

const getEventDescriptions = (attributeValue: string): EventDesc[] => {
  const parts = attributeValue.split(';');
  return parts
    .map(part => {
       // matches a alphanumeric (including _ and -) followed by : and another phrase of same kind
      const match = part.match(/([a-zA-Z-_\d]*):([a-zA-Z-_\d]*)/);
      return match ? { domEvent: match[1], userEvent: match[2] } : undefined;
    })
    .filter(x => x !== undefined) as EventDesc[];
}

const registeredElements = new Map<Element, Map<string, { domEvent: string, handler: (e: Event) => any }>>();

const applyDescs = ({ el, eventDescs, data }: { el: Element, eventDescs: EventDesc[], data: any }) => {
  eventDescs.forEach((desc) => {
    const { domEvent, userEvent } = desc;
    const handler = (e: Event) => {
      const elementData = (e.target as HTMLElement).dataset ?? {};
      fire(userEvent, { ...data, ...elementData });
    }
    if (registeredElements.has(el)) { // if element is already registered
      // if element has the given user event registered but it's assigned to a different dom event
      // then apply this event description
      if (registeredElements.get(el)?.get(userEvent)?.domEvent !== domEvent) { 
        el.addEventListener(domEvent, handler);
        registeredElements.get(el)?.set(userEvent, { domEvent, handler });
        // console.log('apply', { userEvent, domEvent });
      }
    // if the element is not registered at all then apply this event description
    } else {
      el.addEventListener(domEvent, handler);
      registeredElements.set(el, new Map([[userEvent, { domEvent, handler }]]));
    }
  });
}

/**
 * Removes all handlers that are no longer in the tb-action attribute
 * @param param0 element and event Descs that belongs to it
 */
const removeUnassignedDescs = ({ el, eventDescs }: { el: Element, eventDescs: EventDesc[] }) => {
  const unassignedHandlers = Array.from(registeredElements.get(el)?.entries() ?? [])
    .filter(([userEvent, { domEvent }]) => {
      return !eventDescs.some((eventDesc) => {
        return eventDesc.domEvent == domEvent && eventDesc.userEvent == userEvent
      })
    });
  unassignedHandlers.forEach(([userEvent, { domEvent, handler }]) => {
    el.removeEventListener(domEvent, handler);
    registeredElements.get(el)?.delete(userEvent);
  });
}

const applyActions = (addedElements: Element[], data: any) => {
  const elements = uniq([
    ...addedElements,
    ...registeredElements.keys()
  ]);

  const eventDescsForAll: { el: Element, eventDescs: EventDesc[], data: any }[] = elements.map((el) => {
    const action = el.getAttribute('tb-action');
    return {
      eventDescs: getEventDescriptions(action ?? ''),
      el,
      data
    }
  });

  eventDescsForAll.forEach(removeUnassignedDescs);
  eventDescsForAll.forEach(applyDescs);
}

const observeActions = (targetNode: Element|Document|ShadowRoot, data: any = null): MutationObserver => {
  const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      const elements: Element[] = Array.from(mutation.addedNodes)
        .filter(el => el.nodeType == Node.ELEMENT_NODE)
        .map(el => Array.from((el as Element).querySelectorAll('[tb-action]')))
        .flat();
      if (mutation.type === 'childList' && elements.length > 0) {
        applyActions(elements, data);
      } else if (mutation.type === 'attributes' && mutation.attributeName === 'tb-action') {
        applyActions(elements, data);
      }
    }
  });

  // Start observing the target node for configured mutations
  observer.observe(targetNode, { 
    attributes: true, 
    childList: true, 
    subtree: true
  });

  return observer;
}

export default observeActions;