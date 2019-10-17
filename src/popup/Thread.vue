<template>
    <div>
        <a class="panel-block" v-for="item in data" v-bind:key="item.thread">
            <span class="th_no">{{ item.no }}</span>
            <div class="tile">
                <article class="tile is-chiled">
                    <div class="content">
                        <p v-html="cleanTag(item.message)" ref="reply_link"></p>
                        <div class="content">
                            <span class="th_date">{{ item.date }}</span> 
                            <span class="th_name" v-text="removeTag(item.name)"></span>
                        </div>
                    </div>
                </article>
            </div>
        </a>
        <b-modal :active.sync="isThreadModalActive" :width="480" scroll="keep">
            <div class="tile">
                <article class="tile is-chiled">
                    <div class="content">
                        <p v-html="cleanTag(refer.message)" ref="reply_link"></p>
                        <div class="content">
                            <span class="th_date">{{ refer.date }}</span> 
                            <span class="th_name" v-text="removeTag(refer.name)"></span>
                        </div>
                    </div>
                </article>
            </div>
        </b-modal>
        <b-modal :active.sync="isImgModalActive" :width="480">
            <p class="image">
                <img v-bind:src="imgsrc">
            </p>
        </b-modal>
    </div>
</template>

<script>
export default {
    props: [
        'panelList'
    ],
    data () {
        return {
            data: [],
            isThreadModalActive: false,
            isImgModalActive: false,
            refer: {},
            imgsrc: ""
        }
    },
    methods: {
        threadClick: function(item) {
            console.log('click')
        },
        cleanTag: function(elem) {
            if (typeof elem === 'undefined') {
                return ''
            }
            var d = elem.replace(/http:\/\/jump\.5ch\.net\/\?/g,'')
            d = d.replace(/href/g, 'name')
            d = d.replace(/target="_blank"/g, '')
            d = d.replace(/(\/\/img\.5ch\.net\/)/, 'https:$1') 
            return d
        },
        removeTag: function(elem) {
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
        let self = this
        this.$nextTick(() => {
            self.data = self.panelList
            //console.log(self.$refs)
            async function dispReply() {
                const ref = await self.$refs
                for (var i = 0; i < ref.reply_link.length; i++) {
                    let node = ref.reply_link[i].querySelectorAll('.reply_link')
                    for (var j = 0; j < node.length; j++) {
                        node[j].addEventListener('mouseover', function(event) {
                            event.preventDefault()
                            self.isThreadModalActive = true
                            let num = Number(event.target.text.replace(/>+([0-9]+)/, '$1'))
                            self.refer = self.data[num]
                            //console.log('taget info: ', event.target.text.replace(/>+([0-9]+)/, '$1'))
                        })
                    }
                    let imgnode = ref.reply_link[i].querySelectorAll('.image')
                    for (var j = 0; j < imgnode.length; j++) {
                        imgnode[j].addEventListener('click', function(event) {
                            event.preventDefault()
                            console.log(event.target.text.trim())
                            self.imgsrc = event.target.text
                            self.isImgModalActive = true
                        })
                    }
                }
            }
            dispReply()
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
        color: black;
        font-size: 0.7rem;
    }
}
</style>