import React from 'react'
import { Link, StaticQuery, graphql } from 'gatsby'

import Layout from '../components/Layout'
import Image from '../components/Image'
import SEO from '../components/SEO'

const IndexPage = () => (
  <Layout>
    <SEO title='Home' keywords={[`gatsby`, `application`, `react`]} />
    <StaticQuery
      query={graphql`
        query{
          markdownRemark {
            frontmatter {
              title
            }
          }
        }
      `}
      render={data => (
        <header>
          <h1>{data.markdownRemark.frontmatter.title}</h1>
        </header>
      )}
    />
    <p>Welcome to your new Gatsby site here it is.</p>
    <p>Now go build something great.</p>
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    <Link to='/page-2/'>Go to page 2</Link>
    <Link to='/meetups/'>Go to meetups</Link>
  </Layout>
)

export default IndexPage
