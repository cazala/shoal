let state = {};
export function getState() {
    return state;
}
export function setState(deltaState) {
    state = Object.assign({}, state, deltaState);
}
//# sourceMappingURL=State.js.map