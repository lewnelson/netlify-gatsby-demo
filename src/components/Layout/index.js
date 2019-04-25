/**
 * Layout component that queries for data
 * with Gatsby's StaticQuery component
 *
 * See: https://www.gatsbyjs.org/docs/static-query/
 */

import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import parseURL from 'url-parse'

import Header from '../Header'
import './layout.css'

const Layout = ({ children }) => {
  // Equivelant to componentDidMount
  // Check if token exists on the URL for signing up on netlify
  React.useEffect(() => {
    const { protocol, slashes, host, hash } = parseURL(window.location.href)
    const token = (hash.replace(/^#/, '').split('&').map(p => p.split('=')).filter(p => p[0] === 'invite_token').shift() || [])[1]
    if (token) window.history.pushState({}, '', `${protocol}${slashes && '//'}${host}/admin/#/invite_token=${token}`)
  }, [])

  return (
    <StaticQuery
      query={graphql`
        query SiteTitleQuery {
          site {
            siteMetadata {
              title
            }
          }
        }
      `}
      render={data => (
        <>
          <Header siteTitle={data.site.siteMetadata.title} />
          <div
            style={{
              margin: `0 auto`,
              maxWidth: 960,
              padding: `0px 1.0875rem 1.45rem`,
              paddingTop: 0
            }}
          >
            <main>{children}</main>
            <footer>
              © {new Date().getFullYear()}, Built with
              {` `}
              <a href='https://www.gatsbyjs.org'>Gatsby</a>
            </footer>
            <script>
              {`if (window.netlifyIdentity) {
                window.netlifyIdentity.on('init', user => {
                  if (!user) {
                    window.netlifyIdentity.on('login', () => {
                      document.location.href = '/admin/'
                    })
                  }
                })
              }`}
            </script>
          </div>
        </>
      )}
    />
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired
}

export default Layout
