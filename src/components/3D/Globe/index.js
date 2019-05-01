import { Component } from 'react'
import PropTypes from 'prop-types'
import * as THREE from 'three'

const GLOW_SCALE = 0.3
const GLOW_INTENSITY = 0.3
const GLOW_FADE = 4

export default class Globe extends Component {
  static propTypes = {
    imagePath: PropTypes.string.isRequired,
    bumpPath: PropTypes.string,
    id: PropTypes.string.isRequired,
    radius: PropTypes.number.isRequired,
    onTextured: PropTypes.func
  }

  initialise ({ camera }) {
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
    const glowMaterial = this.getGlowMaterial(camera)
    const glowGeometry = new THREE.SphereGeometry(this.props.radius + (GLOW_SCALE * this.props.radius), 32, 32)
    this.atmosphere = new THREE.Mesh(glowGeometry, glowMaterial)
    this.addedAtmosphere = false
    this.previousCameraPosition = null
  }

  textureLoaded = () => {
    this.texturesToLoad--
    this.texturesToLoad < 1 && this.props.onTextured && this.props.onTextured()
  }

  getGlowMaterial (camera) {
    return new THREE.ShaderMaterial({
      uniforms: {
        'intensityFactor': {
          type: 'f',
          value: GLOW_INTENSITY
        },
        'fade': {
          type: 'f',
          value: GLOW_FADE
        },
        glowColor: {
          type: 'c',
          value: new THREE.Color(0x93cfef)
        },
        viewVector: {
          type: 'v3',
          value: camera.position
        }
      },
      vertexShader: `
        uniform vec3 viewVector;
        uniform float intensityFactor;
        uniform float fade;
        varying float intensity;
        void main () {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(intensityFactor - dot(vNormal, vNormel), fade);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main () {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, 1.0);
        }`,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    })
  }

  updateAtmosphere (camera) {
    if (JSON.stringify(this.previousCameraPosition.toArray()) !== JSON.stringify(camera.position.toArray())) {
      this.atmosphere.material.uniformsNeedUpdate = true
      this.atmosphere.material.needsUpdate = true
    }
  }

  animate ({ camera }) {
    if (!this.addedAtmosphere) {
      this.obj.parent.add(this.atmosphere)
      this.addedAtmosphere = true
    }

    this.previousCameraPosition && this.updateAtmosphere(camera)
    this.previousCameraPosition = camera.position.clone()
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
