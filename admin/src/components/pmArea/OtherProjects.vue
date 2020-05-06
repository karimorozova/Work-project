<template lang="pug">
    .other-projects
        OtherProjectFilter(
            :sourceLangs="sourceFilter"
            :targetLangs="targetFilter"
            @setFilter="setFilter"
            @addLangFilter="addLangFilter"
            @removeLangFilter="removeLangFilter"
        )
        .other-projects__table
            OtherProjectTable(:allProjects="allProjects")
</template>

<script>
import OtherProjectTable from "./otherProjects/OtherProjectTable";
import OtherProjectFilter from "./otherProjects/OtherProjectFilter";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      allProjects: [],
      filters: {
        clientFilter: "",
        startFilter: "",
        deadlineFilter: ""
      },
      sourceFilter: [],
      targetFilter: []
    };
  },
  methods: {
    ...mapActions(["alertToggle"]),
    async setFilter({ option, prop }) {
      this.filters[prop] = option;
      await this.getProjects(this.allFilters);
    },
    async addLangFilter({ to, lang }) {
      this[to].push(lang.symbol);
      await this.getProjects(this.allFilters);
    },
    async removeLangFilter({ from, position }) {
      this[from].splice(position, 1);
      await this.getProjects(this.allFilters);
    },
    async getProjects(filters) {
      try {
        const result = await this.$http.post(
          "/memoqapi/other-projects",
          filters
        );
        this.allProjects = result.data;
      } catch (err) {
        this.alertToggle({
          message: "Can't get projects",
          isShow: true,
          type: "error"
        });
      }
    },
    getSourceFilter() {
      return this.sourceFilter;
    }
  },
  computed: {
    allFilters() {
      return {
        clientFilter: this.filters.clientFilter,
        startFilter: this.filters.startFilter,
        deadlineFilter: this.filters.deadlineFilter,
        sourceFilter: this.sourceFilter,
        targetFilter: this.targetFilter
      };
    }
  },
  components: {
    OtherProjectTable,
    OtherProjectFilter
  },
  async created() {
    await this.getProjects();
  }
};
</script>

<style lang="scss" scoped>
.other-projects {
  width: calc(100% - 150px);
  margin: 50px 20px 20px;
  max-width: 1205px;
  box-shadow: 0 0 10px #68573e;
  padding: 15px;
}
</style>
