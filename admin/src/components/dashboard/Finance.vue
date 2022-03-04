<template lang="pug">
  .finance(v-if="user.email === 'michal@pangea.global'")
    .row
      .col-size
        ProjectStats(:projectsStats="stats")
      .col
        XtrfStatsToday( :xtrfStats="todayStats")

    .row(v-if="Object.keys(xtrfStatsByClient).length" )
      .col
        h3 TODAY
        .diff
          .diff__row(style="margin-bottom: 15px;")
            .diff__cli
              b Client
            .diff__sum1
              b Pangea
            .diff__sum2
              b XTRF
            .diff__total
              b Difference
          .diff__row(v-for="i in diffClientsToday")
            .diff__cli {{i.client}}
            .diff__sum1 {{i.amountInPangea}}
            .diff__sum2 {{i.amountInXTRF}}
            .diff__total {{i.diff}}
      .col
        h3 MONTH
        .diff
          .diff__row(style="margin-bottom: 15px;")
            .diff__cli
              b Client
            .diff__sum1
              b Pangea
            .diff__sum2
              b XTRF
            .diff__total
              b Difference
          .diff__row(v-for="i in diffClientsMonth")
            .diff__cli {{i.client}}
            .diff__sum1 {{i.amountInPangea}}
            .diff__sum2 {{i.amountInXTRF}}
            .diff__total {{i.diff}}

    .row(v-if="Object.keys(xtrfStatsByClient).length" )
      .col
        .strings
          .string
            h4 Pangea TODAY
            .test(v-for="projStats in stats.statsDailyByClient")
              .name {{projStats.name}}
              .curency {{projStats.currencyNormalized}}
              .amount {{projStats.amount}}
          .string
            h4 Pangea MONTH
            .test(v-for="projStats in stats.statsMonthByClient")
              .name {{projStats.name}}
              .curency {{projStats.currencyNormalized}}
              .amount {{projStats.amount}}

      .col
        .strings
          .string
            h4 XTRF TODAY
            .test(v-for="xtrfStats in xtrfStatsByClient.todayClientsAmount")
              .name {{xtrfStats.name}}
              .curency {{xtrfStats.currencyNormalized}}
              .amount {{xtrfStats.amount}}

          .string
            h4 XTRF MONTH
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
    }),
    diffClientsMonth() {
      const listOfAllClients = []

      Object.keys(this.stats.statsMonthByClient).forEach(client => {
        if (!listOfAllClients.includes(client)) listOfAllClients.push(client)
      })
      this.xtrfStatsByClient.monthClientsAmount.forEach(item => {
        if (!listOfAllClients.includes(item.name)) listOfAllClients.push(item.name)
      })

      return listOfAllClients.map(client => {
        const amountInPangea = Object.values(this.stats.statsMonthByClient).find(item => item.name === client)?.amount || 0
        const amountInXTRF = this.xtrfStatsByClient.monthClientsAmount.find(item => item.name === client)?.amount || 0
        return {
          client,
          amountInPangea,
          amountInXTRF,
          diff: +(amountInPangea - amountInXTRF).toFixed(2)
        }
      })
    },
    diffClientsToday() {
      const listOfAllClients = []

      Object.keys(this.stats.statsDailyByClient).forEach(client => {
        if (!listOfAllClients.includes(client)) listOfAllClients.push(client)
      })
      this.xtrfStatsByClient.todayClientsAmount.forEach(item => {
        if (!listOfAllClients.includes(item.name)) listOfAllClients.push(item.name)
      })

      return listOfAllClients.map(client => {
        const amountInPangea = Object.values(this.stats.statsDailyByClient).find(item => item.name === client)?.amount || 0
        const amountInXTRF = this.xtrfStatsByClient.todayClientsAmount.find(item => item.name === client)?.amount || 0
        return {
          client,
          amountInPangea,
          amountInXTRF,
          diff: +(amountInPangea - amountInXTRF).toFixed(2)
        }
      })
    }
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

.diff {
  &__row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__cli {
    width: 300px;
  }

  &__total,
  &__sum1,
  &__sum2 {
    width: 100px;
  }
}

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
    border-radius: 2px;
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
  width: 340px;
}

.test {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.name {
  width: 180px;
}

.amount {
  width: 80px;
}
</style>