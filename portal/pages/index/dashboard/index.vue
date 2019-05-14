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
    }
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
      return this.filterByStatus(statuses);
    },
    filteredQuotes() {
      let statuses = ['Quote sent', 'Requested'];
      return this.filterByStatus(statuses);
    }
  },
  components: {
    Table
  }
}

</script>

<style lang="scss" scoped>

.dashboard {
  padding-top: 80px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
    box-shadow: 0 3px 13px rgba(0, 0, 0, 0.3);
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
    padding: 15px;
    cursor: pointer;
  }
  &__table {
    width: 100%;
    padding: 10px;
    transition: all 0.4s;
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
