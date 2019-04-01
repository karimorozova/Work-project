<template lang="pug">
  Accountinfo(:client="client" :user="user" :projects="projects" :quotes="quotes")
</template>

<script>
  import Accountinfo from "~/components/account/Accountinfo";
  export default {
    props: {
      client: {
        type: Object
      },
      user: {
        type: Object
      },
      projects : {
        type: Array
      },
      quotes: {
        type: Array
      }
    },
    components: {
      Accountinfo
    },
  }
</script>

<style  scoped>

</style>

