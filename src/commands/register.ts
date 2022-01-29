// src/commands/register.ts
import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'

module.exports = {
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Register your caelum account in the Blockchain')
    const { wallet, signer, tokenId } = await toolbox.config.loadConfig(true)
    if (tokenId !== 0) {
      toolbox.print.error(`DID NFT already minted : ${tokenId}`)
    } else {
      const tokenId = await Caelum.mintNft(wallet, signer['CaelumOrg'].keypair.public_key)
      toolbox.config.updateConfig(tokenId)
    }
  },
}
