<template lang="pug">
  .projectToXtrf
    .projectToXtrf__title
      span Xtrf

    template(v-if="project.xtrfLinks.length")
      .inputs(v-for="xtrfTask of project.xtrfLinks")
        div {{ xtrfTask.taskId}} : &nbsp;
          a( target="_blank" :href="xtrfTask.link")
            i(class="fas fa-link")
        input(v-model="xtrfTask.link" @change="setUrls")
    template(v-else)
      .inputs(style="margin-top: 10px;")
        div {{ project.projectId}} : &nbsp;
          a( target="_blank" :href="project.xtrfLink")
            i(class="fas fa-link")
        input(v-model="project.xtrfLink" @change="setUrl")
</template>

<script>
import Button from "../Button"
import axios from "axios"
import { mapActions } from "vuex"
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
    async setUrl() {
      try {
        const result = await this.$http.put("/pm-manage/project-prop", { projectId: this.project._id, prop: 'xtrfLink', value: this.project.xtrfLink })
        await this.setCurrentProject(result.body)
        this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server Error / Cannot update Project", isShow: true, type: "error" })
      }
    },
    async setUrls() {
      try {
        const result = await this.$http.put("/pm-manage/project-prop", { projectId: this.project._id, prop: 'xtrfLinks', value: this.project.xtrfLinks })
        await this.setCurrentProject(result.body)
        this.alertToggle({ message: "Project updated", isShow: true, type: "success" })
      } catch (err) {
        this.alertToggle({ message: "Server Error / Cannot update Project", isShow: true, type: "error" })
      }
    }

    // sendTo() {
    //   this.isDisable = true
    //   axios
    //       .get('/pm-manage/createXtrfProjectWithFinance/' + this.$route.params.id)
    //       .then((res) => res.data)
    //       .then((data) => {
    //         if (data.isSuccess) {
    //           const notFoundVendorsMessage = data.noFoundVendors.length ? ", but we can not find some vendors: " + data.noFoundVendors.join(", ") : ''
    //           this.alertToggle({
    //             message: "Send success" + notFoundVendorsMessage,
    //             isShow: true,
    //             type: "success"
    //           })
    //           this.$emit('refreshProject')
    //         } else {
    //           this.alertToggle({
    //             message: data.message,
    //             isShow: true,
    //             type: "error"
    //           })
    //         }
    //       })
    //       .finally(() => this.isDisable = false)
    // }
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
  width: 420px;
  background: white;
  border-radius: 4px;
  margin-bottom: 25px;

  &__title {
    font-size: 18px;
    font-family: Myriad600;
    border-bottom: 1px solid $light-border;
    margin-bottom: 20px;
    padding-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

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

.inputs {
  margin-bottom: 7px;

  div {
    margin-bottom: 3px;
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