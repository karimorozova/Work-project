<template lang="pug">
.projects
    .projects__table
        Allprojects
</template>

<script>
import Sidebar from '../Sidebar';
import Allprojects from './Allprojects';

export default {
    data() {
        return {
            sidebarLinks: ['Open Projects']
        }
    },
    components: {
        Sidebar,
        Allprojects
    }
}
</script>

<style lang="scss" scoped>

.projects {
  display: flex;
  width: 100%;
  &__table {
    max-width: calc(100% - 150px);
  }
}

</style>
