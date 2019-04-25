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

  test('it redirects to admin when mounted and the hash fragment contains the `invite_token` parameter', () => {
    window.history.pushState({}, 'Token test', 'https://www.something.com/#invite_token=12345678')
    getWrapper()
    expect(React.useEffect).toBeCalledWith(expect.any(Function), [])
    React.useEffect.mock.calls[0][0]()
    expect(window.location.href).toEqual('https://www.something.com/admin/#/invite_token=12345678')
  })

  test('it does not redirect to admin when there is no `invite_token` in the hash fragment', () => {
    window.history.pushState({}, 'Token test', 'https://www.something.com/')
    getWrapper()
    React.useEffect.mock.calls[0][0]()
    expect(window.location.href).toEqual('https://www.something.com/')
  })
})
