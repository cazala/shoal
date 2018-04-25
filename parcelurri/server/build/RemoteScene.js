import { createElement, ScriptableScene } from 'metaverse-api';
import { Sea } from './components/Sea';
let cachedScene = null;
export function render(sea) {
    cachedScene = Sea({ sea });
}
export default class RemoteScene extends ScriptableScene {
    async render() {
        return (createElement("scene", { position: { x: 0.5, y: 0.5, z: 0.5 }, scale: 0.9 }, cachedScene));
    }
}
//# sourceMappingURL=RemoteScene.js.map