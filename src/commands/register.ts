// src/commands/register.ts
import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'

module.exports = {
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Register your caelum account in the Blockchain')
    const { wallet, tokenId } = await toolbox.config.loadConfig()
    const balance = await Caelum.getBalance(wallet)
    if (balance < 0.1) {
      toolbox.print.error(
        `Balance of the address ${wallet.address} is below 0.1`
      )
    } else if (tokenId !== 0) {
      toolbox.print.error(`DID NFT already minted : ${tokenId}`)
    } else {
      const tokenId = await Caelum.mintNft(wallet)
      toolbox.config.updateConfig(tokenId)
    }
  },
}
