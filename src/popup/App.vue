<template>
  <div>
    <nav class="panel" ref="element">
      <p class="panel-heading">
        {{ headerTitle }}
      </p>
      <div class="panel-block">
        <p class="control has-icons-left">
          <input id="search" class="input is-small" type="text" placeholder="search">
          <span class="icon is-small is-left">
            <b-icon
              icon="magnify-plus-outline"
              size="is-middle">
            </b-icon>
          </span>
        </p>
      </div>
      <p class="panel-tabs">
        <a :class="{'is-active': activeTab('is-baselist')}" @click="setTab('is-baselist')">base</a>
        <a :class="{'is-active': activeTab('is-recent')}" @click="setTab('is-recent')">recent</a>
        <a :class="{'is-active': activeTab('is-star')}" @click="setTab('is-star')">star</a>
      </p>
      <a class="panel-block" v-for="(item, index) in panelList" @click="panelClick(item)">
        <span v-if="activeMode('is-subject')" v-show="showPanel">{{ index+1 }}: {{ item.title }}</span>
        <span v-if="activeMode('is-bbs')" v-show="showPanel">{{ item.title }}</span>
        <span v-if="activeMode('is-thread')" v-show="showPanel">{{ item.no }}:</span><span v-if="activeMode('is-thread')" v-html="item.message"></span>
      </a>
      <div class="panel-block" v-if="activeMode('is-thread')">
        <button class="button is-link is-outlined is-fullwidth" @click="syncClick">
          sync
        </button>
      </div>
    </nav>
    <footer class="footer">
      <p class="buttons">
        <a class="button" @click="backClick">
          <b-icon
            icon="step-backward"
            size="is-small">
          </b-icon>
        </a>
        <!-- <a class="button" >
          <b-icon
            icon="sort-variant"
            size="is-small">
          </b-icon>
          勢い
        </a> -->
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

var loadingComponent

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
      showPanel: true,
      tabState: 0,
      modeState: 0,
      currentTitle: '',
      currentSub: '',
      currentThr: ''
    }
  },
  methods: {
    loading: function() {
      loadingComponent = this.$buefy.loading.open({
        container: this.$refs.element.$el
      })
      this.showPanel = false
    },
    closeLoad: function() {
      loadingComponent.close()
      this.showPanel = true
    },
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
    },
    activeMode: function(mode){      
      switch(mode) {
        case 'is-bbs':
          return (this.modeState & MODE_STATE.BBS)
        case 'is-subject':
          return (this.modeState & MODE_STATE.SUBJECT)
        case 'is-thread':
          return (this.modeState & MODE_STATE.THREAD)
      }
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
    },
    activeTab: function(key) {
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
        this.currentTitle = this.headerTitle
        this.headerTitle = item.title
        this.currentThr = item.thread
        this.loadThread(item.thread, '', false)
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
        console.log(this.panelList[this.panelList.length - 1])
        let no = Number(this.panelList[this.panelList.length - 1].no)
        let range = '' +  (no+1) + '-'
        this.loadThread(this.currentThr, range, true)
        return
      }
    },
    backClick: function() {
      if (this.activeMode('is-thread')){
        window.scrollTo(0, 0)
        this.setMode('is-subject')
        this.headerTitle = this.currentTitle
        this.loadSubject(this.currentSub, false)
        return 
      }
      if (this.activeMode('is-subject')) {
        window.scrollTo(0, 0)
        this.setMode('is-bbs')
        this.headerTitle = 'bbs list'
        this.loadBBS(false)
      }
    },
    loadBBS: function (reload) {
      this.loading()
      window.scrollTo(0, 0)
      let self =this
      if (!reload) {
        let bbsData = sessionStorage.getItem(BASE_LIST)
        if (bbsData !== null) {
          self.panelList = JSON.parse(bbsData)
          console.log('bbs from cache')
          this.closeLoad()
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
          self.closeLoad()
        })
    },
    loadSubject: function(url, reload) {
      this.loading()
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
          this.closeLoad()
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
          self.closeLoad()
        })
    },
    loadThread: function(url, range, reload) {
      this.loading()
      console.log('load thread')
      let encoded1 = encodeURIComponent(this.currentSub)
      let encoded2 = encodeURIComponent(url + range)
      let uri = this.settings.api + '/thread/' + encoded1 + '/' + encoded2
      console.log(uri)
      if (!reload) {
        let threadsData = sessionStorage.getItem(url)
        if (threadsData !== null) {
          let threads = JSON.parse(threadsData)
          console.log('thread from cache')
          console.log(threads)
          this.panelList = threads
          this.closeLoad()
          return
        }
      }
      console.log('thread from 5ch')
      let self = this
      chrome.runtime.sendMessage(
        {
          contentScriptQuery: 'fetch',
          url: uri
        },
        response => {
          let threads = JSON.parse(response)
          if (threads.lengt < 1){
            this.closeLoad()
            return
          }
          let past = sessionStorage.getItem(url)
          if (reload) {
            self.panelList = self.panelList.concat(threads.slice(1))
            sessionStorage.setItem(url, JSON.stringify(self.panelList))
          } else {
            sessionStorage.setItem(uri, response)
            self.panelList = threads
            window.scrollTo(0, 0)
          }
          self.closeLoad()
        })
    }
  },
  mounted: function() {
      this.$nextTick(() => {
      var input = document.getElementById("search")
      var canEnter = false
      input.addEventListener( "keypress" , function () {
        canEnter = true
      } , false )
      input.addEventListener( "keyup" , function () {
        if(!canEnter) {
          return
        }
        canEnter = false
        // 以下エンターを押したときの挙動
        console.log(input.value)
        let els = Array.from(document.querySelectorAll('body > div > nav > a > span'))
        els.forEach(function(el, idx) {
          if (el.textContent.indexOf(input.value) > 0) {
            el.scrollIntoView()
            return
          }
        })
      } , false)
    })
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
.panel:not(:last-child) {
  margin-bottom: 5rem;
}
</style>