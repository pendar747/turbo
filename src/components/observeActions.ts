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

const registeredElements = new Map<Element, Map<string, string>>();

const applyActions = () => {
  const elements = Array.from(document.querySelectorAll('[tb-action]'));
  elements.forEach((el) => {
    const action = el.getAttribute('tb-action');
    const eventDescs = getEventDescriptions(action ?? '');
    eventDescs.forEach((desc) => {
      const { domEvent, userEvent } = desc;
      if (registeredElements.has(el)) {
        if (registeredElements.get(el)?.get(userEvent) !== domEvent) {
          el.addEventListener(domEvent, () => fire(userEvent));
          registeredElements.get(el)?.set(userEvent, domEvent);
        }
      } else {
        el.addEventListener(domEvent, () => fire(userEvent));
        registeredElements.set(el, new Map([[userEvent, domEvent]]));
      }
    });
  });
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