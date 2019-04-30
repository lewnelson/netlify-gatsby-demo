import { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

export default class Globe extends Component {
  static propTypes = {
    imagePath: PropTypes.string.isRequired,
    bumpPath: PropTypes.string,
    id: PropTypes.string.isRequired,
    radius: PropTypes.number.isRequired,
    onTextured: PropTypes.func
  }

  initialise () {
    this.texturesToLoad = 1
    const geometry = new THREE.SphereGeometry(this.props.radius, 32, 32)
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(this.props.imagePath, this.textureLoaded)

    const material = new THREE.MeshStandardMaterial({ map: texture, transparent: true })
    material.roughness = 1
    if (this.props.bumpPath) {
      this.texturesToLoad++
      const bumpTextureLoader = new THREE.TextureLoader()
      const bumpTexture = bumpTextureLoader.load(this.props.bumpPath, this.textureLoaded)
      material.bumpMap = bumpTexture
      material.bumpScale = 0.8
    }

    this.obj = new THREE.Mesh(geometry, material)
  }

  textureLoaded = () => {
    this.texturesToLoad--
    this.texturesToLoad < 1 && this.props.onTextured && this.props.onTextured()
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
