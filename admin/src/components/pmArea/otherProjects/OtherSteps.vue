<template lang="pug">
.steps
    .steps__table
        .steps__tabs
            Tabs(
                :tabs="tabs"
                selectedTab="Steps"
                @setTab="showTab"
            )
        DataTable(
            :fields="fields"
            :tableData="projectSteps"
            :activeIndex="activeIndex"
            :bodyClass="['steps-table-body', {'tbody_visible-overflow': projectSteps.length < 3}]"
            :tableheadRowClass="projectSteps.length < 3 ? 'tbody_visible-overflow' : ''"
            bodyCellClass="steps-table-cell"
            bodyRowClass="steps-table-row"
            v-if="project._id"
        )

            template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
                span.tasks__label {{ field.label }}

            template(slot="name" slot-scope="{ row }")
                span.steps__step-data.steps_no-padding {{ getStepName(row.DocumentAssignmentRole) }}
            template(slot="language" slot-scope="{ row, index }")
                span.steps__step-data {{ `${project.sourceLanguage.symbol} >> ${stepsTargetLanguages[index].symbol}` }}
            template(slot="vendor" slot-scope="{ row, index }")
                span.steps__step-data.steps_no-padding {{ row.UserInfoHeader.FullName }}
            template(slot="start" slot-scope="{ row, index }")
                 span.steps__step-data {{row.DocumentAssignmentRole == 0 || index === 0 ? formateDate(project.creationTime) : formateDate(projectSteps[index-1].DeadLine) }}
            template(slot="deadline" slot-scope="{ row, index }")
                 span.steps__step-data {{formateDate(row.DeadLine)}}
</template>

<script>
import DataTable from "../../DataTable";
import Tabs from "../../Tabs";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
  props: {
    project: {
      type: Object
    },
    projectSteps: {
      type: Array
    }
  },
  data() {
    return {
      tabs: ["Tasks", "Steps"],
      stepsTargetLanguages: [],
      fields: [
        {
          label: "Step",
          headerKey: "headerName",
          key: "name",
          width: "14%",
          padding: 0
        },
        {
          label: "Language",
          headerKey: "headerLanguage",
          key: "language",
          width: "14%"
        },
        {
          label: "Vendor name",
          headerKey: "headerVendor",
          key: "vendor",
          width: "14%",
          padding: 0
        },
        {
          label: "Start",
          headerKey: "headerStart",
          key: "start",
          width: "14%"
        },
        {
          label: "Deadline",
          headerKey: "headerDeadline",
          key: "deadline",
          width: "14%"
        },
        {
          label: "Receivables",
          headerKey: "headerReceivables",
          key: "receivables",
          width: "10%"
        },
        {
          label: "Payables",
          headerKey: "headerPayables",
          key: "payables",
          width: "10%"
        },
        {
          label: "Margin",
          headerKey: "headerMargin",
          key: "margin",
          width: "10%"
        }
      ]
    };
  },
  async created() {
    await this.createdListOfTargetLanguages();
  },
  methods: {
    formateDate: time => moment(time).format("DD-MM-YYYY"),
    getStepName: num => (num == 0 ? "Transtation" : "Revision"),
    createdListOfTargetLanguages() {
      let someArr = [];
      this.project.targetLanguages.forEach(element => {
        for (var i = 0; i < 2; i++) {
          someArr.push(element);
        }
      });
      return (this.stepsTargetLanguages = someArr);
    },
    showTab({ index }) {
      return this.tabs[index] === "Steps"
        ? true
        : this.$emit("showTab", { tab: this.tabs[index] });
    }
  },
  components: {
    DataTable,
    Tabs
  }
};
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.steps {
  display: flex;
  flex-direction: column;
  &__table {
    position: relative;
  }
  &__action {
    align-self: flex-end;
  }
  &__title {
    margin-bottom: 5px;
    font-size: 18px;
  }
  &__drop-menu {
    position: relative;
    width: 191px;
    height: 28px;
  }
  &__info {
    position: absolute;
    top: -300px;
    left: 10%;
    width: 80%;
    z-index: 50;
    background-color: $white;
    box-shadow: 0 0 10px $brown-shadow;
  }
  &__info-icon {
    cursor: pointer;
    display: flex;
    align-items: center;
    margin-left: 4px;
    i {
      color: $main-color;
      opacity: 0.7;
      transition: all 0.3s;
      &:hover {
        opacity: 1;
      }
    }
  }
  &__vendor-replace {
    position: relative;
    width: 20px;
    margin-right: 5px;
    box-sizing: border-box;
    &:hover {
      .steps__tooltip {
        display: block;
        z-index: 50;
      }
    }
  }
  &__replace-icon {
    max-width: 20px;
    cursor: pointer;
  }
  &__tooltip {
    text-align: center;
    width: 110px;
    position: absolute;
    right: 25px;
    top: 0;
    display: none;
    background-color: $white;
    color: $orange;
    box-sizing: border-box;
    padding: 3px;
    border-radius: 8px;
  }
  &__step-no-select {
    opacity: 0.7;
  }
  &_rotated {
    transform: rotate(180deg);
  }
  &__vendor-menu {
    position: relative;
    width: 100%;
    height: 29px;
  }
  &__reassignment {
    position: absolute;
    z-index: 100;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
  }
  &__approve-action {
    position: absolute;
    right: 0;
    z-index: 50;
    background-color: $white;
  }
  &__step-status {
    padding-left: 5px;
    max-height: 32px;
    overflow-y: auto;
  }
  &_no-padding {
    height: 100%;
    width: 100%;
    max-height: 30px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 5px;
    overflow-y: auto;
    overflow-y: hidden;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
