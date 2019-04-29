import keys from '../config/keys'

const BASE_URL = 'https://api.meetup.com'

function getToken () {
  return window.localStorage.meetups_token || ''
}

function get (path, query = {}) {
  query = { ...query, access_token: getToken() }
  const queryString = Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&')
  const url = `${BASE_URL}${path}${queryString ? `?${queryString}` : ''}`
  return fetch(url).then(response => response.json())
}

const methods = { get }

async function recursivelyBuildPaginatedResults ({ path, query = {}, offset = 0, page = 20, method = 'get', resultsKey }) {
  let response = null
  const offsets = [ offset, offset + page, offset + (page * 2), offset + (page * 3) ]
  try {
    const results = await Promise.all(offsets.map(offset => {
      return methods[method](path, { ...query, offset, page })
    }))
    let exhaustedResults = false
    results.forEach(result => {
      if (!result[resultsKey] || result[resultsKey].length < 1) exhaustedResults = true
      if (!response) {
        response = { results: result }
      } else {
        response.results[resultsKey] = [ ...response.results[resultsKey], ...result[resultsKey] ]
      }
    })
    if (!exhaustedResults) {
      response.callback = () => recursivelyBuildPaginatedResults({ path, query, offset: offsets.pop() + page, page, method, resultsKey, response })
    } else {
      response.callback = () => Promise.resolve({ results: {}, callback: null })
    }
    return response
  } catch (err) {
    throw err
  }
}

export function authenticate (redirectURI) {
  redirectURI = redirectURI.replace(/#.*?/, '')
  window.location.href = `https://secure.meetup.com/oauth2/authorize?client_id=${keys.meetup.key}&response_type=token&redirect_uri=${encodeURIComponent(redirectURI)}`
}

export async function fetchUpcomingEvents (text) {
  try {
    const path = '/find/upcoming_events'
    const response = await recursivelyBuildPaginatedResults({ path, query: { text, radius: 'global' }, resultsKey: 'events' })
    return response
  } catch (err) {
    console.log('error occured', err)
    return { results: {}, callback: null }
  }
}

export function setToken (token, type, expires) {
  window.localStorage.setItem('meetups_token', token)
  window.localStorage.setItem('meetups_token_type', type)
  window.localStorage.setItem('meetups_token_expires', Date.now() + (expires * 1000))
}
