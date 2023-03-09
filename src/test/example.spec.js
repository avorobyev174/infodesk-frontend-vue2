import { expect } from 'chai'
import { registration } from '../store/registration.js'
import { state, commit } from 'vuex'

describe('registration', () => {
  it('fetch meters', () => {
    registration.actions.fetchMeters({ state, commit }, false).then(
        result => {
          console.log(result)
          expect(28).to.equal(27)
        }
    )

  })
})
