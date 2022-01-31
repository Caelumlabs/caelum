import { ethers, Wallet } from 'ethers'
import { zencode_exec } from 'zenroom'
import * as RegistryContract from '../contracts/CaelumRegistry.json'

interface Wallets {
  wallet: any
  evmWallet: any
  zenWallet: any
}

interface Metadata {
  name: string
  level: number
  publicKey: string
}

interface ResultVerification {
  signature: boolean
  level: number
  validFrom: number
  validTo: number
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
Given that I am known as 'CaelumOrg'
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

  static mintNft = async (wallet: Wallet, registry: string, publicKey: string): Promise<number> => {
    return new Promise(async (resolve) => {
      const nft = new ethers.Contract(registry, RegistryContract.abi, wallet)
      const tx = await nft.mint(publicKey)
      const receipt = await tx.wait()
      const args = receipt.events?.filter((x) => {
        return x.event === 'Transfer'
      })
      const tokenId = parseInt(args[0].args['tokenId'])
      resolve(tokenId)
    })
  }

  static signCertificate(wallet: Wallet, signer: any, registry: string, tokenId: number, credential: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let certificate
      const zenSigner = signer
      zenSigner['CaelumOrg'].PublicKeyUrl = 'http://test.com'
      const keys = JSON.stringify(zenSigner);
      const data = `{"vc": ${JSON.stringify(credential)}}`;
      const zencode = `
        Rule check version 1.0.0
        Scenario 'w3c' : sign
        Scenario 'ecdh' : keypair
        Given that I am 'CaelumOrg'
        Given I have my 'keypair'
        Given I have a 'verifiable credential' named 'vc'
        Given I have a 'string' named 'PublicKeyUrl' inside 'CaelumOrg'
        When I sign the verifiable credential named 'vc'
        When I set the verification method in 'vc' to 'PublicKeyUrl'
        Then print 'vc' as 'string'`;
        // console.log(zencode, zenSigner, credential, data, keys)
      zencode_exec(zencode, { data, keys })
        .then(async (result) => {
          const nft = new ethers.Contract(registry, RegistryContract.abi, wallet)
          certificate = JSON.parse(result.result)
          certificate.hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(certificate.vc.proof.jws))
          const tx = await nft.addCertificate(tokenId, certificate.hash);
          return tx.wait()
        })
        .then((result) => {
          // TODO: check Blockchain errors
          resolve(certificate);
        })
        .catch(() => {
          reject();
        });
    })
  }

  static verifyCertificate(wallet: Wallet, registry: string, certificate: any) {
    return new Promise(async (resolve, reject) => {
      const nft = new ethers.Contract(registry, RegistryContract.abi, wallet)
      try {
        const issuerParts = certificate.issuer.split(':')
        const tokenId = issuerParts[3]
        const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(certificate.proof.jws))
        const dates: any = await nft.verifyCertificate(tokenId, hash)
        let json: any = await nft.tokenURI(tokenId)
        json = json.split(',')
        json = Buffer.from(json[1], 'base64').toString('ascii')
        const metadata: Metadata = JSON.parse(json)
        const keys = `{"Issuer": {"public_key": "${metadata.publicKey}"}}`
        const data = `{"vc": ${JSON.stringify(certificate)}}`;
        const zencode = `
          Rule check version 1.0.0
          Scenario 'w3c' : sign
          Scenario 'ecdh' : keypair
          Given I have a 'public key' from 'Issuer'
          Given I have a 'verifiable credential' named 'vc'
          When I verify the verifiable credential named 'vc'
          Then print 'vc' as 'string'
          Then print the string 'OK'`
        // console.log(zencode, zenSigner, credential, data, keys)
        zencode_exec(zencode, { data, keys })
          .then(async (_result: any) => {
            const result = JSON.parse(_result.result)
            const res: ResultVerification = {
              signature: (result.output[0] === 'OK'),
              level: metadata.level,
              validFrom: parseInt(dates.validFrom),
              validTo: parseInt(dates.validTo),
            }
            resolve(res)
          })
      } catch (_e) {
        resolve({
          signature: false,
          level: 0,
          validFrom: 0,
          validTo: 0,
        })
      }
    })
  }
}

export { Caelum }
