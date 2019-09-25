<template>
  <div>
    <b-navbar>
        <template slot="brand">
            <b-navbar-item>
                <img
                    src="https://raw.githubusercontent.com/buefy/buefy/dev/static/img/buefy-logo.png"
                    alt="Lightweight UI components for Vue.js based on Bulma"
                >
            </b-navbar-item>
        </template>
        <template slot="start">
            <b-navbar-item href="#">
                Home
            </b-navbar-item>
            <b-navbar-item href="#">
                Documentation
            </b-navbar-item>
            <b-navbar-dropdown label="Info">
                <b-navbar-item href="#">
                    About
                </b-navbar-item>
                <b-navbar-item href="#">
                    Contact
                </b-navbar-item>
            </b-navbar-dropdown>
        </template>

        <template slot="end">
            <b-navbar-item tag="div">
                <div class="buttons">
                    <a class="button is-primary">
                        <strong>Sign up</strong>
                    </a>
                    <a class="button is-light">
                        Log in
                    </a>
                </div>
            </b-navbar-item>
        </template>
    </b-navbar>
    <section>
      <b-field label="Search..." :label-position="labelPosition">
        <b-input placeholder="Search..." type="search"></b-input>
        <p class="control">
          <b-button class="button is-primary">Search</b-button>
        </p>
      </b-field>
    </section>
    
    <div>
      {{ selfURL }}
      {{ settings }}
      <b-button @click="bbs">load bbs</b-button>
    </div>
    <footer class="footer">
      <div class="content has-text-centered">
        <a :href="selfURL" target="_blank">maximize
          <b-icon
            icon="open-in-new"
            size="is-small">
          </b-icon></a>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  data () {
    return {
      selfURL: chrome.extension.getURL('') + 'popup/popup.html',
      settings: {},
      labelPosition: 'on-border'
    }
  },
  methods: {
    bbs: function() {
      chrome.runtime.sendMessage(
        {contentScriptQuery: 'bbs',
         url: this.settings.bbs},
         response => console.log(JSON.parse(response)))
    }
  },
  created: function(){
      console.log('created')
      let url = chrome.runtime.getURL('settings.json')
      let self = this
      fetch(url)
        .then(response => response.json())
        .then((json) => {
            self.settings = json
        })
  }
}
</script>

<style lang="scss" scoped>
// p {
//   font-size: 20px;
// }
// .footer
//   $footer-padding: 1rem 1rem 1rem
</style>