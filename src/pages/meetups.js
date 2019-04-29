import React, { Component, Fragment, createRef } from 'react'
import worldMap from '../images/realmap.jpg'
import styled from 'styled-components'

import Layout from '../components/Layout'
import SEO from '../components/SEO'
import { authenticate, fetchUpcomingEvents, setToken } from '../helpers/meetups'
import parseURL from 'url-parse'

const MapContainer = styled.div`
  display: block;
  margin: 0 auto;
  width: 90%;
  max-width: 900px;
  position: relative;
`

const MapImage = styled.img`
  width: 100%;
`

const MapEvent = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  display: block;
  background-color: blue;
  position: absolute;
  transform: translate(-4px, -4px)
`

class Meetups extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fetching: true,
      authenticated: false,
      meetups: []
    }
    this.imageRef = createRef()
  }

  async fetchNextEventsBatch (callback) {
    const response = await callback()
    if (response.results.events) this.setState({ authenticated: true, meetups: [ ...this.state.meetups, ...response.results.events ] })
    if (response.callback) this.fetchNextEventsBatch(response.callback)
  }

  async populateEvents () {
    const { results, callback } = await fetchUpcomingEvents('run')
    this.setState({ fetching: false })
    if (results.events) this.setState({ authenticated: true, meetups: results.events })
    if (callback) this.fetchNextEventsBatch(callback)
  }

  componentDidMount () {
    this.parseAndSaveToken()
    this.populateEvents()
  }

  parseAndSaveToken () {
    const { hash } = parseURL(window.location.href)
    const hashObject = {}
    hash.replace(/^#/, '').split('&').map(p => p.split('=')).forEach(h => {
      hashObject[h[0]] = h[1]
    })

    if (hashObject.access_token) {
      setToken(hashObject.access_token, hashObject.token_type, hashObject.expires_in)
      window.location.hash = ''
    }
  }

  authenticateWithMeetups () {
    authenticate(window.location.href)
  }

  getEventPositionStyle = (event) => {
    const { width, height } = this.imageRef.current
    let lat, lon
    if (event.venue && (event.venue.lat !== 0 && event.venue.lon !== 0)) {
      lat = event.venue.lat
      lon = event.venue.lon
    } else if (event.group) {
      lat = event.group.lat
      lon = event.group.lon
    }
    const y = height - ((height / 180) * (lat + 90))
    const x = (width / 360) * (lon + 180)
    return { top: y, left: x }
  }

  render () {
    const { fetching, meetups, authenticated } = this.state
    console.log(meetups)
    return (
      <Layout>
        <SEO title='Meetups' keywords={[`gatsby`, `application`, `react`]} />
        <Fragment>
          {!fetching && authenticated && meetups &&
            <p>There are {meetups.length} meetups!!!</p>
          }
          <MapContainer>
            <MapImage src={worldMap} ref={this.imageRef} />
            {fetching &&
              <p>Fetching meetups...</p>
            }
            {!fetching && !authenticated &&
              <button onClick={this.authenticateWithMeetups}>
                View Meetups
              </button>
            }
            {!fetching && authenticated && meetups &&
              meetups.map(event => (
                <MapEvent key={event.id} style={{ ...this.getEventPositionStyle(event) }} id={event.id} />
              ))
            }
          </MapContainer>
        </Fragment>
      </Layout>
    )
  }
}

export default Meetups
