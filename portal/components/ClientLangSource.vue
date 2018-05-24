<template lang="pug">
    .langsList
        input(type="text" v-model="search" placeholder="Search")
        span(v-for="lang in filteredLanguages" @click="chooseLang(lang)") {{ lang.name }}
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
                    this.sourceLanguages.push(array[i].sourceLanguage)
                }
            }
        },
        chooseLang(lang) {
            this.$emit('chooseLang', lang.name)
        }
    },
    computed: {
        filteredLanguages() {
            let array = this.sourceLanguages.filter( item => {
                if(item.name.toUpperCase().indexOf(this.search.toUpperCase()) >= 0) return item;
            });
            array = array.filter((obj, pos, arr) => {
                return arr.map( mapObj => mapObj.name).indexOf(obj.name) === pos;
            });
            array.sort( (a, b) => { return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0) });
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
