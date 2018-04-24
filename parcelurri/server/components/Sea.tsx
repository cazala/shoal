import { createElement } from 'metaverse-api'
import { Fish } from './Fish'
import { IState } from '../types'

export interface ISeaProps {
  sea: IState
}

export const Sea = (props: ISeaProps) => {
  const { sea } = props
  return Object.keys(sea).map(key => {
    const { location, mass } = sea[key]
    //return <Fish key={key} location={location} mass={mass} />
    return Fish({ key, location, mass })
  })
}
