export const on = (eventName: string, callback: (event: CustomEvent) => void) => {
  document.addEventListener(eventName, (event: Event) => {
    callback(event as CustomEvent);
  })
}

export const fire = (eventName: string, data: any = {}) => {
  document.dispatchEvent(new CustomEvent(eventName, {
    detail: data
  }))
}