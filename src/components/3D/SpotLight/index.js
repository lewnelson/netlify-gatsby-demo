import { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

export default class SpotLight extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    intensity: PropTypes.number,
    distance: PropTypes.number,
    angle: PropTypes.number,
    penumbra: PropTypes.number,
    decay: PropTypes.number,
    color: PropTypes.number,
    position: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      z: PropTypes.number.isRequired
    })
  }

  static defaultProps = {
    intensity: 1,
    distance: 0,
    angle: Math.PI / 6,
    penumbra: 0,
    decay: 1,
    color: 0x404040,
    position: { x: 0, y: 0, z: 0 }
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const diffs = []
    Object.keys(props).forEach(key => {
      if (key === 'position') {
        if (JSON.stringify(props[key]) !== JSON.stringify(prevProps[key])) diffs.push(key)
      } else {
        if (props[key] !== prevProps[key]) diffs.push(key)
      }
    })

    diffs.forEach(key => {
      if (key === 'position') {
        this.obj.position.x = props[key].x
        this.obj.position.y = props[key].y
        this.obj.position.z = props[key].z
      } else {
        this.obj[key] = props[key]
      }
    })
  }

  initialise () {
    const { color, intensity, distance, angle, penumbra, decay, position } = this.props
    this.obj = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay)
    this.obj.position.x = position.x
    this.obj.position.y = position.y
    this.obj.position.z = position.z
  }

  animate ({ camera }) {
    // Follow camera, but fix distance from origin to 2
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(new THREE.Vector2(), camera)
    let pos = new THREE.Vector3()
    raycaster.ray.at(-2, pos)
    this.obj.position.copy(pos)

    // Restrict movement on Y axis
    if (this.obj.position.y > 0.3) this.obj.position.y = 0.3
    if (this.obj.position.y < -0.3) this.obj.position.y = -0.3

    // Move light rotation ahead of camera by 30 degress
    const origin = new THREE.Vector3()
    this.obj.position.sub(origin)
    this.obj.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 6)
    this.obj.position.add(origin)
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
