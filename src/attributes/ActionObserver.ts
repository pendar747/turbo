import { fire } from "../util";
import uniq from 'lodash-es/uniq';
import AttributeObserver from "./AttributeObserver";

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

class ActionObserver extends AttributeObserver<{ stateName: string, model?: string }> {
  
  registeredElements = new Map<Element, Map<string, { userEvent: string, handler: (e: Event) => any }>>();

  constructor(targetNode: Element|ShadowRoot, data: any) {
    super(targetNode, data);
    this.registeredElements = new Map();
    this.attributeName = 'tb-action';
    this.observe();
  }

  applyDescs ({ el, eventDescs, model, stateName }: ActionBinding) {
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
      if (this.registeredElements.has(el)) { // if element is already registered
        // if element has the given user event registered but it's assigned to a different dom event
        // then apply this event description
        if (this.registeredElements.get(el)?.get(domEvent)?.userEvent !== userEvent) { 
          el.addEventListener(domEvent, handler);
          this.registeredElements.get(el)?.set(domEvent, { userEvent, handler });
        }
      // if the element is not registered at all then apply this event description
      } else {
        el.addEventListener(domEvent, handler);
        this.registeredElements.set(el, new Map([[domEvent, { userEvent, handler }]]));
      }
    });
  }

  /**
   * Removes all handlers that are no longer in the tb-action attribute
   * @param param0 element and event Descs that belongs to it
   */
  removeUnassignedDescs ({ el, eventDescs }: { el: Element, eventDescs: EventDesc[] }) {
    const unassignedHandlers = Array.from(this.registeredElements.get(el)?.entries() ?? [])
      .filter(([domEvent, { userEvent }]) => {
        return !eventDescs.some((eventDesc) => {
          return eventDesc.domEvent == domEvent && eventDesc.userEvent == userEvent
        })
      });
    unassignedHandlers.forEach(([domEvent, { userEvent, handler }]) => {
      el.removeEventListener(domEvent, handler);
      this.registeredElements.get(el)?.delete(domEvent);
    });
  }

  applyActions (addedElements: Element[], stateName: string, model?: string) {
    const elements = uniq([
      ...addedElements,
      ...this.registeredElements.keys()
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

    actionBindings.forEach(this.removeUnassignedDescs.bind(this));
    actionBindings.forEach(this.applyDescs.bind(this));
  }

  applyChanges(elements: Element[], data: { model?: string, stateName: string }) {
    this.applyActions(elements, data.stateName, data.model);
  }
}

export default ActionObserver;