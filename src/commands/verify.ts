import { GluegunToolbox } from 'gluegun'
import { Caelum } from '../lib/caelum'

module.exports = {
  name: 'verify',
  description: 'Verify the signature of a Credential',
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Verify certificate')
    try {
      const pathCert = toolbox.parameters.string
      const certificate = JSON.parse(toolbox.filesystem.read(pathCert))
      const { wallet, registry } = await toolbox.config.loadConfig(true)
      const result: any = await Caelum.verifyCertificate(wallet, registry, certificate)

      toolbox.print.muted('\nValid Signature')
      toolbox.print.info(result.signature)
      toolbox.print.muted('\nOrganization Level')
      toolbox.print.info(result.level)
      toolbox.print.muted('\nValid From')
      toolbox.print.info(result.validFrom)
      toolbox.print.muted('\nValid To')
      toolbox.print.info(result.validTo)
    } catch(_e) {
      toolbox.print.error('Invalid certificate')
    }


    //  const vc: any = await Caelum.signCredential(wallet, signer, registry, tokenId, credential)
    //  await toolbox.config.saveCertificate(vc)
  },
}
