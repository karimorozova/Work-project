<template lang="pug">
    .langsList
        span(v-for="lang in languages" @click="chooseLang(lang)") {{ lang.lang }}
</template>

<script>
export default {
    data() {
        return {
            languages: []
        }
    },
    methods: {
        async getLanguages() {
            const result = await this.$axios.$get('api/languages')
            .then(response => {
                this.languages = response.sort((a, b) => {
                    if(a.lang > b.lang) return 1
                    else return -1;
                });
            })
            .catch(e => {
                this.errors.push(e)
            })
        },
        chooseLang(lang) {
            this.$emit('chooseLang', lang.lang)
        }
    },
    mounted() {
        this.getLanguages()
    }
}
</script>

<style lang="scss">
    .langsList {
        display: flex;
        flex-direction: column;
        span {
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
