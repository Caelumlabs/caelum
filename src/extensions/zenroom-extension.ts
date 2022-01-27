import { GluegunToolbox } from 'gluegun'
import { zencode_exec } from 'zenroom'

// add your CLI-specific functionality here, which will then be accessible
// to your commands
module.exports = (toolbox: GluegunToolbox) => {
  toolbox.zenroom = {
    newWallet: () => {
      return new Promise((resolve) => {
        const zencodeRandom = `
Scenario 'ecdh': Create the keypair
Given that I am known as 'Alice'
When I create the keypair
Then print my data`

        zencode_exec(zencodeRandom)
          .then((result) => {
            resolve(result.result)
          })
          .catch((error) => {
            throw new Error(error)
          })
      })
    },
  }
}
