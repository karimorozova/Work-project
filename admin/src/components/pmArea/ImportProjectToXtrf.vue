<template lang="pug">
  .projectToXtrf
    .projectToXtrf__buttons
      .margin-bottom
        Button.button(v-if="!project.isSendToXtrf && !project.xtrfLink && canSendToXtrf" :isFullMainClass="true" value="Send project to XTRF" @clicked="sendTo" :isDisabled="isDisable")
        Button.button(v-if="!project.isSendToXtrf && !project.xtrfLink" :isFullMainClass="true" :outline="true" value="Send manual" @clicked="check" :isDisabled="isDisable")
      span(v-if="project.isSendToXtrf && project.xtrfLink" ) Xtrf : &nbsp;
        a( target="_blank" :href="project.xtrfLink")
          i(class="fas fa-link")
        | &nbsp;&nbsp;
        i(class="fas fa-check-circle cursor-pointer" @click="updateFinance")

    //.projectToXtrf__buttons(style="display: flex; align-items: center; margin-top: 10px;")
    //  CheckBox(
    //    :isChecked="project.isSendToXtrf"
    //    @check="check"
    //    @uncheck="uncheck"
    //  )
    //  span(style="margin-left: 10px;") Marks as Transferred

    //div(v-if="project.isSendToXtrf" style="margin-top: 10px;")
    //  input(v-model="project.xtrfLink" @change="setUrl")

    .projectToXtrf__info
      .red
        span Pressing &nbsp;
        i(class="fas fa-check-circle cursor-pointer")
        span : Updates the finance, re-assigns the vendors, and closes the project and jobs.
        .sub-text (In case of failure press again, or contact the administrator)
      span If a step has the same language pair, they will be grouped. Accounts payable and receivable will be added.
      .dont-close-text If the project is not closed, click the button again.
</template>

<script>
import Button from "../Button"
import axios from "axios"
import { mapActions, mapGetters } from "vuex"
import CheckBox from "../CheckBox"
import { setCurrentProject } from "../../vuex/general/actions"
import ProjectDiscounts from "../clients/pricelists/ProjectDiscounts"

export default {
  props: {
    project: {
      type: Object
    }
  },
  data() {
    return {
      isDisable: false
    }
  },
  methods: {
    ...mapActions({
      alertToggle: "alertToggle",
      setCurrentProject: "setCurrentProject"
    }),
    // async setUrl() {
    //   try {
    //     const result = await this.$http.put("/pm-manage/project-prop", { projectId: this.project._id, prop: 'xtrfLink', value: this.project.xtrfLink })
    //     await this.setCurrentProject(result.body)
    //     this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
    //   } catch (err) {
    //     this.alertToggle({ message: "Server Error / Cannot update Project", isShow: true, type: "error" })
    //   }
    // },
    async check() {
      try {
        const result = await this.$http.put("/pm-manage/send-manualy-to-xtrf", { projectId: this.project._id, prop: 'isSendToXtrf', value: true })
        await this.setCurrentProject(result.body)
        this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server Error / Cannot update Project", isShow: true, type: "error" })
      }
    },
    async uncheck() {
      try {
        const result = await this.$http.put("/pm-manage/project-prop", { projectId: this.project._id, prop: 'isSendToXtrf', value: false })
        await this.setCurrentProject(result.body)
        this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server Error / Cannot update Project", isShow: true, type: "error" })
      }
    },
    async updateFinance() {
      try {
        await this.$http.get('/pm-manage/updateXtrfProject/' + this.$route.params.id)
        this.alertToggle({
          message: "Updated",
          isShow: true,
          type: "success"
        })
      } catch (err) {
        this.alertToggle({
          message: "Error on updating finance",
          isShow: true,
          type: "error"
        })
      }
    },
    sendTo() {
      this.isDisable = true
      axios
          .get('/pm-manage/createXtrfProjectWithFinance/' + this.$route.params.id)
          .then((res) => res.data)
          .then((data) => {
            if (data.isSuccess) {
              const notFoundVendorsMessage = data.noFoundVendors.length ? ", but we can not find some vendors: " + data.noFoundVendors.join(", ") : ''
              this.alertToggle({
                message: "Send success" + notFoundVendorsMessage,
                isShow: true,
                type: "success"
              })
              this.$emit('refreshProject')
            } else {
              this.alertToggle({
                message: data.message,
                isShow: true,
                type: "error"
              })
            }
          })
          .finally(() => this.isDisable = false)
    }
  },
  computed: {
    ...mapGetters({
      currentProject: 'getCurrentProject',
    }),
    canSendToXtrf() {
      const { status, tasks } = this.currentProject

      const closedCheck = tasks.length && (
          tasks.every(({ service }) => service.title === 'Translation')
          || tasks.every(({ service }) => service.title === 'TransCreation')
          || (tasks.every(({ service }) => service.title === 'Copywriting') && tasks.length === 1)
          || (tasks.every(({ service }) => service.title === 'Newsletter' || service.title === "SMS") && tasks.length === 2)
          || tasks.every(({ service }) => service.title === 'Certified Translation')
          || tasks.every(({ service }) => service.title === 'Translation Plain')
          || tasks.every(({ service }) => service.title === 'Editing')
      )

    		return closedCheck && (status === 'Closed' || status === 'In progress' || status === 'Approved')
    },
  },
  components: { ProjectDiscounts, CheckBox, Button }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.projectToXtrf {
  box-sizing: border-box;
  padding: 25px;
  box-shadow: $box-shadow;
  min-width: 420px;
  width: 400px;
  background: white;
  border-radius: 2px;
  margin-bottom: 25px;

  .projectToXtrf {

    &__info {
      margin-top: 10px;
      margin-bottom: 2px;
      letter-spacing: .6px;
      font-size: 11px;
      opacity: .5;

      .dont-close-text {
        margin: 5px 0 0 0;
      }
    }
  }

  .red {
    color: #d66f58;
    margin-bottom: 3px;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
  .button {
    width: 175px;
  }

  .margin-bottom {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
  }
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 2px;
  box-sizing: border-box;
  padding: 0 7px;
  outline: none;
  height: 32px;
  width: 100%;
  font-family: 'Myriad400';
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>