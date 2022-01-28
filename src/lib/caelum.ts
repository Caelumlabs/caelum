import { ethers } from 'ethers'
import { zencode_exec } from 'zenroom'

interface Wallets {
  wallet: any
  evmWallet: any
  zenWallet: any
}

// const registryAddress = '';

class Caelum {
  static connect = async (providerUrl: string, encWallet: string, password: string) => {
    /*
    const wallet = ethers.Wallet.fromEncryptedJson(encWallet , password)
    const provider = new ethers.providers.JsonRpcProvider(providerUrl)
    return wallet.connect(provider)*/
  }

  static newWallet = async (password: string): Promise<Wallets> => {
    let wallet, evmWallet, zenWallet
    return new Promise((resolve) => {
      wallet = ethers.Wallet.createRandom()
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
            wallet: wallet,
            evmWallet: evmWallet,
            zenWallet: zenWallet,
          })
        })
        .catch((error) => {
          throw new Error(error)
        })
    })
  }

  static mintNft = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      resolve(true);
    })
  }
}

export { Caelum }
