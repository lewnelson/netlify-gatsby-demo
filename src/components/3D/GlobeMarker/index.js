import { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

const PULSE_SCALE = 0.15
const PULSE_RIPPLE_SCALE = 6
const PULSE_DURATION = 2600
const PULSE_COUNT = 3
const PULSE_INTERVAL = 400
const PULSE_OPACITY = 1

const HEIGHT_SCALE = 4
const LOCAL_ROTATION_AXIS = new THREE.Vector3(1, 0, 0)
const LOCAL_ROTATION_ANGLE = Math.PI / 2

const LAYER_HEIGHT = 0.02

const MARKER_COLOR = new THREE.Color(0x7cf7f9)
const MARKER_HIGHLIGHT_COLOR = new THREE.Color(0xc93a3a)

export default class GlobeMarker extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    lat: PropTypes.number.isRequired,
    lon: PropTypes.number.isRequired,
    globe: PropTypes.string.isRequired,
    radius: PropTypes.number.isRequired,
    dropDistance: PropTypes.number.isRequired,
    zIndex: PropTypes.number.isRequired,
    onClick: PropTypes.func,
    registerClickableObject: PropTypes.func
  }

  getFinalPosition (globeRadius) {
    const { lat, lon } = this.props
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    const x = globeRadius * Math.sin(phi) * Math.cos(theta) * -1
    const z = globeRadius * Math.sin(phi) * Math.sin(theta)
    const y = globeRadius * Math.cos(phi)

    const pos = this.origin.clone()
    pos.set(x, y, z)

    this.positionRaycaster.set(this.origin, pos.normalize())
    let finalPosition = this.origin.clone()
    this.positionRaycaster.ray.at(globeRadius + this.props.radius * HEIGHT_SCALE / 2 + (this.props.zIndex * LAYER_HEIGHT), finalPosition)
    return finalPosition
  }

  getPulseRingGeometry (radius) {
    return new THREE.RingGeometry(radius, radius + (radius * PULSE_SCALE), 24, 1)
  }

  setupPulseRing () {
    this.pulseRingGeometry = this.getPulseRingGeometry(this.props.radius)
    const pulseRingMaterial = new THREE.MeshBasicMaterial({ color: MARKER_COLOR, transparent: true })
    pulseRingMaterial.color.convertSRGBToLinear()
    pulseRingMaterial.opacity = PULSE_OPACITY
    pulseRingMaterial.side = THREE.BackSide
    this.pulseRing = new THREE.Mesh(this.pulseRingGeometry, pulseRingMaterial)
  }

  initialise ({ sceneObjects, camera }) {
    this.camera = camera
    this.pulse = false
    this.pulseRings = []
    this.globe = sceneObjects.filter(obj => obj.getId() === this.props.globe).shift()
    if (!this.globe) throw new Error(`Globe ${this.props.globe} does not exist within the scene`)

    this.distance = this.globe.getRadius() + this.props.dropDistance + (this.props.radius * HEIGHT_SCALE / 2)
    this.positionRaycaster = new THREE.Raycaster()
    this.origin = new THREE.Vector3()
    this.finalPosition = this.getFinalPosition(this.globe.getRadius())
    const pointGeometry = new THREE.ConeGeometry(this.props.radius, this.props.radius * HEIGHT_SCALE, 16, 1)
    const material = new THREE.MeshBasicMaterial({ color: MARKER_COLOR })
    material.color.convertSRGBToLinear()
    this.obj = new THREE.Mesh(pointGeometry, material)

    const position = this.getPosition(this.distance)
    this.obj.position.copy(position)
    this.obj.lookAt(this.origin)
    this.obj.rotateOnAxis(LOCAL_ROTATION_AXIS, LOCAL_ROTATION_ANGLE)
    this.setupPulseRing()
    if (this.props.onClick) this.setupClickListener()
  }

  clickComplete = () => {
    this.resetMarkerColor()
  }

  resetMarkerColor () {
    this.obj.material.color = MARKER_COLOR
    this.pulseRing.material.color = MARKER_COLOR
  }

  highlightMarker () {
    this.obj.material.color = MARKER_HIGHLIGHT_COLOR
    this.pulseRing.material.color = MARKER_HIGHLIGHT_COLOR
  }

  onClick = () => {
    this.props.onClick(this.clickComplete)
    this.highlightMarker()
    this.cameraDistance = this.origin.distanceTo(this.camera.position)
    this.cameraEndPosition = this.getPosition(this.cameraDistance)
    this.cameraMoveRaycaster = new THREE.Raycaster(this.camera.position, this.cameraEndPosition.clone().normalize())
    this.moveCamera = true
    this.cameraMoved = 0
    this.cameraMoveDistance = this.camera.position.distanceTo(this.cameraEndPosition)
  }

  animateCamera (t) {
    if (!this.moveCameraTime) this.moveCameraTime = t

    this.cameraMoved += 0.02
    let newPos = this.origin.clone()
    this.cameraMoveRaycaster.ray.at(this.cameraMoved, newPos)
    const raycaster = new THREE.Raycaster(this.origin, newPos.normalize())
    let finalPos = this.origin.clone()
    raycaster.ray.at(this.cameraDistance, finalPos)
    this.camera.position.set(finalPos.x, finalPos.y, finalPos.z)

    if (this.cameraMoveDistance - this.cameraMoved <= 0) {
      console.log('done animating camera')
      this.moveCamera = false
      this.moveCameraTime = null
    }
  }

  setupClickListener () {
    this.props.registerClickableObject(this.obj, this.onClick)
  }

  getObj () {
    return this.obj
  }

  getId () {
    return this.props.id
  }

  getPosition (distance) {
    let pos = this.origin.clone()
    this.positionRaycaster.ray.at(distance, pos)
    return pos
  }

  async createPulseRing (delay) {
    if (delay) await new Promise((resolve) => setTimeout(() => resolve(), delay))
    const pulseRing = this.pulseRing.clone()
    this.obj.parent.add(pulseRing)
    pulseRing.position.copy(this.obj.position)
    pulseRing.lookAt(this.origin)
    pulseRing.parameters = { startTime: null }
    this.pulseRings.push(pulseRing)
  }

  getNewPulseRadius (dt, index) {
    const { radius } = this.props
    const duration = PULSE_DURATION / 1000
    let ratio = -1 * ((dt = dt / duration - 1) * dt * dt * dt - 1)
    const maxRadius = (radius * PULSE_RIPPLE_SCALE) - (index * (radius * PULSE_SCALE * 4))
    return ((maxRadius - radius) * ratio) + radius
  }

  getNewPulseOpacity (dt) {
    const duration = PULSE_DURATION / 1000
    let ratio = -1 * ((dt = dt / duration - 1) * dt * dt * dt - 1)
    if (ratio > 1) ratio = 1
    return PULSE_OPACITY * (1 - ratio)
  }

  animatePulse (t) {
    if (this.pulseRings.length < 1) return
    this.pulseRings.forEach((pulseRing, index) => {
      if (!pulseRing.parameters.startTime) pulseRing.parameters.startTime = t
      const dt = t - pulseRing.parameters.startTime
      const newRadius = this.getNewPulseRadius(dt / 1000, index)
      const newOpacity = this.getNewPulseOpacity(dt / 1000)
      const geometry = this.getPulseRingGeometry(newRadius)
      if (this.pulseRingGeometry !== pulseRing.geometry) pulseRing.geometry.dispose()
      pulseRing.geometry = geometry
      pulseRing.material.opacity = newOpacity
      if (dt >= PULSE_DURATION) {
        this.obj.parent.remove(pulseRing)
        this.pulseRings.splice(index, 1)
      }
    })
  }

  animateDrop (t) {
    if (!this.dropStartTime) this.dropStartTime = t
    this.distance -= 0.5 * 0.08 * Math.pow((t - this.dropStartTime) / 1000, 2)
    const newPosition = this.getPosition(this.distance)
    const tipPosition = this.getPosition(this.distance - (this.props.radius * HEIGHT_SCALE / 2 + (this.props.zIndex * LAYER_HEIGHT)))
    this.obj.position.copy(newPosition)
    if (this.globe.getObj().geometry.boundingSphere.containsPoint(tipPosition)) {
      this.distance = this.globe.getRadius()
      this.dropped = true
      this.pulse = true
      this.obj.position.copy(this.finalPosition)
      delete this.dropStartTime
    }
  }

  animatePulseRings (t) {
    if (this.pulseRings.length < 1 && this.pulse) {
      for (let i = 0; i < PULSE_COUNT; i++) {
        this.createPulseRing(i * PULSE_INTERVAL)
      }
    } else {
      this.animatePulse(t)
    }
  }

  animate ({ t }) {
    if (!this.dropped) this.animateDrop(t)
    if (this.dropped) this.animatePulseRings(t)
    if (this.moveCamera) this.animateCamera(t)
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
