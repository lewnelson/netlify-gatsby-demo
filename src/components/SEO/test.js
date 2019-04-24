import React from 'react'
import SEO from './'
import { shallow } from 'enzyme'
import { useStaticQuery } from 'gatsby'

function getWrapper (propOverrides) {
  return shallow(
    <SEO
      description='description'
      lang='en-GB'
      meta={[]}
      keywords={[ 'unit', 'testing' ]}
      title='testing'
      {...propOverrides}
    />
  )
}

describe('<SEO />', () => {
  beforeEach(() => {
    useStaticQuery.mockReturnValue({
      site: {
        siteMetadata: {
          title: 'Site title',
          description: 'Site description',
          author: 'Lewis Nelson <lewis@lewnelson.com>'
        }
      }
    })
  })

  test('it renders correctly', () => {
    expect(getWrapper()).toMatchSnapshot()
  })
})
