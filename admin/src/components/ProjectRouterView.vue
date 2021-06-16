<template lang="pug">
  .projects
    .projects__table
      router-view(
        projectsType="openProjects"
        @filterProjects="getProjects"
        @bottomScrolled="bottomScrolled"
      )
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import projectsAndRequsets from '@/mixins/projectsAndRequests';

export default {
  mixins: [projectsAndRequsets],
  data() {
    return {
      isDataRemain: true,
      lastDate: new Date(),
      endpoint: "allprojects",
      prop: "projects",
    }
  },
  methods: {
    ...mapActions(["setAllProjects", "alertToggle"]),
    async getProjects(filters) {
      await this.getData(filters);
    }
  },
  computed: {
    ...mapGetters({
      projects: "getAllProjects"
    })
  },
  created() {
    this.getProjects({ filters: null });
  },
}
</script>

<style lang="scss" scoped>

.projects {
  width: calc(100% - 150px);
}

</style>
