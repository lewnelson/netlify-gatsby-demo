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
    this.state = { globeReady: false, meetups: [], controlsEnabled: true }
  }

  addMeetupsBatch = () => {
    const nextMeetupsStartIndex = this.state.meetups.length
    const n = (Math.random() * 3) + 1
    const nextMeetups = meetups.slice().splice(nextMeetupsStartIndex, n)
    this.setState({ meetups: [ ...this.state.meetups, ...nextMeetups ] })
    if (meetups.length === this.state.meetups.length) return
    setTimeout(this.addMeetupsBatch, (Math.random() * 300) + 150)
  }

  componentDidMount () {
    this.addMeetupsBatch()
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

  globeMarkerClicked (event, done) {
    console.log('globe marker clicked', event)
    this.setState({ controlsEnabled: false })
    // Show dialogue for event
    setTimeout(() => {
      this.setState({ controlsEnabled: true })
      done && done()
    }, 6000)
  }

  render () {
    return (
      <Layout>
        <SEO title='Meetups' keywords={[`gatsby`, `application`, `react`]} />
        <MapContainer>
          <Scene width='1000px' height='800px' controlsEnabled={this.state.controlsEnabled}>
            <SpotLight id='main_light' intensity={8} distance={45} />
            <Globe
              id='globe'
              imagePath='/images/Albedo.jpg'
              bumpPath='/images/Bump.jpg'
              radius={30}
              onTextured={this.globeReady}
            />
            {this.state.globeReady &&
              this.state.meetups.map((event, index) => (
                <GlobeMarker
                  key={event.id}
                  id={event.id}
                  globe='globe'
                  lat={this.getLat(event)}
                  lon={this.getLon(event)}
                  radius={0.3}
                  dropDistance={Math.random() * 8 + 16}
                  zIndex={index}
                  onClick={(done) => this.globeMarkerClicked(event, done)}
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
