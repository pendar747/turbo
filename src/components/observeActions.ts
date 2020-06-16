import { fire } from "../util";
import uniq from 'lodash-es/uniq';

interface EventDesc {
  domEvent: string, 
  userEvent: string
}

interface ActionBinding {
  el: Element, 
  eventDescs: EventDesc[], 
  model?: string, 
  stateName: string
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

const registeredElements = new Map<Element, Map<string, { userEvent: string, handler: (e: Event) => any }>>();

const applyDescs = ({ el, eventDescs, model, stateName }: ActionBinding) => {
  eventDescs.forEach((desc) => {
    const { domEvent, userEvent } = desc;
    const handler = (e: Event) => {
      const elementData = Object.assign({}, (e.target as HTMLElement).dataset) ?? {};
      const value = (e.target as HTMLInputElement).value;
      if (value) {
        elementData.value = value;
      }
      fire(`${stateName}-action`, {
        data: elementData,
        actionName: userEvent,
        model
      });
    }
    if (registeredElements.has(el)) { // if element is already registered
      // if element has the given user event registered but it's assigned to a different dom event
      // then apply this event description
      if (registeredElements.get(el)?.get(domEvent)?.userEvent !== userEvent) { 
        el.addEventListener(domEvent, handler);
        registeredElements.get(el)?.set(domEvent, { userEvent, handler });
      }
    // if the element is not registered at all then apply this event description
    } else {
      el.addEventListener(domEvent, handler);
      registeredElements.set(el, new Map([[domEvent, { userEvent, handler }]]));
    }
  });
}

/**
 * Removes all handlers that are no longer in the tb-action attribute
 * @param param0 element and event Descs that belongs to it
 */
const removeUnassignedDescs = ({ el, eventDescs }: { el: Element, eventDescs: EventDesc[] }) => {
  const unassignedHandlers = Array.from(registeredElements.get(el)?.entries() ?? [])
    .filter(([domEvent, { userEvent }]) => {
      return !eventDescs.some((eventDesc) => {
        return eventDesc.domEvent == domEvent && eventDesc.userEvent == userEvent
      })
    });
  unassignedHandlers.forEach(([domEvent, { userEvent, handler }]) => {
    el.removeEventListener(domEvent, handler);
    registeredElements.get(el)?.delete(domEvent);
  });
}

const applyActions = (addedElements: Element[], stateName: string, model?: string) => {
  const elements = uniq([
    ...addedElements,
    ...registeredElements.keys()
  ]);

  const actionBindings: ActionBinding[] = elements.map((el) => {
    const action = el.getAttribute('tb-action');
    return {
      eventDescs: getEventDescriptions(action ?? ''),
      el,
      model,
      stateName
    }
  });

  actionBindings.forEach(removeUnassignedDescs);
  actionBindings.forEach(applyDescs);
}

const observeActions = (targetNode: Element|Document|ShadowRoot, stateName: string, model?: string): MutationObserver => {
  const observer = new MutationObserver((mutationsList, observer) => {
    for (let mutation of mutationsList) {
      let elements = Array.from(mutation.addedNodes)
        .filter(element => element.nodeType == Node.ELEMENT_NODE 
            && (element as Element).hasAttribute('tb-action')) as Element[];

      const nestedElements = Array.from(mutation.addedNodes)
        .filter(el => el.nodeType === Node.ELEMENT_NODE)
        .map(el => Array.from((el as Element).querySelectorAll('[tb-action]')))
        .flat();
      
      elements = [...elements, ...nestedElements];

      if (mutation.type === 'childList' && elements.length > 0) {
        applyActions(elements, stateName, model);
      } else if (mutation.type === 'attributes' && mutation.attributeName === 'tb-action') {
        applyActions(elements, stateName, model);
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