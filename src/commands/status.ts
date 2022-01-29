// src/commands/register.ts
import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'

module.exports = {
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Getting Caelum status...')
    const { wallet, signer, tokenId } = await toolbox.config.loadConfig()
    toolbox.print.success('Your Caelum account')
    if (tokenId === 0) {
      toolbox.print.warning(`DID not registered. Run caelum register`)
    } else {
      toolbox.print.info(`DID: did:caelum:mumbai:${tokenId}`)
    }
    toolbox.print.info(`Public KEY: ${signer['CaelumOrg'].keypair.public_key}`)
    toolbox.print.info(`Address: ${wallet.address}`)
    const balance = await Caelum.getBalance(wallet)
    toolbox.print.info(`Balance: ${balance} Matic`)
    toolbox.print.info(`\n`)
  },
}
