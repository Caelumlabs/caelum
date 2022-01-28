// src/commands/setup.ts
import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'

module.exports = {
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Hello, setup!')
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
      name: 'url',
      message: 'RPC URL to connect to mumbai',
    }
    const { password, password2 } = await toolbox.prompt.ask([
      askPassword,
      repeatPassword,
      url,
    ])
    if (password !== password2) {
      toolbox.print.error('Password does not match')
    } else {
      const sep = toolbox.filesystem.separator
      const home = `${toolbox.filesystem.homedir()}${sep}.caelum${sep}`
      const wallets = await Caelum.newWallet(password)
      toolbox.filesystem.write(`${home}wallet.json`, wallets.evmWallet)
      toolbox.filesystem.write(`${home}zenroom.json`, wallets.zenWallet)
    }
  },
}
