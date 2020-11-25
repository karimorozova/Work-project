<template lang="pug">
    .langsList
        input(type="text" v-model="search" placeholder="Search")
        span(v-for="lang in filteredLanguages" @click="chooseLang(lang)") {{ lang.lang }}
</template>

<script>
export default {
    data() {
        return {
            sourceLanguages: [],
            search: ""
        }
    },
    methods: {
        sourceLangs() {
            let array = this.$store.state.clientLanguages;
            if (array.length) {
                for(let i = 0; i < array.length; i++) {
                    if(array[i].source) {
                        this.sourceLanguages.push(array[i].source);
                    }
                }
            }
        },
        chooseLang(lang) {
            this.$emit('chooseLang', lang.lang)
        }
    },
    computed: {
        filteredLanguages() {
            let array = this.sourceLanguages.filter( item => {
                if(item.lang.toUpperCase().indexOf(this.search.toUpperCase()) >= 0) return item;
            });
            array = array.filter((obj, pos, arr) => {
                return arr.map( mapObj => mapObj.lang).indexOf(obj.lang) === pos;
            });
            array.sort( (a, b) => { return (a.lang > b.lang) ? 1 : ((b.lang > a.lang) ? -1 : 0) });
            return array;
        }
    },
    mounted() {
        this.sourceLangs()
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
            transition: all 0.2s;
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
