<template lang='pug'>
  .tableSelect
    .select__selected(:class='{errorActive: !projects[index].targetLang.text && !projects[index].targetLang.exist, savedDisable: projects[index].icons[0].status}')
        span {{ targetLangSelect }}
        .icon(@click="showLanguages")
            i.fa.fa-caret-down
    input.search(v-if="droppedLang && projects[index].icons[1].status" type="text" v-model="search" placeholder="Search")                            
    .drop(v-if="droppedLang && projects[index].icons[1].status")
      span.drop_item(@click="changeLang(langIndex, index)" v-for="(lang, langIndex) in targetLanguages" ) {{ lang.lang }}
</template>

<script>


export default {
  props: {
    index: {
      type: Number
    },
    projects: {
      type: Array
    },
  },
  data () {
      return {
        droppedLang: false,
        search: "",
        languages: [],
        selectedLang: "",
        langIndex: ''
      }
  },
  watch: {

  },
  computed: {
    targetLangSelect() {
      if(!this.projects[this.index].targetLang.text){
        return 'Options'
      } else {
        return this.projects[this.index].targetLang.text
      }
    },
    targetLanguages() {
      let allLang = [];
      this.languages.map( (item) => {
          if(item.dialects.length) {
              allLang.push(item);
              for(let i = 0; i < item.dialects.length; i++) {
                  allLang.push(item.dialects[i])
              }
          } else {
              allLang.push(item);
          }
      })

      let array = allLang.filter(item => {
          if(item.lang.toUpperCase().indexOf(this.search.toUpperCase()) >= 0) return item;
      })
      array.sort((a, b) => {
          if(a.lang > b.lang) return 1
          else return -1;
      });

      return array;
    }
  },
  methods: {
    showLanguages() {
      this.droppedLang = !this.droppedLang;
      this.search = ''
    },
    changeLang(langIndex, index) {
      this.langIndex = langIndex;
      let choice = this.targetLanguages[langIndex];
      this.selectedLang =  choice.symbol;
      this.$emit("addLanguage", {index, lang: this.targetLanguages[langIndex]})
    },
    async getLanguages() {
        const result = await this.$axios.$get('languages')
        .then(response => {
            this.languages = response;
        })
        .catch(e => {
            this.errors.push(e)
        })
    }
  },
  mounted () {
    this.getLanguages()
  }
}
</script>

<style lang='scss'>

</style>
