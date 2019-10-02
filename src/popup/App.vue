<template>
  <div>
    <nav class="panel">
      <p class="panel-heading">
        {{ headerTitle }}
      </p>
      <div class="panel-block">
        <p class="control has-icons-left">
          <input class="input is-small" type="text" placeholder="search">
          <span class="icon is-small is-left">
            <i class="fas fa-search" aria-hidden="true"></i>
          </span>
        </p>
      </div>
      <p class="panel-tabs">
        <a :class="{'is-active': activeTab('is-baselist')}" @click="setTab('is-baselist')">base</a>
        <a :class="{'is-active': activeTab('is-recent')}" @click="setTab('is-recent')">recent</a>
        <a :class="{'is-active': activeTab('is-star')}" @click="setTab('is-star')">star</a>
      </p>
      <a class="panel-block" v-for="(item, index) in panelList" @click="panelClick(item)">
        <span v-if="activeMode('is-subject')">{{ index+1 }}: {{ item.title }}</span>
        <span v-if="activeMode('is-bbs')">{{ item.title }}</span>
        <span v-if="activeMode('is-thread')">{{ item.no }}:</span><span v-if="activeMode('is-thread')" v-html="item.message"></span>
        <!-- <span class="panel-icon">
          <b-icon
              icon="star-outline"
              size="is-middle">
            </b-icon>
        </span> -->
      </a>

      <!-- <a class="panel-block" v-if="isRecent" v-for="(item, index) in panelList">
        {{ item.title }}
      </a> -->

      <!-- <a class="panel-block is-active">
        <span class="panel-icon">
          <i class="fas fa-book" aria-hidden="true"></i>
        </span>
        bulma
      </a> -->

      <!-- <a class="panel-block">
        <span class="panel-icon">
          <b-icon
                    icon="account"
                    size="is-small">
                </b-icon>
        </span>
        daniellowtw/infboard
      </a>
        <a class="panel-block">
        daniellowtw/infboard
      </a>
      <label class="panel-block">
        <input type="checkbox">
        remember me
      </label> -->
      <div class="panel-block">
        <button class="button is-link is-outlined is-fullwidth">
          go to top
        </button>
      </div>
    </nav>
    <!-- <div>
        {{ selfURL }}
        {{ settings }}
    </div> -->
    <footer class="footer">
      <p class="buttons">
        <a class="button" >
          <b-icon
            icon="step-backward"
            size="is-small">
          </b-icon>
        </a>
        <a class="button" >
          <b-icon
            icon="sort-variant"
            size="is-small">
          </b-icon>
          勢い
        </a>
        <a class="button" @click="syncClick">
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
// import Bbs from './Bbs.vue'
const ACTIVE_MODE = 'activemode'
const ACTIVE_TAB = 'activtab'
const BASE_LIST = 'baselist'
const TAB_STATE = {
  'RECENT': 1<<0,
  'STAR': 1<<1,
  'BASELIST': 1<<2,
  'HISTORY': 1<<3,
}
const MODE_STATE = {
  'BBS': 1<<0,
  'SUBJECT': 1<<1,
  'THREAD': 1<<2
}

