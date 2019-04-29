import { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

export default class AmbientLight extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    intensity: PropTypes.number,
    color: PropTypes.number,
    position: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      z: PropTypes.number.isRequired
    })
  }

  static defaultProps = {
    intensity: 1,
    color: 0x404040,
    position: { x: 0, y: 0, z: 0 }
  }

  initialise () {
    this.obj = new THREE.AmbientLight(this.props.color, this.props.intensity)
    this.obj.position.x = this.props.position.x
    this.obj.position.y = this.props.position.y
    this.obj.position.z = this.props.position.z
  }

  getObj () {
    return this.obj
  }

  getId () {
    return this.props.id
  }

  render () {
    return null
  }
}
