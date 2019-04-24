import React from 'react'
import Header from './'
import { shallow } from 'enzyme'

function getWrapper (propOverrides) {
  return shallow(
    <Header
      siteTitle='My site'
      {...propOverrides}
    />
  )
}

describe('<Header />', () => {
  test('it renders correctly', () => {
    expect(getWrapper()).toMatchSnapshot()
  })
})
