<template>
    <div>
        <a class="panel-block" v-for="item in uniqData" v-bind:key="item.bbs" @click="bbsClick(item)">
            <span>{{ item.title }}</span>
        </a>
    </div>
</template>

<script>
export default {
    props: [
        'panelList'
    ],
    data () {
        return {
            data: []
        }
    },
    methods: {
        bbsClick: function(item) {
            this.$emit('clickHandler', item)
        },
        uniqBBS: function (arr) {
            let set = {}
            let newarr = []
            arr.forEach(function(elem) {
                if (!set[elem.bbs]) {
                set[elem.bbs] = elem.title
                newarr.push(elem)
                }
            }) 
            return newarr
        }
    },
    watch: {
       panelList:  function(v) {
           this.data = v
       }
    },
    mounted: function() {
        this.$nextTick(() => {
            this.data = this.panelList
        })
    },
    computed:  {
        uniqData: function() {
            return this.uniqBBS(this.data)
        }
    }
}
</script>

<style lang="scss" scoped>

</style>