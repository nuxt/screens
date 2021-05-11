<template>
  <div class="loading-screen" :class="{ hide: allDone && !preventReload }">
    <div class="row">
      <transition appear>
        <template v-if="!options.image">
          <svg class="logo" width="220" height="166" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(-18 -29)" fill="none" fill-rule="evenodd">
              <path d="M0 176h67.883a22.32 22.32 0 0 1 2.453-7.296L134 57.718 100.881 0 0 176zM218.694 176H250L167.823 32 153 58.152l62.967 110.579a21.559 21.559 0 0 1 2.727 7.269z" />
              <path d="M86.066 189.388a8.241 8.241 0 0 1-.443-.908 11.638 11.638 0 0 1-.792-6.566H31.976l78.55-138.174 33.05 58.932L154 94.882l-32.69-58.64C120.683 35.1 116.886 29 110.34 29c-2.959 0-7.198 1.28-10.646 7.335L20.12 176.185c-.676 1.211-3.96 7.568-.7 13.203C20.912 191.95 24.08 195 31.068 195h66.646c-6.942 0-10.156-3.004-11.647-5.612z" fill="#00C58E" />
              <path d="M235.702 175.491L172.321 62.216c-.655-1.191-4.313-7.216-10.68-7.216-2.868 0-6.977 1.237-10.32 7.193L143 75.706v26.104l18.709-32.31 62.704 111.626h-23.845c.305 1.846.134 3.74-.496 5.498a7.06 7.06 0 0 1-.497 1.122l-.203.413c-3.207 5.543-10.139 5.841-11.494 5.841h37.302c1.378 0 8.287-.298 11.493-5.841 1.423-2.52 2.439-6.758-.97-12.668z" fill="#108775" />
              <path d="M201.608 189.07l.21-.418c.206-.364.378-.745.515-1.139a10.94 10.94 0 0 0 .515-5.58 16.938 16.938 0 0 0-2.152-5.72l-49.733-87.006L143.5 76h-.136l-7.552 13.207-49.71 87.006a17.534 17.534 0 0 0-1.917 5.72c-.4 2.21-.148 4.486.725 6.557.13.31.278.613.444.906 1.497 2.558 4.677 5.604 11.691 5.604h92.592c1.473 0 8.651-.302 11.971-5.93zm-58.244-86.657l45.455 79.52H97.934l45.43-79.52z" fill="#2F495E" fill-rule="nonzero" />
            </g>
          </svg>
        </template>
        <template v-else>
          <img :src="options.image" style="max-width: 220px; max-height: 166px;">
        </template>
      </transition>
    </div>
    <div v-if="!bundles.length && !hasErrors && !preventReload" class="row placeholder">
      <transition appear>
        <h3>Loading...</h3>
      </transition>
    </div>
    <div v-else-if="hasErrors && !errorDescription">
      <h3 class="hasErrors">
        An error occured, please look at Nuxt.js terminal.
      </h3>
    </div>
    <div v-else-if="hasErrors && errorDescription">
      <h3 class="hasErrors">
        An error occured, please see below or look at Nuxt.js terminal for more info.
      </h3>
      <div class="errorStack">
        <p class="hasErrors">
          {{ errorDescription }}
        </p>
        <p v-if="errorStack" class="pre">
          {{ errorStack }}
        </p>
      </div>
      <p><span class="hasErrors">Note:</span> A manual restart of the Nuxt.js dev server may be required</p>
    </div>
    <div v-else-if="preventReload" class="reload_prevented">
      <h3 class="hasErrors">
        Failed to show Nuxt.js app after {{ maxReloadCount }} reloads
      </h3>
      <p>
        Your Nuxt.js app could not be shown even though the webpack build appears to have finished.
      </p>
      <p>
        Try to reload the page manually, if this problem persists try to restart your Nuxt.js dev server.
      </p>
    </div>
    <transition-group v-else>
      <div v-for="bundle of bundles" :key="bundle" class="row">
        <h3>{{ bundle | capitalize }} bundle</h3>
        <div class="progress_bar_container">
          <div class="progress_bar" :class="bundle" :style="{ width: `${states[bundle].progress}%`, backgroundColor: `${options.colors[bundle]}` }" />
        </div>
        <h4>{{ states[bundle].status }}</h4>
      </div>
    </transition-group>
    <transition appear>
      <div class="row">
        <div class="alert">
          <div class="alert-wrapper">
            <div class="alert-icon">
              <svg viewBox="0 0 20 20" fill="currentColor" class="light-bulb w-6 h-6"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path></svg>
            </div>
            <div class="alert-content">
              <p>
              <span v-html="formatTip()" > </span><a class="alert-button" :href="options.tip.link">Docs</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style src="./css/reset.css"></style>
