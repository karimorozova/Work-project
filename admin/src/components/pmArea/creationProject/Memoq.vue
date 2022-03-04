<template lang="pug">
  .content
    .row
      .row__title Memoq Name:
      .row__value
        input(type="text" v-model="memoqLink" placeholder="Value")
    .row
      .row__title Workflow:
      .row__value
        .drop
          SelectSingle(
            :selectedOption="selectedMemoqWorkflow"
            :options="['Translation & Revising', 'Translation Only']"
            placeholder="Option"
            @chooseOption="setMemoqWorkflow"
          )
    .row
      .row__title Industry:
      .row__value
        .drop
          SelectSingle(
            :hasSearch="true"
            placeholder="Option"
            :selectedOption="project.selectedIndustry.name || ''"
            :options="industries.map(i => i.name)"
            @chooseOption="setIndustry"
          )
    .create-btn
      Button(
        :isDisabled="isRequestNow || isDisableSubmitButton"
        value="Submit"
        @clicked="createProject"
      )
</template>

<script>
import SelectSingle from "../../SelectSingle"
import DatePicker from 'vue2-datepicker'
import '../../../assets/scss/datepicker.scss'
import { mapActions } from "vuex"
import Button from "../../Button"

export default {
  name: "Memoq",
  props: [ 'clients', "industries", 'user', 'extraOptions' ],
  data() {
    return {
      memoqLink: '',
      selectedMemoqWorkflow: '',
      project: {
        selectedIndustry: {}
      },
      isRequestNow: false
    }
  },
  methods: {
    ...mapActions([ "alertToggle" ]),
    setMemoqWorkflow({ option }) {
      this.selectedMemoqWorkflow = option
    },
    setIndustry({ option }) {
      this.project.selectedIndustry = this.industries.find(i => i.name === option)
      this.project = {
        ...this.project,
        ...this.extraOptions
      }
    },
    async createProject() {
      this.project.industry = this.project.selectedIndustry._id
      this.isRequestNow = true
      const result = await this.$http.post("/pm-manage/new-project-from-memoq", {
        project: this.project,
        memoqLink: this.memoqLink,
        selectedMemoqWorkflow: this.selectedMemoqWorkflow,
        user: this.user
      })
      const { data } = result
      if (data.status === 'success') {
        await this.$router.push(`/pangea-projects/draft-projects/Draft/details/${ data.data._id }`)
        this.alertToggle({ message: "New Project has been created", isShow: true, type: "success" })
        this.isRequestNow = false
      } else {
        this.alertToggle({ ...data, type: data.status, isShow: true })
        this.isRequestNow = false
      }
    }
  },
  computed: {
    isDisableSubmitButton() {
      return !this.memoqLink.trim() || !this.project.selectedIndustry.name || !this.selectedMemoqWorkflow
    }
  },
  components: { Button, SelectSingle, DatePicker }
}
</script>


<style lang="scss" scoped>
@import "../../../assets/scss/colors";

.row {
  display: flex;
  align-items: center;
  height: 32px;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0px;
  }

  &__title {
    width: 100px;
    margin-right: 20px;
  }

  &__value {
    min-width: 220px;
  }
}

.drop {
  height: 32px;
  position: relative;
  width: 220px;
  background-color: white;
  border-radius: 2px;
}

.create-btn {
  margin-top: 25px;
  display: flex;
  justify-content: center;
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
  transition: .1s ease-out;
  width: 220px;
  font-family: 'Myriad400';

  &:focus {
    border: 1px solid $border-focus;
  }
}
</style>