import { ethers, Wallet } from 'ethers'
import { zencode_exec } from 'zenroom'
import * as RegistryContract from '../contracts/CaelumRegistry.json'

const REG_ADDRESS = '0x373518609f733EAb7Ae30d98aC589E9900112efF'

interface Wallets {
  wallet: any
  evmWallet: any
  zenWallet: any
}

// const registryAddress = '';

class Caelum {
  static connectWallet = async (
    providerUrl: string,
    encWallet: string,
    password: string
  ): Promise<Wallet> => {
    return new Promise(async (resolve) => {
      ethers.Wallet.fromEncryptedJson(encWallet, password)
        .then((wallet) => {
          const provider = new ethers.providers.JsonRpcProvider(providerUrl)
          wallet = wallet.connect(provider)
          resolve(wallet)
        })
        .catch((_e) => {
          resolve(null)
        })
    })
  }

  static getBalance(wallet: Wallet): Promise<number> {
    return new Promise(async (resolve) => {
      wallet.provider.getBalance(wallet.address).then((balance) => {
        resolve(parseFloat(ethers.utils.formatEther(balance)))
      })
    })
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

  static mintNft = async (wallet: Wallet): Promise<number> => {
    return new Promise(async (resolve) => {
      const nft = new ethers.Contract(REG_ADDRESS, RegistryContract.abi, wallet)
      const tx = await nft.mint()
      const receipt = await tx.wait()
      console.log(receipt)
      const args = receipt.events?.filter((x) => {
        return x.event === 'Transfer'
      })
      const tokenId = parseInt(args[0].args['result'][0])
      resolve(tokenId)
    })
  }
}

export { Caelum }
