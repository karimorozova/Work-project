<template lang="pug">
    .langsList
        input(type="text" v-model="search" placeholder="Search")
        span(v-for="jobType in jobTypes" @click="chooseType(jobType)") {{ jobType }}
</template>

<script>
  export default {
    data() {
      return {
        sourceJobTypes: [],
        search: ""
      }
    },
    methods: {
      sourceJobType() {
        // let array = this.$store.state.clientLanguages;
        // if (array.length) {
        //     for(let i = 0; i < array.length; i++) {
        //         if(array[i].source) {
        //             this.sourceLanguages.push(array[i].source);
        //         }
        //     }
        // }
      },
      chooseType(type) {
        this.$emit('chooseJobType', 'type')
      }
    },
    computed: {
      jobTypes() {
        // let array = this.sourceLanguages.filter( item => {
        //     if(item.lang.toUpperCase().indexOf(this.search.toUpperCase()) >= 0) return item;
        // });
        // array = array.filter((obj, pos, arr) => {
        //     return arr.map( mapObj => mapObj.lang).indexOf(obj.lang) === pos;
        // });
        // array.sort( (a, b) => { return (a.lang > b.lang) ? 1 : ((b.lang > a.lang) ? -1 : 0) });
        return [];
      }
    },
    mounted() {
      this.sourceJobType()
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
