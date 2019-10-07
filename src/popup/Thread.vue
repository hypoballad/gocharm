<template>
    <div>
        <a class="panel-block" v-for="item in computeData" v-bind:key="item.thread" @click="threadClick">
            <div>{{ item.no }}: </div>
            <div v-html="item.message"></div>
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
        threadClick: function(item) {
            console.log('click')
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
        computeData: function() {
            return this.data
        }
    }
}
</script>

<style lang="scss" scoped>
.thumb_i {
    display: block;
    height: 65px;
    width: 65px;
}
.image img {
    display: block;
    height: 65px;
    width: 65px;
}
</style>