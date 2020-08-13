module.exports = function NuxtLoadingScreen () {
  if (!this.options.dev) {
    return
  }

  const defu = require('defu')
  const LoadingUI = require('./loading')
  const { nuxt } = this

  // Tip
  const { motd } = require('motd-json')
  const motdMessages = require('./messages')
  const motdOptions = {
    tags: {
      version: nuxt.version,
      modules: [
        ...Object.keys(nuxt.options.modules),
        ...Object.keys(nuxt.options.buildModules)
      ]
    }
  }
  const getTip = () => {
    const tip = motd(motdMessages, motdOptions)
    console.info(tip)
    return tip
  }

  const baseURL = nuxt.options.router.base + '_loading'
  const options = this.options.build.loadingScreen = defu(this.options.build.loadingScreen, {
    baseURL,
    baseURLAlt: baseURL,
    altPort: false,
    image: undefined,
    colors: {},
    tip: getTip()
  })

  const loading = new LoadingUI(options)

  nuxt.options.serverMiddleware.push({
    path: '/_loading',
    handler: (req, res) => { loading.app(req, res) }
  })

  if (options.altPort) {
    nuxt.hook('listen', async (_, { url }) => {
      await loading.initAlt({ url })
    })
  }

  nuxt.hook('close', async () => {
    await loading.close()
  })

  nuxt.hook('bundler:progress', (states) => {
    // TODO: Change tip
    loading.setStates(states)
  })

  nuxt.hook('cli:buildError', (error) => {
    loading.setError(error)
  })

  nuxt.hook('server:nuxt:renderLoading', (req, res) => {
    loading.serveIndex(req, res)
  })
}
