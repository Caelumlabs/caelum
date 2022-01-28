import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'
import { Wallet } from 'ethers'

interface Config {
  providerUrl: string
  tokenId: number
}

function getHome(toolbox): string {
  const sep = toolbox.filesystem.separator
  const home = `${toolbox.filesystem.homedir()}${sep}.caelum${sep}`
  return home
}

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.config = {
    saveConfig: async (providerUrl: string, wallets: any) => {
      const home = getHome(toolbox)
      // Save config.
      const config = { providerUrl, tokenId: 0 }
      toolbox.filesystem.write(`${home}config.json`, config)
      // Save wallets : EVM and Zenroom
      toolbox.filesystem.write(`${home}wallet.json`, wallets.evmWallet)
      toolbox.filesystem.write(`${home}zenroom.json`, wallets.zenWallet)
    },
    updateConfig: (tokenId: number) => {
      const home = `${getHome(toolbox)}config.json`
      const strConfig: string = toolbox.filesystem.read(home)
      const config: Config = JSON.parse(strConfig)
      config.tokenId = tokenId
      toolbox.filesystem.write(home, config)
    },
    loadConfig: (): Promise<{ wallet: Wallet; tokenId: number }> => {
      return new Promise(async (resolve) => {
        const home = getHome(toolbox)
        const strConfig = toolbox.filesystem.read(`${home}config.json`)
        if (!strConfig) {
          toolbox.print.error('No config file found. Run caelum setup')
          process.exit(1)
        }
        const config: Config = JSON.parse(strConfig)
        //Ask password.
        const askPassword = {
          type: 'password',
          name: 'password',
          message: 'Enter Password',
        }
        const { password } = await toolbox.prompt.ask([askPassword])
        const strWallet = toolbox.filesystem.read(`${home}wallet.json`)
        if (!strWallet) {
          toolbox.print.error('No wallet found. Run caelum setup')
          process.exit(1)
        }
        const wallet = await Caelum.connectWallet(
          config.providerUrl,
          strWallet,
          password
        )
        if (wallet === null) {
          toolbox.print.error('Invalid password')
          process.exit(1)
        }
        resolve({ wallet, tokenId: config.tokenId })
      })
    },
  }
}
