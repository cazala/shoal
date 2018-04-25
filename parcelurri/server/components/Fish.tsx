import { createElement } from 'metaverse-api'
const Vector = require('../../../../src/Vector')

export interface IFishProps {
  fish: any
}

const toDeg = (rad: any) => rad / (Math.PI * 2) * 360

export const Fish = (props: IFishProps) => {
  const { fish } = props
  const { id, mass, location, velocity, behaviour } = fish
  const x = location.x / 60
  const y = location.y / 60
  const z = location.z / 60
  const safeX = Math.max(Math.min(19.5, x), 0.5)
  const safeY = Math.max(Math.min(10, y), 0.5)
  const safeZ = Math.max(Math.min(19.5, z), 0.5)
  const scale = (mass - 0.5) * 5 + 0.5
  const [angleZ, angleY] = velocity.angles()
  return (
    <cone
      key={id}
      position={{ x, y, z }}
      rotation={{ z: toDeg(angleZ) - 90, y: toDeg(angleY), x: 0 }}
      scale={mass * mass / 10}
      segmentsRadial={3}
      transition={{
        position: { duration: 200 }
      }}
      color={
        id === 0
          ? 'blue'
          : behaviour === 'avoid'
            ? 'red'
            : behaviour === 'wander'
              ? 'gray'
              : 'black'
      }
    />
  )
}
