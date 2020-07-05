import { customElement, html } from 'lit-element';
import TurboComponent from "./TurboComponent";
import { Route } from '..';

@customElement('tb-switch')
export default class Switch extends TurboComponent {

  private get routes (): Route[] {
    return Array.from(this.querySelectorAll('tb-route'));
  }

  connectedCallback () {
    super.connectedCallback();
    const switchToRoute = (event: any) => {
      const route = event.target;
      this.routes.forEach(routeB => {
        if (routeB !== route && routeB.isMatching()) {
          if (this.routes.indexOf(routeB) > this.routes.indexOf(route)) {
            routeB.cancelMatch();
          } else {
            route.cancelMatch();
          }
        }
      })
    }
    const applySwitch = () => {
      this.routes.forEach((route) => {
        route.removeEventListener('match', switchToRoute);
        route.addEventListener('match', switchToRoute);
      })
    }
    const observer = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type == 'childList') {
          applySwitch();
        }
      }
    });

    observer.observe(this, { attributes: false, childList: true });
    applySwitch();
  }

  render () {
    return html`<slot></slot>`;
  }
}