<template>
    <div>
        <a class="panel-block" v-for="item in data" v-bind:key="item.thread" @click="threadClick">
            <span class="th_no">{{ item.no }}</span>
            <div class="tile">
                <article class="tile is-chiled">
                    <p v-html="cleanHTML(item.message)"></p>
                    <p class="has-text-right">
                        <span class="th_name" v-text="removeHTML(item.name)"></span>
                        <span class="th_date">{{ item.date }}</span> 
                    </p>
                </article>
            </div>
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
        },
        cleanHTML: function(elem) {
            if (typeof elem === 'undefined') {
                return ''
            }
            var d = elem.replace(/http:\/\/jump\.5ch\.net\/\?/g,'')
            d = d.replace(/href/g, 'name')
            d = d.replace(/target="_blank"/g, '')
            d = d.replace(/(\/\/img\.5ch\.net\/)/, 'https:$1') 
            return d
        },
        removeHTML: function(elem) {
            if (typeof elem === 'undefined') {
                return ''
            }
            return elem.replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')
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
    }
}
</script>

<style lang="scss">
div img.thumb_i {
    display: block;
    height: 65px;
    width: 65px;
}
span {
    &.th_no {
        margin-right: 0.5rem;
    }
    &.th_date {
        color: green;
        font-size: 0.8rem;
    }
    &.th_name {
        color: gray;
        font-size: 0.7rem;
    }
}
</style>