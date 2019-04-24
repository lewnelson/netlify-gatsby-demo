import React from 'react'
import Layout from './'
import { shallow } from 'enzyme'

function getWrapper (propOverrides) {
  return shallow(
    <Layout
      children={(<p>Test</p>)}
      {...propOverrides}
    />
  )
}

describe('<Layout />', () => {
  test('it renders correctly', () => {
    expect(getWrapper()).toMatchSnapshot()
  })
})
