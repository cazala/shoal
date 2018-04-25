import { Fish } from './Fish';
export const Sea = (props) => {
    const { sea } = props;
    return sea.fish.map((fish) => {
        return Fish({ fish });
    });
};
//# sourceMappingURL=Sea.js.map