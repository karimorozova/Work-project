<template lang="pug">
.projects
    Sidebar( 
        title="PM-AREA" 
        :links="sidebarLinks"
    )
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
  min-height: 94vh;
  display: flex;
  width: 100%;
}

</style>