<style src="./css/loading.css"></style>
<style src="./css/fonts.css"></style>

<script>
import fetch from 'unfetch'
import capitalizeMixin from './mixins/capitalize'
import logMixin from './mixins/log'
import sseMixin from './mixins/sse'
import storageMixin from './mixins/storage'

const waitFor = ms => new Promise(resolve => setTimeout(resolve, ms))

export default {
  el: '#nuxt_loading_screen',

  mixins: [
    capitalizeMixin,
    logMixin,
    sseMixin,
    storageMixin
  ],

  data () {
    return {
      error: false,
      stack: false,
      allDone: false,
      hasErrors: false,
      isFinished: false,
      maxReloadCount: 5,
      preventReload: false,
      manualReload: false,
      bundles: [],
      states: {},
      options: window.$OPTIONS || {}
    }
  },

  beforeMount () {
    if (!this.canReload()) {
      this.preventReload = true
    }
  },

  mounted () {
    if (this.preventReload) {
      return
    }

    this.onData(window.$STATE)
    this.sseConnect(`${this.options.baseURLAlt}/sse`)
    this.setTimeout()
  },

  methods: {
    onSseData (data) {
      if (this._reloading) {
        return
      }

      // We have data from sse. Delay timeout!
      this.setTimeout()

      this.onData(data)
    },

    formatTip () {
      const tip = this.options.tip.text.replace(/(<([^>]+)>)/gi, '')
      const formatedTip = tip.replace('`', '<code>').replace('`', '</code>').replace('`', '<code>').replace('`', '</code>').replace('`', '<code>').replace('`', '</code>')
      return formatedTip
    },

    async fetchData () {
      if (this._reloading) {
        return
      }

      // Prevent any fetch happening during fetch
      this.clearTimeout()

      try {
        const data = await fetch(`${this.options.baseURL}/json`).then(res => res.json())
        this.onData(data)
      } catch (e) {
        this.logError(e)
      }

      // Start next timeout
      this.setTimeout()
    },

    clearTimeout () {
      if (this._fetchTimeout) {
        clearTimeout(this._fetchTimeout)
      }
    },

    setTimeout () {
      if (this._reloading) {
        return
      }

      this.clearTimeout()
      this._fetchTimeout = setTimeout(() => this.fetchData(), 1000)
    },

    onData (data) {
      if (!data || this._reloading) {
        return
      }

      const { error, states, hasErrors, allDone } = data

      if (error) {
        const { description, stack } = error

        this.errorDescription = description
        this.errorStack = stack
        this.hasErrors = true
        return
      }

      // Ignore if no bundle is active
      if (!states || !states.length) {
        return
      }

      // Update active bundles
      this.bundles = states.map(state => state.name.toLowerCase())

      // Update bundle states
      for (const state of states) {
        const bundle = state.name.toLowerCase()
        if (!this.states[bundle]) {
          this.states[bundle] = {}
        }
        this.states[bundle].progress = state.progress
        this.states[bundle].status = state.details.length ? state.details.slice(0, 2).join(' ') : 'Done'
      }

      // Try to show nuxt app if allDone and no errors
      if (!hasErrors && allDone && !this.allDone) {
        this.reload()
      }

      // Update state
      this.allDone = allDone
      this.hasErrors = hasErrors
    },

    canReload () {
      this.reloadCount = parseInt(this.retrieveItem('reloadCount')) || 0
      const lastReloadTime = parseInt(this.retrieveItem('lastReloadTime')) || 0

      this.loadingTime = new Date().getTime()
      const canReload = this.reloadCount < this.maxReloadCount
      const reloadWasOutsideThreshold = lastReloadTime && this.loadingTime > 1000 + lastReloadTime

      // remove items when the last reload was outside our 1s threshold
      // or when we've hit the max reload count so eg when the user
      // manually reloads we start again with 5 tries
      if (!canReload || reloadWasOutsideThreshold) {
        this.removeItem('reloadCount')
        this.removeItem('lastReloadTime')
        this.reloadCount = 0

        return canReload
      }

      return true
    },

    updateReloadItems () {
      this.storeItem('reloadCount', 1 + this.reloadCount)
      this.storeItem('lastReloadTime', this.loadingTime)
    },

    async reload () {
      if (this._reloading) {
        return
      }
      this._reloading = true

      // Stop timers
      this.clearTimeout()

      // Close EventSource connection
      this.sseClose()

      // Clear console
      this.clearConsole()

      // Wait for transition (and hopefully renderer to be ready)
      await waitFor(500)

      // Update reload counter
      this.updateReloadItems()

      // Reload the page
      window.location.reload(true)
    }
  }
}
</script>
