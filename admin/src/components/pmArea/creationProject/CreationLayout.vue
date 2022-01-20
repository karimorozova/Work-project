<template lang="pug">
  .creation
    .creation__title Add Project
    .creation__tabs
      Tabs(
        :tabs="tabs"
        @setTab="setTab"
        :selectedTab="selectedTab"
      )
    .creation__content(v-if="selectedTab === 'Classic'")
      Classic(
        :clients="clients",
        :industries="industries"
        :user="user"
      )
    .creation__content(v-else-if="selectedTab === 'Memoq Link'")
      Memoq(
        :clients="clients",
        :industries="industries"
        :user="user"
      )
    .creation__content(v-else-if="selectedTab === 'XTM Files'")
      XTM(
        :clients="clients",
        :industries="industries"
        :user="user"
      )

</template>

<script>
import Tabs from "../../Tabs"
import { mapGetters } from "vuex"
import Classic from "./Classic"
import Memoq from "./Memoq"
import XTM from "./XTM"

export default {
  name: "creationLayout",
  data() {
    return {
      tabs: [ 'Classic', 'Individual', 'Memoq Link', 'XTM Files' ],
      selectedTab: 'Classic',
      clients: []
    }
  },
  methods: {
    setTab({ index }) {
      this.selectedTab = this.tabs[index]
    },
    async getCustomers() {
      try {
        let result = await this.$http.get(`/active-clients`)
        this.clients = [ ...result.data ].sort((a, b) => a.name.localeCompare(b.name))
      } catch (err) {
        this.alertToggle({ message: "Error on getting customers", isShow: true, type: "error" })
      }
    }
  },
  computed: {
    ...mapGetters({
      industries: "getAllIndustries",
      user: "getUser"
    })
  },
  async created() {
    await this.getCustomers()
  },
  components: {
    XTM,
    Memoq,
    Classic,
    Tabs
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.creation {
  margin: 50px;
  padding: 25px;
  width: 1040px;
  box-shadow: $box-shadow;
  position: relative;
  background: white;
  border-radius: 4px;
  box-sizing: border-box;

  &__title {
    font-size: 18px;
    font-family: Myriad600;
    margin-bottom: 15px;
  }

  &__tabs {
    border-bottom: 1px solid $border;
  }
}

</style>