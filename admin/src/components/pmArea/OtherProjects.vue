<template lang="pug">
.projects
    .other-projects
        OtherProjectFilter(
            :sourceLangs="sourceFilter"
            :targetLangs="targetFilter"
            @setFilter="setFilter"
            @addLangFilter="addLangFilter"
            @removeLangFilter="removeLangFilter"
        )
        .other-projects__table
            OtherProjectTable(
              :allProjects="allProjects"
              @bottomScrolled="bottomScrolled"
              )
</template>

<script>
import OtherProjectTable from "./otherProjects/OtherProjectTable";
import OtherProjectFilter from "./otherProjects/OtherProjectFilter";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      allProjects: [],
      isDataRemain: true,
      lastDate: new Date(),
      filters: {
        clientFilter: "",
        pmFilter: "",
        startFilter: "",
        deadlineFilter: "",
        query: "",
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
    	let query = this.$route.query.status;
	    query = query.replace(/(-)/g, ' ')
      this.filters.query = query
      try {
        const result = await this.$http.post(
          "/memoqapi/other-projects",
            filters,
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
    async bottomScrolled() {
      if (this.isDataRemain) {
        const result = await this.$http.post("/memoqapi/other-projects", {
          ...this.allFilters,
          lastDate: this.lastDate
        });
        this.allProjects.push(...result.data);
        this.isDataRemain = result.body.length === 25;
        this.lastDate =
          result.body && result.body.length
            ? result.body[result.body.length - 1].creationTime
            : "";
      }
    }
  },
  computed: {
    allFilters() {
      return {
        clientFilter: this.filters.clientFilter,
        pmFilter: this.filters.pmFilter,
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
.projects {
  width: 100%;
}
.other-projects {
  margin: 40px 40px 40px 20px;
  width: 1100px;
  box-shadow: 0 0 10px rgba(104,87,62,.5);
  padding: 20px;
  height: calc(100% - 140px);
}
</style>
