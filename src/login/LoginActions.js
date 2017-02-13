import Web3 from 'web3'
import AuthenticationContract from '../../build/contracts/Authentication.json'
import { browserHistory } from 'react-router'

const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)
const contract = require('truffle-contract')

export const USER_LOGGED_IN = 'USER_LOGGED_IN'
function userLoggedIn(user) {
  return {
    type: USER_LOGGED_IN,
    payload: user
  }
}

export function loginUser() {
  return function(dispatch) {
    // Using truffle-contract we create the authentication object.
    const authentication = contract(AuthenticationContract)
    authentication.setProvider(provider)

    // Declaring this for later so we can chain functions on Authentication.
    var authenticationInstance

    // Get current ethereum wallet. TODO: Wrap in try/catch.
    var coinbase = web3.eth.coinbase;

    authentication.deployed().then(function(instance) {
      authenticationInstance = instance

      // Attempt to login user.
      authenticationInstance.login({from: coinbase})
      .catch(function(result) {
        // If error, go to signup page.
        console.log('Wallet ' + coinbase + ' does not have an account!')

        return browserHistory.push('/signup')
      })
      .then(function(result) {
        console.log(result)

        // If no error, go to intended page.
        var userName = web3.toUtf8(result)

        dispatch(userLoggedIn({"name": userName}))

        var currentLocation = browserHistory.getCurrentLocation()

        if ('query' in currentLocation.query)
        {
          return browserHistory.push(currentLocation.query.redirect)
        }

        return browserHistory.push('/dashboard')
      })
    })
  }
}
