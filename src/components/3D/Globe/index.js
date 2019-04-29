import { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

export default class Globe extends Component {
  static propTypes = {
    imagePath: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    radius: PropTypes.number.isRequired,
    onTextured: PropTypes.func
  }

  initialise () {
    const geometry = new THREE.SphereGeometry(this.props.radius, 32, 32)
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(this.props.imagePath, () => {
      this.props.onTextured && this.props.onTextured()
    })

    const material = new THREE.MeshLambertMaterial({ map: texture, transparent: true })
    this.obj = new THREE.Mesh(geometry, material)
  }

  getObj () {
    return this.obj
  }

  getId () {
    return this.props.id
  }

  getRadius () {
    return this.props.radius
  }

  render () {
    return null
  }
}
