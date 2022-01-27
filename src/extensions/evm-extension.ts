import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'

// add your CLI-specific functionality here, which will then be accessible
// to your commands
module.exports = (toolbox: GluegunToolbox) => {
  toolbox.evm = {
    newWallet: async (password) => {
      const walletJson = await Caelum.newWallet(password)
      return walletJson
    },
  }
}
