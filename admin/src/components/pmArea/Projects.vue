<template lang="pug">
.projects
    .projects__table
        Allprojects
</template>

<script>
import Allprojects from './Allprojects';

export default {
    data() {
        return {
            
        }
    },
    components: {
        Allprojects
    }
}
</script>

<style lang="scss" scoped>

.projects {
  width: calc(100% - 150px);
}

</style>
