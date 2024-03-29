import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'
import { Wallet } from 'ethers'

interface Config {
  providerUrl: string
  registry: string
  tokenId: number
}

function getHome(toolbox): string {
  const sep = toolbox.filesystem.separator
  const home = `${toolbox.filesystem.homedir()}${sep}.caelum${sep}`
  return home
}

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.config = {
    saveConfig: async (providerUrl: string, registry: string, wallets: any) => {
      const home = getHome(toolbox)
      // Save config.
      const config = { providerUrl, registry, tokenId: 0 }
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
    loadConfig: (check: boolean = false): Promise<{ wallet: Wallet; signer:any; registry: string; tokenId: number; balance: number; }> => {
      return new Promise(async (resolve) => {
        // Load configuration
        const home = getHome(toolbox)
        const strConfig = toolbox.filesystem.read(`${home}config.json`)
        if (!strConfig) {
          toolbox.print.error('No config file found. Run caelum setup')
          process.exit(1)
        }
        const config: Config = JSON.parse(strConfig)
        const tokenId: number = config.tokenId
        const registry: string = config.registry

        //Ask password.
        const askPassword = {
          type: 'password',
          name: 'password',
          message: 'Enter Password',
        }
        const { password } = await toolbox.prompt.ask([askPassword])

        // Load ETH wallet.
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
        const balance = await Caelum.getBalance(wallet)
        if (wallet === null) {
          toolbox.print.error('Invalid password')
          process.exit(1)
        }

        // Load Zenroom Wallet.
        const zenWallet = toolbox.filesystem.read(`${home}zenroom.json`)
        if (!zenWallet) {
          toolbox.print.error('No Zenroom wallet found. Run caelum setup')
          process.exit(1)
        }
        const signer = JSON.parse(zenWallet)

        // Checking.
        if (check && balance < 0.1) {
          toolbox.print.error(
            `Balance of the address ${wallet.address} is below 0.1`
          )
        }
        resolve({ wallet, signer, registry, tokenId, balance })
      })
    },
    saveCertificate: async (certificate: any) => {
      const home = getHome(toolbox)
      // Save config.
      toolbox.filesystem.write(`${home}certificates/signed/${certificate.hash}.json`, certificate.vc)
    },
  }
}
