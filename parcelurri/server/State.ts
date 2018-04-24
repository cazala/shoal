import { updateAll } from './ConnectedClients'
import { IState } from './types'

let state: IState = {}

export function getState(): IState {
  return state
}

export function setState(deltaState: Partial<IState>) {
  state = { ...state, ...deltaState } as IState
}
