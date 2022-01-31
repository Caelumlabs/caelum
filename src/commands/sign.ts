import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'

const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
  ],
  type: ['VerifiableCredential'],
  issuer: '',
  credentialSubject: {},
}

async function getValue(toolbox: GluegunToolbox): Promise<{name: string; value: string; addmore: boolean}> {
  const askName = {
    type: 'text',
    name: 'name',
    message: 'Name of the field',
  }
  const askValue = {
    type: 'text',
    name: 'value',
    message: 'Value of the field',
  }
  const { name, value} = await toolbox.prompt.ask([ askName, askValue ]);
  const addmore = await toolbox.prompt.confirm('Add another field?')
  return { name, value, addmore }
}

module.exports = {
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Sign a new certificate')
    const { wallet, signer, registry, tokenId } = await toolbox.config.loadConfig(true)
    if (tokenId === 0) {
      toolbox.print.error('DID NFT NOT minted, run caelum register')
    } else {
      let field
      do {
        field = await getValue(toolbox)
        credential.credentialSubject[field.name] = field.value
      } while (field.addmore === true)
      credential.issuer = `DID:CAELUM:MUMBAI:${tokenId}`
      const vc: any = await Caelum.signCertificate(wallet, signer, registry, tokenId, credential)
      await toolbox.config.saveCertificate(vc)
    }
  },
}
