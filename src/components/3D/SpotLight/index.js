import { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

const AHEAD_ANGLE = Math.PI / 6
const MAX_HEIGHT = 35
const MIN_HEIGHT = -35

export default class SpotLight extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    intensity: PropTypes.number,
    lightDistance: PropTypes.number,
    angle: PropTypes.number,
    penumbra: PropTypes.number,
    decay: PropTypes.number,
    color: PropTypes.number,
    distance: PropTypes.number
  }

  static defaultProps = {
    intensity: 1,
    lightDistance: 0,
    angle: Math.PI / 6,
    penumbra: 0,
    decay: 1,
    color: 0x404040,
    distance: 45
  }

  componentDidUpdate (prevProps) {
    const { props } = this
    const diffs = []
    Object.keys(props).forEach(key => {
      if (props[key] !== prevProps[key]) diffs.push(key)
    })

    diffs.forEach(key => {
      if (key === 'distance') return
      this.obj[key] = props[key]
    })
  }

  initialise () {
    const { color, intensity, lightDistance, angle, penumbra, decay, distance } = this.props
    this.obj = new THREE.SpotLight(color, intensity, lightDistance, angle, penumbra, decay)
    this.obj.position.x = 0
    this.obj.position.y = 0
    this.obj.position.z = distance
    this.raycaster = new THREE.Raycaster()
    this.origin = new THREE.Vector3()
    this.yAxis = new THREE.Vector3(0, 1, 0)
    this.vector2 = new THREE.Vector2()
  }

  animate ({ camera }) {
    // Follow camera, but fix distance from origin to 2
    this.raycaster.setFromCamera(this.vector2, camera)
    let pos = this.origin.clone()
    this.raycaster.ray.at(this.props.distance * -1, pos)
    this.obj.position.copy(pos)

    // Restrict movement on Y axis
    if (this.obj.position.y > MAX_HEIGHT) this.obj.position.y = MAX_HEIGHT
    if (this.obj.position.y < MIN_HEIGHT) this.obj.position.y = MIN_HEIGHT

    // Move light rotation ahead of camera by 30 degress
    this.obj.position.sub(this.origin)
    this.obj.position.applyAxisAngle(this.yAxis, AHEAD_ANGLE)
    this.obj.position.add(this.origin)
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
