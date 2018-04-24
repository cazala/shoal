import { createElement, ScriptableScene } from 'metaverse-api';
import { getState } from './State';
import { Fish } from './Fish';
export default class SeaScene extends ScriptableScene {
    async render() {
        const { sea } = getState();
        return (createElement("scene", { position: { x: 5, y: 0, z: 5 } }, Object.keys(sea).forEach(id => {
            const { location } = sea[id];
            return createElement(Fish, { location: location });
        })));
    }
}
//# sourceMappingURL=SeaScene.js.map