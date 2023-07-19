import { expect } from 'chai'
import { programming } from '../modules/programming/store/programming.js'
import { state, commit } from 'vuex'

describe('registration', () => {
  it('fetch meters', () => {
    programming.actions.fetchMeters({ state, commit }, false).then(
        result => {
          console.log(result)
          expect(28).to.equal(27)
        }
    )

  })
})
