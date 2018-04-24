import { createElement } from 'metaverse-api';
export function Fish(props) {
    const { location } = props;
    return (createElement("box", { position: { x: location.x, y: 1, z: location.y }, transition: {
            position: { duration: 200 }
        } }));
}
//# sourceMappingURL=Fish.js.map