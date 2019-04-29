import React, { Component, Fragment } from 'react'
import styled from 'styled-components'

import Layout from '../components/Layout'
import SEO from '../components/SEO'
import { authenticate, fetchUpcomingEvents, setToken } from '../helpers/meetups'
import parseURL from 'url-parse'
import Scene from '../components/3D/Scene'
import Globe from '../components/3D/Globe'
import GlobeMarker from '../components/3D/GlobeMarker'

const MapContainer = styled.div`
  display: block;
  margin: 0 auto;
  width: 90%;
  max-width: 900px;
  position: relative;
`

class Meetups extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fetching: true,
      authenticated: false,
      meetups: []
    }
  }

  async fetchNextEventsBatch (callback) {
    const response = await callback()
    if (response.results.events) this.setState({ authenticated: true, meetups: [ ...this.state.meetups, ...response.results.events ] })
    if (response.callback) this.fetchNextEventsBatch(response.callback)
  }

  async populateEvents () {
    const { results, callback } = await fetchUpcomingEvents('cardano')
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

  render () {
    const { fetching, meetups, authenticated } = this.state
    return (
      <Layout>
        <SEO title='Meetups' keywords={[`gatsby`, `application`, `react`]} />
        <Fragment>
          {!fetching && authenticated && meetups &&
            <p>There are {meetups.length} meetups!!!</p>
          }
          <MapContainer>
            <Scene>
              <Globe id='globe' imagePath='/images/1_earth_8k.jpg' radius={0.5} />
              {!fetching && authenticated && meetups &&
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
            {fetching &&
              <p>Fetching meetups...</p>
            }
            {!fetching && !authenticated &&
              <button onClick={this.authenticateWithMeetups}>
                View Meetups
              </button>
            }
          </MapContainer>
        </Fragment>
      </Layout>
    )
  }
}

export default Meetups
