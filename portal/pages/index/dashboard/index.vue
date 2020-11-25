<template lang="pug">
  .dashboard
    .dashboard__item
      .dashboard__drop-menu(:class="{'dashboard_cornered': isQuotesOpened}")
        .dashboard__select(@click="toggleQuotes") Open Quotes
          img(src="../../../assets/images/open-close-arrow-brown.png" :class="{'dashboard_rotate-180': isQuotesOpened}")
        .dashboard__table(v-if="isQuotesOpened")
          Table(:projects="filteredQuotes" @iconClicked="makeQuoteAction" @getDetails="(e) => getDetails(e, 'filteredQuotes')")
    .dashboard__item
      .dashboard__drop-menu(:class="{'dashboard_cornered': isProjectsOpened}")
        .dashboard__select(@click="toggleProjects") Open Projects
          img(src="../../../assets/images/open-close-arrow-brown.png" :class="{'dashboard_rotate-180': isProjectsOpened}")
        .dashboard__table(v-if="isProjectsOpened")
          Table(:projects="filteredProjects" @getDetails="(e) => getDetails(e, 'filteredProjects')" :isOpenProjects="true")
</template>

<script>
import Table from "../../components/projects/Table";
import { mapActions, mapGetters } from "vuex";

export default {
  props: {
    projects: {
      type: Array
    },
    requests: {
      type: Array
    },
  },
  data() {
    return {
      isQuotesOpened: true,
      isProjectsOpened: true,
    }
  },
  methods: {
    ...mapActions({
      updateQuoteStatus: "updateQuoteStatus"
    }),
    toggleQuotes() {
      this.isQuotesOpened = !this.isQuotesOpened;
    },
    toggleProjects() {
      this.isProjectsOpened = !this.isProjectsOpened;
    },
    filterByStatus(statuses) {
      return this.projects.filter(item => {
        return statuses.indexOf(item.status) !== -1
      })
    },
    getDetails({index}, prop) {
      const id = this[prop][index]._id
      this.$router.push(`/dashboard/details/${id}`);
    },
    async makeQuoteAction({index, key}) {
      const quote = this.filteredQuotes[index];
      try {
        await this.updateQuoteStatus({ quote, key});
      } catch(err) {

      }
    }
  },
  computed: {
    filteredProjects() {
      let statuses = ['Started', 'Approved', 'In progress', 'Ready for Delivery'];
      const result = this.filterByStatus(statuses);
      return result.sort((a, b) => a.startDate < b.startDate ? 1 : -1);
    },
    filteredQuotes() {
      let statuses = ['Quote sent', 'Requested'];
      const projects = this.filterByStatus(statuses);
      const result = [...this.requests, ...projects];
      return result.sort((a, b) => a.startDate < b.startDate ? 1 : -1);
    }
  },
  components: {
    Table
  }
}

</script>

<style lang="scss" scoped>

.dashboard {
  width: 100%;
  display: flex;
  flex-direction: column;
  &__item {
    width: 1010px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    &:first-child {
      margin-bottom: 40px;
    }
  }
  &__drop-menu {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    border-radius: 18px;
    box-shadow: 0 0 10px #67573e9d;
    margin-right: 36px;
    margin-bottom: 10px;
    padding: 0 14px;
    color: #67573e;
    transition: all 0.2s;
  }
  &__select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 20px;
    cursor: pointer;
    font-size: 18px;
  }
  &__table {
    width: 100%;
    transition: all 0.2s;
  }
  &_cornered {
    border-radius: 0;
    border: none;
    margin-bottom: 0;
  }
  &_rotate-180 {
    transform: rotate(180deg);
  }
}

</style>
