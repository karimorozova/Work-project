<template lang="pug">
    .requests
        .requests__table
            Allprojects(
                projectsType="requests"
            )
</template>

<script>
import Allprojects from './Allprojects';
export default {
    data() {
        return {
        };
    },
  components: {
    Allprojects
  }
};

</script>

<style lang="scss" scoped>

.requests {
    width: calc(100% - 150px);
}

</style>
