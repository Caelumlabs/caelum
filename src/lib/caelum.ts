import { ethers } from 'ethers'
import { zencode_exec } from 'zenroom'

interface Wallets {
  evmWallet: any
  zenWallet: any
}

class Caelum {
  url: string

  constructor(url: string, password: string) {
    this.url = url
  }

  static newWallet = async (password: string): Promise<Wallets> => {
    let evmWallet, zenWallet
    return new Promise((resolve) => {
      const wallet = ethers.Wallet.createRandom()
      wallet
        .encrypt(password)
        .then((encWallet) => {
          evmWallet = encWallet
          const zencodeRandom = `
Scenario 'ecdh': Create the keypair
Given that I am known as 'Alice'
When I create the keypair
Then print my data`
          return zencode_exec(zencodeRandom)
        })
        .then((result) => {
          zenWallet = result.result
          resolve({
            evmWallet: evmWallet,
            zenWallet: zenWallet,
          })
        })
        .catch((error) => {
          throw new Error(error)
        })
    })
  }
}

export { Caelum }
