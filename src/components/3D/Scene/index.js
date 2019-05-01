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
    children: PropTypes.any,
    controlsEnabled: PropTypes.bool
  }

  static defaultProps = {
    width: '600px',
    height: '600px',
    controlsEnabled: true
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
    this.renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true, powerPreference: 'high-performance' })
    this.renderer.gammaFactor = 2.2
    this.renderer.gammaOutPut = true
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.initialiseOrbits()
    this.initialiseCamera()
    this.animate()
    this.initialised = true
    this.refQueue.map(this.addRef)
    this.refQueue = []
    this.setupClickListener()
  }

  setupClickListener () {
    this.clickableObjects = []
    this.renderer.domElement.addEventListener('click', this.clickListener)
  }

  getClickHandlerForObj (obj) {
    return (this.clickableObjects.filter(c => c.obj.uuid === obj.uuid).shift() || {}).handler
  }

  clickListener = (event) => {
    if (!this.props.controlsEnabled) return
    const mouse = new THREE.Vector2(event.offsetX, event.offsetY)
    mouse.x = (event.offsetX / event.target.width) * 2 - 1
    mouse.y = -(event.offsetY / event.target.height) * 2 + 1
    const raycaster = new THREE.Raycaster()
    raycaster.setFromCamera(mouse, this.camera)
    const intersects = raycaster.intersectObjects(this.scene.children, true)
    // Only interested in the closest object, we don't want to click through objects
    if (intersects.length > 0) {
      const handler = this.getClickHandlerForObj(intersects[0].object)
      handler && handler()
    }
  }

  componentWillUnmount () {
    cancelAnimationFrame(this.frameId)
  }

  componentDidUpdate () {
    // this.controls.enabled = this.props.controlsEnabled
  }

  initialiseOrbits () {
    this.controls.enablePan = false
    this.controls.enableDamping = true
    this.controls.dampingFactor = 1.6
    this.controls.rotateSpeed = 1.0
    this.controls.zoomSpeed = 0.5
    this.controls.minDistance = 35
    this.controls.maxDistance = 90
    this.controls.maxPolarAngle = Math.PI - ((Math.PI / 180) * 35)
    this.controls.minPolarAngle = (Math.PI / 180) * 35
  }

  initialiseCamera () {
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
    ref.initialise && ref.initialise({ sceneObjects: this.sceneRefs, camera: this.camera, renderer: this.renderer })
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

  registerClickableObject = (obj, handler) => {
    if (!this.getClickHandlerForObj(obj)) {
      this.clickableObjects.push({ obj, handler })
    }
  }

  unregisterClickableObject = (obj, handler) => {
    this.clickableObjects = this.clickableObjects.filter(c => !(c.obj === obj && c.handler === handler))
  }

  getChildren () {
    return Children.map(this.props.children, child => {
      if (!child) return null
      return cloneElement(child, {
        ref: ref => this.addRef(ref),
        removeRef: ref => this.removeRef(ref),
        registerClickableObject: this.registerClickableObject,
        unregisterClickableObject: this.unregisterClickableObject
      })
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
