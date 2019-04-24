import React from 'react'
import Image from './'
import { shallow } from 'enzyme'

function getWrapper (propOverrides) {
  return shallow(
    <Image
      {...propOverrides}
    />
  )
}

describe('<Image />', () => {
  test('it renders correctly', () => {
    expect(getWrapper()).toMatchSnapshot()
  })
})
