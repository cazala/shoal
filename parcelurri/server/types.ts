export type IVector = {
  x: number
  y: number
}

export type IFish = {
  id: number
  location: IVector
  velocity: IVector
  mass: number
}

export type IState = {
  [id: string]: IFish
}
