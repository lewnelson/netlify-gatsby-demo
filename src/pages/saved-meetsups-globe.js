import React, { Component } from 'react'
import styled from 'styled-components'

import Layout from '../components/Layout'
import SEO from '../components/SEO'
import Scene from '../components/3D/Scene'
import Globe from '../components/3D/Globe'
import GlobeMarker from '../components/3D/GlobeMarker'
import SpotLight from '../components/3D/SpotLight'
import meetups from '../data/meetups.json'

const MapContainer = styled.div`
  display: block;
  margin: 0 auto;
  width: 90%;
  max-width: 900px;
  position: relative;
`

class SavedMeetupsGlobe extends Component {
  constructor (props) {
    super(props)
    this.state = { globeReady: false }
  }

  getLat (event) {
    if (event.venue && (event.venue.lat !== 0 && event.venue.lon !== 0)) {
      return event.venue.lat
    } else if (event.group) {
      return event.group.lat
    }
  }

  getLon (event) {
    if (event.venue && (event.venue.lat !== 0 && event.venue.lon !== 0)) {
      return event.venue.lon
    } else if (event.group) {
      return event.group.lon
    }
  }

  globeReady = () => {
    this.setState({ globeReady: true })
  }

  render () {
    return (
      <Layout>
        <SEO title='Meetups' keywords={[`gatsby`, `application`, `react`]} />
        <MapContainer>
          <Scene>
            <SpotLight id='main_light' intensity={5} position={{ x: 0, y: 0, z: 1 }} />
            <Globe id='globe' imagePath='/images/1_earth_8k.jpg' radius={0.5} onTextured={this.globeReady} />
            {this.state.globeReady &&
              meetups.map(event => (
                <GlobeMarker
                  key={event.id}
                  id={event.id}
                  globe='globe'
                  lat={this.getLat(event)}
                  lon={this.getLon(event)}
                />
              ))
            }
          </Scene>
        </MapContainer>
      </Layout>
    )
  }
}

export default SavedMeetupsGlobe
