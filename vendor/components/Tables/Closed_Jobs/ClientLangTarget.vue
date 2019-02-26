<template lang="pug">
    .langsList
        input(type="text" v-model="search" placeholder="Search")
        span(v-for="lang in filteredLanguages" @click="chooseLang(lang)") {{ lang.lang }}
</template>

<script>
export default {
    data() {
        return {
            targetLanguages: [],
            search: ""
        }
    },
    methods: {
        targetLangs() {
            // let array = this.$store.state.clientLanguages;
            // if (array.length) {
            //     for(let i = 0; i < array.length; i++) {
            //         this.targetLanguages.push(array[i].target)
            //     }
            // }
        },
        chooseLang(lang) {
            this.$emit('chooseInvoiceDate', lang.lang)
        }
    },
    computed: {
        filteredLanguages() {
            // let array = this.targetLanguages.filter( item => {
            //     if(item.lang.toUpperCase().indexOf(this.search.toUpperCase()) >= 0) return item;
            // });
            // array = array.filter((obj, pos, arr) => {
            //     return arr.map( mapObj => mapObj.lang).indexOf(obj.lang) === pos;
            // });
            // array.sort( (a, b) => { return (a.lang > b.lang) ? 1 : ((b.lang > a.lang) ? -1 : 0) });
            // return array;
          return []
        }
    },
    mounted() {
        this.targetLangs()
    }
}
</script>

<style lang="scss">
    .langsList {
        display: flex;
        flex-direction: column;
        input {
            padding: 5px 3px;
        }
        span {
            font-size: 15px;
            transition: all 0.3s;
            padding: 3px;
            border-bottom: 0.5px solid #67573E;
            &:last-child {
                border-bottom: none;
            }
            cursor: pointer;
            &:hover {
                background-color: #978D7E;
                color: white;
                padding-left: 7px;
            }
        }
    }
</style>
