<template lang="pug">
  .wrapper
    .sideRight

      .details(v-if="currentProject._id")
        .details__header
          .details__name {{ currentProject.projectName }}
          .details__body
            .d-col
              .d-row
                .d-value Project ID:
                .d-key {{ currentProject.projectId }}
              .d-row
                .d-value Status:
                .d-key {{ currentProject.status }}
            .d-col
              .d-row
                .d-value  Start:
                .d-key {{ currentProject.startDate }}
              .d-row
                .d-value Industry:
                .d-key {{ currentProject.industry }}
            .d-col
              .d-row
                .d-value Deadline:
                .d-key {{ currentProject.deadline }}


        .details__progress
          span progress

      span
    .sideLeft(v-if="currentProject._id")
      .user(v-if="currentProject.accountManager" )
        .user__image
          img(v-if="currentProject.accountManager.photo && !currentProject.accountManager.photo.includes('https://')" :src="domain+currentProject.accountManager.photo")
          .user__fakeImage(:style="{'--bgColor': getBgColor(currentProject.accountManager._id)[0], '--color':getBgColor(currentProject.accountManager._id)[1]  }" v-else) {{ currentProject.accountManager.firstName[0].toUpperCase() }}
        .user__name Account Manager
        .user__name {{currentProject.accountManager.firstName + ' ' + currentProject.accountManager.lastName || ''}}


</template>

<script>
// import MainInfo from "../../dashboard/details/MainInfo"
// import OtherInfo from "../../dashboard/details/OtherInfo"
import { mapGetters, mapActions } from "vuex"
import getBgColor from "../../../../mixins/getBgColor"

export default {
  mixins: [ getBgColor ],
  data() {
    return {
      domain: ''
    }
  },
  methods: {
    ...mapActions({
      selectProject: "selectProject",
      alertToggle: "alertToggle",
      getClient: "getClient"
    }),
    async getCurrentProject() {
      const { id } = this.$route.params
      try {
        const res = await this.$axios.get('/portal/project/' + id + '?customer=' + this.client._id)
        await this.selectProject(res.data)
        console.log(res.data)
      } catch (err) {
      }
    }
  },
  computed: {
    ...mapGetters({
      client: "getClientInfo",
      currentProject: "getSelectedProject"
      // token: "getToken"
    })
    // title() {
    //   let result = "Quote Details"
    //   let statuses = [ 'Quote sent', 'Requested' ]
    //   if (statuses.indexOf(this.project.status) === -1) {
    //     result = 'Project Details'
    //   }
    //   return result
    // }
  },
  components: {},

  async created() {
    this.domain = process.env.domain
    await this.getClient()
    await this.getCurrentProject()
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors";

.details {
  display: flex;

  &__header {
    width: 70%;
    //background-color: cornsilk;
  }

  &__body {
    display: flex;
  }

  &__progress {
    width: 30%;
    background-color: chocolate;
  }


  &__name {
    font-size: 16px;
    font-family: Myriad600;
    margin-bottom: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid $border;
  }
}

.sideLeft {
  padding: 25px;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  box-sizing: border-box;
  width: 300px;
  margin-left: 25px;
}

.sideRight {
  padding: 25px;
  background-color: white;
  border-radius: 4px;
  box-shadow: $box-shadow;
  box-sizing: border-box;
  width: 670px;
}

.user {
  display: flex;
  flex-direction: column;
  align-items: center;

  &__name {
    margin-top: 6px;
  }

  &__fakeImage {
    cursor: default;
    height: 32px;
    width: 32px;
    border-radius: 32px;
    background-color: var(--bgColor);
    color: var(--color);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
  }

  &__image {
    cursor: default;
    height: 32px;
    width: 32px;
    border-radius: 32px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 32px;
    }
  }
}

</style>