export default {
  components: {
    // Bbs
  },
  data () {
    return {
      headerTitle: 'bbs list',
      selfURL: chrome.extension.getURL('') + 'popup/popup.html',
      settings: {},
      panelList: [],
      tabState: 0,
      modeState: 0,
      currentSub: '',
      currentThr: ''
    }
  },
  methods: {
    setMode: function(mode) {
      switch(mode){
        case 'is-subject':
          this.modeState |= MODE_STATE.SUBJECT
          this.modeState &= ~(MODE_STATE.BBS | MODE_STATE.THREAD)
          break
        case 'is-thread':
          this.modeState |= MODE_STATE.THREAD
          this.modeState &= ~(MODE_STATE.SUBJECT | MODE_STATE.BBS)
          break
        default:
          this.modeState |= MODE_STATE.BBS
          this.modeState &= ~(MODE_STATE.SUBJECT | MODE_STATE.THREAD)
          break
      }
      console.log(parseInt(this.modeState.toString(2)))
    },
    activeMode: function(mode){
      // let item = sessionStorage.getItem(ACTIVE_MODE)
      // if (item !== null) {
      //   this.modeState = Number(item)
      // } else {
      //   this.modeState |= MODE_STATE.BBS
      // }
      
      switch(mode) {
        case 'is-bbs':
          return (this.modeState & MODE_STATE.BBS)
        case 'is-subject':
          return (this.modeState & MODE_STATE.SUBJECT)
        case 'is-thread':
          return (this.modeState & MODE_STATE.THREAD)
      }
      // sessionStorage.setItem(MODE_STATE, String(this.modeState))
    },
    setTab: function(key) {
      switch(this.tabState) {
        case 'is-recent':
          this.tabState |= TAB_STATE.RECENT
          this.tabState &= ~(TAB_STATE.BASELIST | TAB_STATE.STAR)
          break
        case 'is-star': 
          this.tabState |= TAB_STATE.STAR
          this.tabState &= ~(TAB_STATE.BASELIST | TAB_STATE.RECENT)
          break
        default:
          this.tabState |= TAB_STATE.BASELIST
          this.tabState &= ~(TAB_STATE.RECENT | TAB_STATE.STAR)
          break
      }
      sessionStorage.setItem(ACTIVE_TAB, String(this.tabState))
    },
    activeTab: function(key) {
      let item = sessionStorage.getItem(ACTIVE_TAB)
      if (item !== null) {
        this.tabState = Number(item)
      } else {
        this.tabState |= TAB_STATE.BASELIST
      }
      switch(key){
        case 'is-baselist':
          return (this.tabState & TAB_STATE.BASELIST)
        case 'is-recent':
          return (this.tabState & TAB_STATE.RECENT)
        case 'is-star': 
          return (this.tabState & TAB_STATE.STAR)
      }
      return false
    },
    panelClick: function (item) {
      console.log(item)
      if (this.activeMode('is-bbs')) {
        this.setMode('is-subject')
        this.currentSub = item.bbs
        this.headerTitle = item.title
        this.loadSubject(item.bbs, false)
        return
      }
      if (this.activeMode('is-subject')){
        this.setMode('is-thread')
        this.headerTitle = item.title
        this.currentThr = item.thread
        this.loadThread(item.thread, false)
        return
      }
    },
    syncClick: function() {
      console.log('sync')
      if (this.activeMode('is-subject')){
        console.log(this.currentSub)
        this.loadSubject(this.currentSub, true)
        return
      }
      if (this.activeMode('is-thread')){
        this.loadThread(this.currentThr, true)
        return
      }
      
    },
    loadBBS: function (reload) {
      window.scrollTo(0, 0)
      let self =this
      if (!reload) {
        let bbsData = sessionStorage.getItem(BASE_LIST)
        if (bbsData !== null) {
          self.panelList = JSON.parse(bbsData)
          console.log('bbs from cache')
          return
        }
      }
      chrome.runtime.sendMessage(
        {
          contentScriptQuery: 'fetch',
          url: this.settings.api + '/bbs'
        },
        response => {
          self.panelList = JSON.parse(response)
          sessionStorage.setItem(BASE_LIST, response)
        })
    },
    loadSubject: function(url, reload) {
      window.scrollTo(0, 0)
      console.log('load subject')
      let encoded = encodeURIComponent(url)
      let uri = this.settings.api + '/subject/' + encoded
      if (!reload) {
        let subsData = sessionStorage.getItem(uri)
        if (subsData !== null) {
          let subs = JSON.parse(subsData)
          console.log('subs from cache')
          this.panelList = subs.filter(item => item.title.slice(item.title.indexOf(':')+1).trim().length > 0)
            .map(item => {
              return {'title': item.title.slice(item.title.indexOf(':')+1).trim(),
                      'thread': item.thread}
              })
          return
        }
      }
      
      let self = this
      chrome.runtime.sendMessage(
        {
          contentScriptQuery: 'fetch',
          url: uri
        },
        response => {
          let subs = JSON.parse(response)
          sessionStorage.setItem(uri, response)
          self.panelList = subs.filter(item => item.title.slice(item.title.indexOf(':')+1).trim().length > 0)
            .map(item => {
              return {'title': item.title.slice(item.title.indexOf(':')+1).trim(),
                      'thread': item.thread}
              })
        })
      console.log(uri)
    },
    loadThread: function(url, reload) {
      console.log('load thread')
      let encoded1 = encodeURIComponent(this.currentSub)
      let encoded2 = encodeURIComponent(url)
      let uri = this.settings.api + '/thread/' + encoded1 + '/' + encoded2
      console.log(uri)
      if (!reload) {
        let threadsData = sessionStorage.getItem(uri)
        if (threadsData !== null) {
          let threads = JSON.parse(threadsData)
          console.log('thread from cache')
          console.log(threads)
          this.panelList = threads
          return
        }
      }
      let self = this
      chrome.runtime.sendMessage(
        {
          contentScriptQuery: 'fetch',
          url: uri
        },
        response => {
          let threads = JSON.parse(response)
          console.log(threads)
          sessionStorage.setItem(uri, response)
          self.panelList = threads
        })
    }
  },
  created: function(){
      console.log('created')
      this.setTab('is-baselist')
      this.setMode('is-bbs')
      let self = this
      let init = async() => {
        let url = chrome.runtime.getURL('settings.json')
        self.settings = await (await fetch(url)).json()
        self.loadBBS(false)
      }
      init()
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