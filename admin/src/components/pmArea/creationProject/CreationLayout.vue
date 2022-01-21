<template lang="pug">
  .layout
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
          :extraOptions="extraOptions"
          :clients="clients",
          :industries="industries"
          :user="user"
        )
      .creation__content(v-if="selectedTab === 'Individual'")
        Individual(
          :extraOptions="extraOptions"
          :industries="industries"
          :user="user"
        )
      .creation__content(v-else-if="selectedTab === 'Memoq Link'")
        Memoq(
          :extraOptions="extraOptions"
          :clients="clients",
          :industries="industries"
          :user="user"
        )
      .creation__content(v-else-if="selectedTab === 'XTM Files'")
        XTM(
          :extraOptions="extraOptions"
          :clients="clients",
          :industries="industries"
          :user="user"
        )
    .side
      Side(
        :extraOptions="extraOptions"
        @setSideOption="setSideOption"
      )

</template>

<script>
import Tabs from "../../Tabs"
import { mapGetters } from "vuex"
import Classic from "./Classic"
import Memoq from "./Memoq"
import XTM from "./XTM"
import Side from "./Side"
import Individual from "./Individual"

export default {
  name: "creationLayout",
  data() {
    return {
      tabs: [ 'Classic', 'Individual', 'Memoq Link', 'XTM Files' ],
      selectedTab: 'Classic',
      clients: [],
      extraOptions: {
        isTest: false,
        isUrgent: false,
        isSkipProgress: false
      }
    }
  },
  methods: {
    setTab({ index }) {
      this.selectedTab = this.tabs[index]
    },
    setSideOption({ prop, value }) {
      this.extraOptions = { ...this.extraOptions, [prop]: value }
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
    Individual,
    Side,
    XTM,
    Memoq,
    Classic,
    Tabs
  }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.layout {
  margin: 50px 0 50px 50px;
  display: flex;
}

.creation {
  padding: 25px;
  width: 1040px;
  box-shadow: $box-shadow;
  position: relative;
  background: white;
  border-radius: 4px;
  box-sizing: border-box;
  height: fit-content;

  &__content {
    margin-top: 25px;
  }

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