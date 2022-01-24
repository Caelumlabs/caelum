import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'caelum',
  run: async (toolbox) => {
    const { print } = toolbox

    print.info('Welcome to Caelum')
  },
}

module.exports = command
