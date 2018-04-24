import { createElement } from 'metaverse-api'
import { IVector } from '../types'

export interface IFishProps {
  key: string
  location: IVector
  velocity?: IVector
  mass: number
}

export const Fish = (props: IFishProps) => {
  const { key, location, mass } = props
  console.log('render fish', location)
  const x = location.x / 40
  const z = location.y / 40
  const hide = x < 0.5 || x > 29.5 || z < 0.5 || z > 29.5
  return (
    <box
      key={key}
      position={{ x, y: 0, z }}
      scale={mass / 5}
      transition={{
        position: { duration: 200 }
      }}
      visible={!hide}
      color="black"
    />
  )
}
