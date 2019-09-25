<template>
  <div>
    <p>Hello world!</p>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {
    bbs: function() {
      chrome.runtime.sendMessage(
        {contentScriptQuery: 'bbs',
         url: 'http:127.0.0.1:3000/bbs'},
         response => console.log(JSON.parse(response)))
    },
    thisPage: functon() {
      return chrome.extension.getURL('') + 'popup/popup.html'
    }
  }
}
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
}
</style>
