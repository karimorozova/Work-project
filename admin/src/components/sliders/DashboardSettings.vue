<template lang="pug">
  .dashboard
    Activities
</template>

<script>
import Activities from "../reports/Activities"

export default {
  data() {
    return {
      
    }
  },
  methods: {

  },
  computed: {
    
  },
  components: {
    Activities
  }
};
</script>

<style lang="scss" scoped>

.dashboard {
  min-height: 94vh;
  width: 100%;
  padding-left: 40px;
  box-sizing: border-box;
}

</style>
