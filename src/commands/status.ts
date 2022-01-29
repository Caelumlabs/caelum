// src/commands/register.ts
import { GluegunToolbox } from 'gluegun'

module.exports = {
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Getting Caelum status...')
    const { wallet, signer, tokenId, balance } = await toolbox.config.loadConfig()
    toolbox.print.success('\nYour Caelum account')
    if (tokenId === 0) {
      toolbox.print.warning(`DID not registered. Run caelum register`)
    } else {
      toolbox.print.highlight(`did:caelum:mumbai:${tokenId}`)
    }
    toolbox.print.muted('\nPublic KEY')
    toolbox.print.info(signer['CaelumOrg'].keypair.public_key)
    toolbox.print.muted('\nAddress')
    toolbox.print.info(wallet.address)
    toolbox.print.muted('\nBalance')
    toolbox.print.info(`${balance} Matic`)
    toolbox.print.info(`\n`)
  },
}
