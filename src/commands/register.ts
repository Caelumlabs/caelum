// src/commands/setup.ts
import { GluegunToolbox } from 'gluegun'

module.exports = {
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Register your caelum account in the Blockchain')
    const context = await toolbox.config.loadConfig()
    if (!context) {
      toolbox.print.error('You need to run "caelum setup" first');
    } else {
      console.log(context)
      // const signer = await Caelum.connect(config.providerUrl, wallet, password)
      // console.log(signer)
    }
  },
}
