import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.config = {
    loadConfig: () => {
      return new Promise(async (resolve) => {
        const askPassword = {
          type: 'password',
          name: 'password',
          message: 'Enter Password',
        }
        const { password } = await toolbox.prompt.ask([ askPassword ])

        const sep = toolbox.filesystem.separator
        const home = `${toolbox.filesystem.homedir()}${sep}.caelum${sep}`
        let config = toolbox.filesystem.read(`${home}config.json`) || false
        if (config) {
          config = JSON.parse(config)
        }
        let wallet = toolbox.filesystem.read(`${home}wallet.json`) || false
        if (wallet) {
            wallet = JSON.parse(wallet)
          wallet = await Caelum.connect(config.providerUrl, wallet, password)
        }
        resolve({ config, wallet, password })
      })
    },
  }
}
