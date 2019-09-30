<template>
  <div>
    <nav class="panel">
      <!-- <p class="panel-heading">
        {{ headerTitle }}
      </p> -->
      <div class="panel-block">
        <p class="control has-icons-left">
          <input class="input is-small" type="text" placeholder="search">
          <span class="icon is-small is-left">
            <i class="fas fa-search" aria-hidden="true"></i>
          </span>
        </p>
      </div>
      <p class="panel-tabs">
        <a class="is-active">recent</a>
        <a>star</a>
        <a @click="bbs">bbs list</a>
        <a>sources</a>
        <a>forks</a>
      </p>
      <a class="panel-block is-active has-icons-right" v-for="(item, index) in bbsList" @click="subject(item.bbs)">
        {{ item.title }}
        <span class="panel-icon">
          <b-icon
              icon="star-outline"
              size="is-middle">
            </b-icon>
        </span>
      </a>
      <a class="panel-block is-active">
        <span class="panel-icon">
          <i class="fas fa-book" aria-hidden="true"></i>
        </span>
        bulma
      </a>
      <a class="panel-block">
        <span class="panel-icon">
          <i class="fas fa-book" aria-hidden="true"></i>
        </span>
        marksheet
      </a>
      <a class="panel-block">
        <span class="panel-icon">
          <i class="fas fa-book" aria-hidden="true"></i>
        </span>
        minireset.css
      </a>
      <a class="panel-block">
        <span class="panel-icon">
          <i class="fas fa-book" aria-hidden="true"></i>
        </span>
        jgthms.github.io
      </a>
      <a class="panel-block">
        <span class="panel-icon">
          <i class="fas fa-code-branch" aria-hidden="true"></i>
        </span>
        daniellowtw/infboard
      </a>
      <a class="panel-block">
        <span class="panel-icon">
          <b-icon
                    icon="account"
                    size="is-small">
                </b-icon>
          <!-- <i class="fas fa-code-branch" aria-hidden="true"></i> -->
        </span>
        daniellowtw/infboard
      </a>
        <a class="panel-block">
        <!-- <span class="panel-icon">
          <i class="fas fa-code-branch" aria-hidden="true"></i>
        </span> -->
        daniellowtw/infboard
      </a>
      <a class="panel-block">
        <span class="panel-icon">
          <i class="fas fa-code-branch" aria-hidden="true"></i>
        </span>
        mojs
      </a>
      <label class="panel-block">
        <input type="checkbox">
        remember me
      </label>
      <div class="panel-block">
        <button class="button is-link is-outlined is-fullwidth">
          reset all filters
        </button>
      </div>
    </nav>
    <div>
        {{ selfURL }}
        {{ settings }}
        <b-button @click="bbs">load bbs</b-button>
    </div>
    <footer class="footer">
      <p class="buttons">
        <b-button size="is-small"
          icon-left="sort-variant">
          勢い
        </b-button>
        <a class="button">
          <span class="icon">
            <b-icon
              icon="sync"
              size="is-small">
            </b-icon>
          </span>
        </a>
        <a class="button" :href="selfURL" target="_blank">
          <span class="icon">
            <b-icon
              icon="open-in-new"
              size="is-small">
            </b-icon>
          </span>
        </a>
      </p>
        <!-- <div class="content has-text-centered">
          <a :href="selfURL" target="_blank">maximize
            <b-icon
              icon="open-in-new"
              size="is-small">
            </b-icon></a>
        </div> -->
    </footer>
  </div>
</template>
<script>
import Bbs from './Bbs.vue'
export default {
  components: {
    Bbs
  },
  data () {
    return {
      selfURL: chrome.extension.getURL('') + 'popup/popup.html',
      settings: {},
      labelPosition: 'on-border',
      bbsList: []
    }
  },
  methods: {
    bbs: function() {
      let self = this
      chrome.runtime.sendMessage(
        {contentScriptQuery: 'bbs',
         url: this.settings.bbs},
         response => self.bbsList= JSON.parse(response))
    },
    subject: function(url) {
      console.log(url)
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
@import "~bulma/sass/utilities/_all";
$footer-background-color: $black;
$footer-padding:  1rem 1rem 1rem;
@import "~bulma/sass/layout/_all";
footer {
  bottom: 0;
  left: 0;
  position: fixed;
  right: 0;
  z-index: 30;
}
</style>