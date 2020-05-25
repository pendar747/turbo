export interface MessageData { 
  actionName?: string, 
  data?: any, 
  model?: string, 
  stateName: string,
  type: 'action'|'state-update'
}
