// We use esnext in metaverse-api, webpack and rollup handle it natively but not Node.js
const traceur = require('traceur')

// replace node.js require by traceur's
traceur.require.makeDefault(
  function(filename: string) {
    // transpile every file
    return true
  },
  {
    asyncFunctions: true,
    asyncGenerators: true
  }
)

require('./Server')
