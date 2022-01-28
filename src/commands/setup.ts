// src/commands/setup.ts
import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'

module.exports = {
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Setup your caelum account')
    const askPassword = {
      type: 'password',
      name: 'password',
      message: 'Enter Password',
    }
    const repeatPassword = {
      type: 'password',
      name: 'password2',
      message: 'Repeat Password',
    }
    const url = {
      type: 'text',
      name: 'providerUrl',
      message: 'RPC URL to connect to mumbai',
    }
    const { password, password2, providerUrl } = await toolbox.prompt.ask([
      askPassword,
      repeatPassword,
      url,
    ])
    if (password !== password2) {
      toolbox.print.error('Password does not match')
    } else {
      // Save config.
      const sep = toolbox.filesystem.separator
      const home = `${toolbox.filesystem.homedir()}${sep}.caelum${sep}`
      const config = { providerUrl }
      toolbox.filesystem.write(`${home}config.json`, config)

      // Save wallets : EVM and Zenroom
      const wallets = await Caelum.newWallet(password)
      toolbox.filesystem.write(`${home}wallet.json`, wallets.evmWallet)
      toolbox.filesystem.write(`${home}zenroom.json`, wallets.zenWallet)
      toolbox.print.success('\nSetup complete')
      toolbox.print.info(`Your addres is: ${wallets.wallet.address}`)
      toolbox.print.info(`Proceed to add funds to your wallet before registering (caelum register)\n`)
    }
  },
}
