<template>
    <div>
        <a class="panel-block" v-for="(item, index) in computeData" v-bind:key="item.thread" @click="subjectClick(item)">
            <span>{{ index+1 }}: {{ item.title }}</span>
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
        subjectClick: function(item) {
            this.$emit('clickHandler', item)
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

</style>