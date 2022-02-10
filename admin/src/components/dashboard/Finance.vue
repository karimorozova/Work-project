<template lang="pug">
  .finance(v-if="user.email === 'michal@pangea.global'")
    .row
      .col-size
        ProjectStats(:projectsStats="stats")
      .col
        XtrfStatsToday( :xtrfStats="todayStats")

    .row
      .col
        .strings
          .string
            .test(v-for="projStats in stats.statsDailyByClient")
              .name {{projStats.name}}
              .curency {{projStats.currencyNormalized}}
              .amount {{projStats.amount}}

          .string
            .test(v-for="projStats in stats.statsMonthByClient")
              .name {{projStats.name}}
              .curency {{projStats.currencyNormalized}}
              .amount {{projStats.amount}}

      .col
        .strings
          .string
            .test(v-for="xtrfStats in xtrfStatsByClient.todayClientsAmount")
              .name {{xtrfStats.name}}
              .curency {{xtrfStats.currencyNormalized}}
              .amount {{xtrfStats.amount}}

          .string
            .test(v-for="xtrfStats in xtrfStatsByClient.monthClientsAmount")
              .name {{xtrfStats.name}}
              .curency {{xtrfStats.currencyNormalized}}
              .amount {{xtrfStats.amount}}

</template>

<script>
import ProjectStats from "./Tables/ProjectStats"
import XtrfStatsToday from "./Tables/XtrfStatsToday"
import { mapGetters } from "vuex"

export default {
  name: "Finance",
  components: {
    ProjectStats,
    XtrfStatsToday
  },
  data() {
    return {
      stats: [],
      todayStats: [],
      xtrfStatsByClient: {}
    }
  },
  computed: {
    ...mapGetters({
      user: 'getUser'
    })
  },
  async created() {
    this.stats = (await this.$http.get('/dashboard-api/projects-finance')).data
    this.todayStats = (await this.$http.get('/dashboard-api/finance')).data
    this.xtrfStatsByClient = (await this.$http.get('/dashboard-api/finance-by-client')).data
  }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.finance {
  width: 1530px;
  margin: 50px;

  .row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 35px;
  }

  .col {
    width: 755px;
    padding: 10px 20px 20px;
    box-shadow: $box-shadow;
    box-sizing: border-box;
    background-color: white;
    border-radius: 4px;
    position: relative;
    align-self: flex-start;
  }

  .col-size {
    width: 755px;
    box-sizing: border-box;
  }
}

.strings {
  display: flex;
  justify-content: space-between;
}

.string {
  width: 300px;
}

.test {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.name {
  width: 160px;
}

.amount {
  width: 80px;
}
</style>