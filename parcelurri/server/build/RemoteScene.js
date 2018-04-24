import { createElement, ScriptableScene } from 'metaverse-api';
import { getState } from './State';
import { Sea } from './components/Sea';
let cachedScene = null;
export function renderAndCache() {
    const state = getState();
    cachedScene = Sea({ sea: state });
}
export default class RemoteScene extends ScriptableScene {
    async render() {
        const state = getState();
        return createElement("scene", { position: { x: 0, y: 0, z: 0 } }, cachedScene);
    }
}
//# sourceMappingURL=RemoteScene.js.map