import { createElement, ScriptableScene, ISimplifiedNode } from 'metaverse-api'
import { getState } from './State'
import { Sea } from './components/Sea'

let cachedScene: any = null
export function renderAndCache() {
  const state = getState()
  //cachedScene = <Sea sea={state} />
  cachedScene = Sea({ sea: state }) as any
}

export default class RemoteScene extends ScriptableScene {
  async render() {
    const state = getState()
    return <scene position={{ x: 0, y: 0, z: 0 }}>{cachedScene}</scene>
  }
}
