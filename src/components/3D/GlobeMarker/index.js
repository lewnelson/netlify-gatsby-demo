import { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

const PULSE_SCALE = 0.15
const LIGHT_OFFSET = 2

export default class GlobeMarker extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    globe: PropTypes.string.isRequired,
    radius: PropTypes.number.isRequired,
    dropDistance: PropTypes.number.isRequired
  }

  getFinalPosition (radius) {
    const { lat, lon } = this.props
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    const x = ((radius) * Math.sin(phi) * Math.cos(theta)) * -1
    const z = ((radius) * Math.sin(phi) * Math.sin(theta))
    const y = ((radius) * Math.cos(phi))

    return new THREE.Vector3(x, y, z)
  }

  getPosition (distance) {
    const raycaster = new THREE.Raycaster()
    raycaster.set(new THREE.Vector3(), this.finalPosition.normalize())
    let pos = new THREE.Vector3()
    raycaster.ray.at(distance, pos)
    return pos
  }

  initialise ({ sceneObjects }) {
    this.pulse = true
    this.pulseRings = []
    this.globe = sceneObjects.filter(obj => obj.getId() === this.props.globe).shift()
    if (!this.globe) throw new Error(`Globe ${this.props.globe} does not exist within the scene`)

    this.distance = this.globe.getRadius() + this.props.dropDistance
    this.finalPosition = this.getFinalPosition(this.globe.getRadius())
    const pointGeometry = new THREE.ConeGeometry(this.props.radius, this.props.radius * 4, 8, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0x1fc1c3 })
    this.obj = new THREE.Mesh(pointGeometry, material)

    const position = this.getPosition(this.distance)
    this.obj.position.copy(position)
    this.obj.lookAt(new THREE.Vector3())
    this.obj.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)
  }

  getObj () {
    return this.obj
  }

  getId () {
    return this.props.id
  }

  createLighting () {
    this.lighting = new THREE.PointLight(0xEF131D, 6, 5)
    this.lighting.position.copy(this.getPosition(this.distance + LIGHT_OFFSET))
    this.lighting.lookAt(new THREE.Vector3())
    this.obj.parent.add(this.lighting)
  }

  createPulseRing () {
    const { radius } = this.props
    const geometry = new THREE.RingGeometry(radius, radius + (radius * PULSE_SCALE), 24, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0x1fc1c3 })
    material.side = THREE.BackSide
    const pulseRing = new THREE.Mesh(geometry, material)
    this.obj.parent.add(pulseRing)
    pulseRing.position.copy(this.obj.position)
    pulseRing.lookAt(new THREE.Vector3(0, 0, 0))
    pulseRing.parameters = { percentage: 0 }
    this.pulseRings.push(pulseRing)
  }

  animatePulse () {
    const { radius } = this.props
    if (this.pulseRings.length < 1) return
    this.pulseRings.forEach((pulseRing, index) => {
      const newRadius = pulseRing.geometry.parameters.innerRadius + (radius * 3 / 100)
      const geometry = new THREE.RingGeometry(newRadius, newRadius + (newRadius * PULSE_SCALE), 24, 1)
      pulseRing.geometry.dispose()
      pulseRing.geometry = geometry
      if (pulseRing.geometry.parameters.innerRadius > radius * 4) {
        this.obj.parent.remove(pulseRing)
        this.pulseRings.splice(index, 1)
        if (this.pulseRings.length < 1) {
          this.pulse = false
          setTimeout(() => {
            this.pulse = true
          }, 400)
        }
      }
    })
  }

  animateDrop (t) {
    if (this.dropped) return
    if (!this.dropStartTime) this.dropStartTime = t
    this.distance -= 0.5 * 0.08 * Math.pow((t - this.dropStartTime) / 1000, 2)
    const newPosition = this.getPosition(this.distance)
    this.obj.position.copy(newPosition)
    if (this.globe.getObj().geometry.boundingSphere.containsPoint(newPosition)) {
      this.distance = this.globe.getRadius()
      this.dropped = true
      this.createLighting()
      this.obj.position.copy(this.getPosition(this.distance + this.props.radius * 2))
    }
  }

  animatePulseRings () {
    if (this.pulseRings.length < 1 && this.pulse) {
      this.createPulseRing()
      setTimeout(() => {
        this.createPulseRing()
        setTimeout(() => {
          this.createPulseRing()
        }, 400)
      }, 400)
    } else {
      this.animatePulse()
    }
  }

  animate ({ t }) {
    this.animateDrop(t)
    if (this.dropped) this.animatePulseRings()
  }

  destroy () {
    this.pulseRings.forEach((pulseRing) => {
      this.obj.parent.remove(pulseRing)
    })
  }

  render () {
    return null
  }
}
