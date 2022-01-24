// src/commands/hello.ts
import { GluegunToolbox } from 'gluegun'
module.exports = {
  run: async (toolbox: GluegunToolbox) => {
    toolbox.print.info('Hello, setup!')
  },
}
