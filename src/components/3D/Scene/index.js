import React, { Component, createRef, Fragment, Children, cloneElement } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'

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
    this.controls.rotateSpeed = 1.0
    this.controls.zoomSpeed = 1.2
    this.controls.panSpeed = 0.8
    this.controls.minDistance = 0.65
    this.controls.maxPolarAngle = Math.PI - ((Math.PI / 180) * 20)
    this.controls.minPolarAngle = (Math.PI / 180) * 20
  }

  initializeCamera () {
    this.camera.position.x = 0
    this.camera.position.y = 0
    this.camera.position.z = 1
  }

  animate = () => {
    this.frameId = window.requestAnimationFrame(this.animate)
    this.sceneRefs.forEach(ref => ref.animate && ref.animate({ sceneObjects: this.sceneRefs, camera: this.camera }))
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
