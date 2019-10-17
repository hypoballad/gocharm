<template>
  <div>
    <nav class="panel" ref="element">
      <p class="panel-heading">
        {{ headerTitle }}
      </p>
      <p class="panel-tabs">
        <a :class="{'is-active': activeTab('is-baselist')}" @click="setTab('is-baselist')">base</a>
        <a :class="{'is-active': activeTab('is-recent')}" @click="setTab('is-recent')">recent</a>
        <a :class="{'is-active': activeTab('is-star')}" @click="setTab('is-star')">star</a>
      </p>
      <bbs v-if="activeMode('is-bbs')" :panel-list="panelList" @clickHandler="clickBBS"/>
      <subject v-if="activeMode('is-subject')" :panel-list="panelList" @clickHandler="clickSubj"/>
      <thread v-if="activeMode('is-thread')" :panel-list="panelList" />
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
        <b-field>
          <b-input id="search" placeholder="search" rounded></b-input>
        </b-field>
      </p>
    </footer>
  </div>
</template>
<script>
import Bbs from './Bbs.vue'
import Subject from './Subject.vue'
import Thread from './Thread.vue'

const STATE_KEY = 'state'
const ACTIVE_MODE = 'activemode'
const ACTIVE_TAB = 'activtab'
const BASE_LIST = 'baselist'
const SCROLL_POS = 'scroll,g_pos'
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
var timeoutId

export default {
  components: {
    Bbs,
    Subject,
    Thread
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
      currentThr: '',
      skip: false,
    }
  },
  watch: {
    panelList: function() {
      if (this.skip) {
        this.skip = false
        return
      }
      this.backupState()
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
    backupState: function() {
      let state = {
        headerTitle: this.headerTitle,
        settings: this.settings,
        panelList: this.panelList,
        tabState: this.tabState,
        modeState: this.modeState,
        currentTitle: this.currentTitle,
        currentSub: this.currentSub,
        currentThr: this.currentThr
      }
      localStorage.setItem(STATE_KEY, JSON.stringify(state))
    },
    restoreState: function() {
      let item = localStorage.getItem(STATE_KEY)
      if (item === null) {
        return false
      }
      let state = JSON.parse(item)
      this.headerTitle = state.headerTitle
      this.settings = state.settings
      this.panelList = state.panelList
      this.tabState = state.tabState
      this.modeState = state.modeState
      this.currentTitle = state.currentTitle
      this.currentSub = state.currentSub
      this.currentThr = state.convsubs
      let ypos = localStorage.getItem(SCROLL_POS)
      if (ypos !== null) {
        window.scrollTo(0, Number(ypos))
      }
      
      return true
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
    clickBBS: function (item) {
      this.setMode('is-subject')
      this.currentSub = item.bbs
      this.headerTitle = item.title
      window.scrollTo(0, 0)
      this.loadSubject(item.bbs, false)
    },
    clickSubj: function(item) {
      this.setMode('is-thread')
      this.currentTitle = this.headerTitle
      this.headerTitle = item.title
      this.currentThr = item.thread
      this.loadThread(item.thread, '', false)
    },
    syncClick: function() {
      console.log('sync')
      if (this.activeMode('is-bbs')) {
        this.loadBBS(true)
        return
      }
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
    searchBBS: function(v) {
      let r = new RegExp(v,'i')
      let bbsData = localStorage.getItem(BASE_LIST)
      let jsData = JSON.parse(bbsData)
      this.panelList = jsData.filter(data => {
        return r.test(data.title)
      })
    },
    loadBBS: function (reload) {
      this.loading()
      if (!reload) {
        let bbsData = localStorage.getItem(BASE_LIST)
        if (bbsData !== null) {
          this.panelList = JSON.parse(bbsData)
          console.log('bbs from cache')
          this.closeLoad()
          return
        }
      }
      let self =this
      console.log('bbs from 5ch')
      chrome.runtime.sendMessage(
        {
          contentScriptQuery: 'fetch',
          url: this.settings.api + '/bbs'
        },
        response => {
          self.panelList = JSON.parse(response)
          localStorage.setItem(BASE_LIST, response)
          self.closeLoad()
        })
    },
    searchSubject: function(v) {
      let r = new RegExp(v,'i')
      let subData = sessionStorage.getItem(this.currentSub)
      let jsData = JSON.parse(subData)
      this.panelList = jsData.filter(data => {
        return r.test(data.title)
      })
    },
    loadSubject: function(url, reload) {
      this.loading()
      console.log('load subject')
      let encoded = encodeURIComponent(url)
      let uri = this.settings.api + '/subject/' + encoded
      if (!reload) {
        let subsData = sessionStorage.getItem(url)
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
          let convsubs = subs.filter(item => item.title.slice(item.title.indexOf(':')+1).trim().length > 0)
            .map(item => {
              return {'title': item.title.slice(item.title.indexOf(':')+1).trim(),
                      'thread': item.thread}
              })
          sessionStorage.setItem(url, JSON.stringify(convsubs))
          self.panelList = convsubs
          self.closeLoad()
        })
    },
    searchThread: function(v) {
      let r = new RegExp(v,'i')
      let thrData = sessionStorage.getItem(this.currentThr)
      let jsData = JSON.parse(thrData)
      this.panelList = jsData.filter(data => {
        return r.test(data.message)
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
            sessionStorage.setItem(url, response)
            self.panelList = threads
          }
          self.closeLoad()
        })
    },
    handleScroll: function() {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(function() {
        localStorage.setItem(SCROLL_POS, window.pageYOffset.toString(10))
      }, 500)
    }
  },
  mounted: function() {
    let self = this
    this.$nextTick(() => {
      window.addEventListener('scroll', self.handleScroll);
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
        self.skip = true
        if (self.activeMode('is-bbs')) {
          self.searchBBS(input.value)
          return
        }
        if (self.activeMode('is-subject')) {
          self.searchSubject(input.value)
          return
        }
        if (self.activeMode('is-thread')) {
          self.searchThread(input.value)
          return
        }
      } , false)
    })
  },
  created: function(){
      console.log('created')
      if (this.restoreState()) {
        console.log('restore')
        return
      }
      console.log('init')
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
body {
    min-width: 600px;
}

</style>