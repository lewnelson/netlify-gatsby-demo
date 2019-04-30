import React, { Component, createRef, Fragment, Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'

const MIN_ZOOM_SPEED = 0.03
const MAX_ZOOM_SPEED = 0.5
const MIN_ROTATE_SPEED = 0.2
const MAX_ROTATE_SPEED = 1.0

export default class Scene extends Component {
  static propTypes = {
    width: PropTypes.string,
    height: PropTypes.string,
    children: PropTypes.any
  }

  static defaultProps = {
    width: '600px',
    height: '600px'
  }

  constructor (props) {
    super(props)
    this.canvasRef = createRef()
    this.sceneRefs = []
    this.initialised = false
    this.refQueue = []
    console.log('scene refs', this.sceneRefs)
  }

  componentDidMount () {
    const { canvasRef } = this
    const width = canvasRef.current.clientWidth
    const height = canvasRef.current.clientHeight

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true })
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.initializeOrbits()
    this.initializeCamera()
    this.animate()
    this.initialised = true
    this.refQueue.map(this.addRef)
    this.refQueue = []
  }

  componentWillUnmount () {
    cancelAnimationFrame(this.frameId)
  }

  initializeOrbits () {
    this.controls.enablePan = false
    this.controls.enableDamping = true
    this.controls.dampingFactor = 1.6
    this.controls.rotateSpeed = 1.0
    this.controls.zoomSpeed = 0.5
    this.controls.minDistance = 38
    this.controls.maxDistance = 90
    this.controls.maxPolarAngle = Math.PI - ((Math.PI / 180) * 35)
    this.controls.minPolarAngle = (Math.PI / 180) * 35
  }

  initializeCamera () {
    this.camera.position.x = 0
    this.camera.position.y = 0
    this.camera.position.z = 80
  }

  updateControlSpeeds () {
    const distance = this.camera.position.distanceTo(new THREE.Vector3())
    const multiplier = (distance - this.controls.minDistance) / (this.controls.maxDistance - this.controls.minDistance)
    const zoomSpeed = MIN_ZOOM_SPEED + (multiplier * (MAX_ZOOM_SPEED - MIN_ZOOM_SPEED))
    const rotateSpeed = MIN_ROTATE_SPEED + (multiplier * (MAX_ROTATE_SPEED - MIN_ROTATE_SPEED))
    this.controls.zoomSpeed = zoomSpeed
    this.controls.rotateSpeed = rotateSpeed
  }

  animate = () => {
    const now = Date.now()
    this.updateControlSpeeds()
    this.controls.update()
    this.frameId = window.requestAnimationFrame(this.animate)
    this.sceneRefs.forEach(ref => ref.animate && ref.animate({ sceneObjects: this.sceneRefs, camera: this.camera, t: now }))
    this.renderer.render(this.scene, this.camera)
  }

  addRef = (ref) => {
    if (!this.initialised) return this.refQueue.push(ref)
    if (!ref) return
    if (this.sceneRefs.filter(sceneRef => sceneRef === ref).length > 0) return
    this.sceneRefs.push(ref)
    ref.initialise && ref.initialise({ sceneObjects: this.sceneRefs, camera: this.camera })
    this.scene.add(ref.getObj())
  }

  removeRef = (ref) => {
    if (!this.initialised) return
    if (!ref) return
    if (this.sceneRefs.filter(sceneRef => sceneRef === ref).length > 0) return
    this.sceneRefs = this.sceneRefs.filter(sceneRef => sceneRef !== ref)
    ref.destroy && ref.destroy({ sceneObjects: this.sceneRefs, camera: this.camera })
    this.scene.remove(ref.getObj())
  }

  getChildren () {
    return Children.map(this.props.children, child => {
      if (!child) return null
      return cloneElement(child, { ref: ref => this.addRef(ref), removeRef: ref => this.removeRef(ref) })
    })
  }

  render () {
    const { width, height } = this.props
    return (
      <Fragment>
        <canvas width={width} height={height} ref={this.canvasRef} />
        {this.getChildren()}
      </Fragment>
    )
  }
}
