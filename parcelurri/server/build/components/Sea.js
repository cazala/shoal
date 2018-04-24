import { Fish } from './Fish';
export const Sea = (props) => {
    const { sea } = props;
    return Object.keys(sea).map(key => {
        const { location, mass } = sea[key];
        return Fish({ key, location, mass });
    });
};
//# sourceMappingURL=Sea.js.map