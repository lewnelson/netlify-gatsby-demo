import React from 'react'
import Layout from './'
import { shallow } from 'enzyme'

function getWrapper (renderMethod = 'shallow', propOverrides) {
  return shallow(
    <Layout
      children={(<p>Test</p>)}
      {...propOverrides}
    />
  )
}

describe('<Layout />', () => {
  beforeEach(() => {
    jest.spyOn(React, 'useEffect')
  })

  test('it renders correctly', () => {
    expect(getWrapper()).toMatchSnapshot()
  })
})
