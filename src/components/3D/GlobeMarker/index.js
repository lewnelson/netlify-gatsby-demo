import { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

const PULSE_SCALE = 0.05
const PULSE_INITIAL_RADIUS = 0.004
const MAX_PULSE_RADIUS = 0.016
const PULSE_STEP = (MAX_PULSE_RADIUS - PULSE_INITIAL_RADIUS) / 100

export default class GlobeMarker extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    globe: PropTypes.string.isRequired
  }

  getInitialPosition (radius) {
    const { lat, lon } = this.props
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    const x = ((radius) * Math.sin(phi) * Math.cos(theta)) * -1
    const z = ((radius) * Math.sin(phi) * Math.sin(theta))
    const y = ((radius) * Math.cos(phi))

    return new THREE.Vector3(x, y, z)
  }

  initialise ({ sceneObjects }) {
    this.pulse = true
    this.pulseRings = []
    const globe = sceneObjects.filter(obj => obj.getId() === this.props.globe).shift()
    if (!globe) throw new Error(`Globe ${this.props.globe} does not exist within the scene`)

    const positionVector = this.getInitialPosition(globe.getRadius())
    const pointGeometry = new THREE.SphereGeometry(0.004, 10, 10)
    const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    this.obj = new THREE.Mesh(pointGeometry, redMaterial)
    this.obj.position.x = positionVector.x
    this.obj.position.y = positionVector.y
    this.obj.position.z = positionVector.z
  }

  getObj () {
    return this.obj
  }

  getId () {
    return this.props.id
  }

  createPulseRing () {
    const geometry = new THREE.RingGeometry(PULSE_INITIAL_RADIUS, PULSE_INITIAL_RADIUS + (PULSE_INITIAL_RADIUS * PULSE_SCALE), 24, 1)
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    material.side = THREE.BackSide
    const pulseRing = new THREE.Mesh(geometry, material)
    this.obj.parent.add(pulseRing)
    pulseRing.position.copy(this.obj.position)
    pulseRing.lookAt(new THREE.Vector3(0, 0, 0))
    pulseRing.parameters = { percentage: 0 }
    this.pulseRings.push(pulseRing)
  }

  animatePulse () {
    if (this.pulseRings.length < 1) return
    this.pulseRings.forEach((pulseRing, index) => {
      const newRadius = pulseRing.geometry.parameters.innerRadius + PULSE_STEP
      const geometry = new THREE.RingGeometry(newRadius, newRadius + (newRadius * PULSE_SCALE), 24, 1)
      pulseRing.geometry = geometry
      if (pulseRing.geometry.parameters.innerRadius > MAX_PULSE_RADIUS) {
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

  animate () {
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

  destroy () {
    this.pulseRings.forEach((pulseRing) => {
      this.obj.parent.remove(pulseRing)
    })
  }

  render () {
    return null
  }
}
