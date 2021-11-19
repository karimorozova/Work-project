<template lang="pug">
  .projectToXtrf
    .projectToXtrf__buttons
      .margin-bottom
        Button.button(v-if="isShowingSendButton" value="Send tasks to XTRF" :isFullMainClass="true"  @clicked="sendTo" :isDisabled="isDisable")
        Button.button(v-if="isShowingSendButton" value="Send manual"  :isFullMainClass="true" :outline="true"  @clicked="check" :isDisabled="isDisable")
      .xtrf-tasks(v-for="xtrfTask of project.xtrfLinks")
        span {{ xtrfTask.taskId}} : &nbsp;
        a( target="_blank" :href="xtrfTask.link")
          i(class="fas fa-link")
        | &nbsp;|&nbsp;
        span(class="cursor-pointer" @click="updateFinance(xtrfTask.xtrfId, xtrfTask.taskId)")
          i(class="fas fa-check-circle") &nbsp;
          | Update & Close

    //.projectToXtrf__buttons(style="display: flex; align-items: center; margin-top: 10px;")
    //  CheckBox(
    //    :isChecked="project.xtrfLinks.length"
    //    @check="check"
    //    @uncheck="uncheck"
    //  )
    //  span(style="margin-left: 10px;") Marks as Transferred

    //.inputs(v-for="xtrfTask of project.xtrfLinks" style="display: flex; margin-top: 10px;" )
      div {{ xtrfTask.taskId}} : &nbsp;
      input(v-model="xtrfTask.link" @change="setUrl")


      //a( target="_blank" :href="project.xtrfLink || ''")
        //Button(value="Go to XTRF Project")
      //br
      //Button(v-if="project.xtrfLink" value="Update Fiance / Close Jobs & Project" @clicked="updateFinance")


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
import { mapActions } from "vuex"
import CheckBox from "../CheckBox"

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
    //     const result = await this.$http.put("/pm-manage/project-prop", { projectId: this.project._id, prop: 'xtrfLinks', value: this.project.xtrfLinks })
    //     await this.setCurrentProject(result.body)
    //     this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
    //   } catch (err) {
    //     this.alertToggle({ message: "Server Error / Cannot update Project", isShow: true, type: "error" })
    //   }
    // },
    async check() {
      try {
        const value = this.project.tasks.map(item => ({ taskId: item.taskId, link: '' }))
        const result = await this.$http.put("/pm-manage/send-manualy-to-xtrf", { projectId: this.project._id, prop: 'xtrfLinks', value })
        await this.setCurrentProject(result.body)
        this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server Error / Cannot update Project", isShow: true, type: "error" })
      }
    },
    async uncheck() {
      try {
        const result = await this.$http.put("/pm-manage/project-prop", { projectId: this.project._id, prop: 'xtrfLinks', value: [] })
        await this.setCurrentProject(result.body)
        this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server Error / Cannot update Project", isShow: true, type: "error" })
      }
    },
    async updateFinance(xtrfId, taskId) {
      try {
        await this.$http.post('/pm-manage/updateXtrfTasks/' + this.$route.params.id, { xtrfId, taskId })
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
          .post('/pm-manage/createXtrfTasksWithFinance/' + this.$route.params.id)
          .then((res) => res.data)
          .then((data) => {
            if (!!data) {
              // 	const notFoundVendorsMessage = data.noFoundVendors.length ? ", but we can not find some vendors: " + data.noFoundVendors.join(", ") : ''
              this.alertToggle({
                // message: "Send success" + notFoundVendorsMessage,
                message: "Send success",
                isShow: true,
                type: "success"
              })
              this.$emit('refreshProject')
            } else {
              // this.alertToggle({
              // 	message: data.message,
              // 	isShow: true,
              // 	type: "error"
              // })
            }
          })
          .finally(() => this.isDisable = false)
    }
  },
  computed: {
    isShowingSendButton() {
      return this.project.xtrfLinks.length !== this.project.tasks.length
    }
  },
  components: { CheckBox, Button }
}
</script>

<style scoped lang="scss">
@import "../../assets/scss/colors";

.xtrf-tasks {
  margin: 10px 0;

  &__group {
    display: flex;
    justify-content: space-between;
  }
}

.cursor-pointer {
  cursor: pointer;
}

.projectToXtrf {
  box-sizing: border-box;
  padding: 25px;
  box-shadow: $box-shadow;
  min-width: 420px;
  width: 420px;
  background: white;
  border-radius: 4px;
  margin-bottom: 25px;


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

a {
  text-decoration: none;
  color: inherit;
}

.projectToXtrf {
  box-sizing: border-box;
  padding: 20px;
  box-shadow: $box-shadow;
  min-width: 400px;
  width: 400px;
  background: white;
  border-radius: 4px;
  margin-bottom: 40px;


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

  .red {
    color: #d15f45;
    margin-bottom: 3px;
  }

  .margin-bottom {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
  }
  .button {
    width: 175px;
  }
}

input {
  font-size: 14px;
  color: $text;
  border: 1px solid $border;
  border-radius: 4px;
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