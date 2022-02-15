<template lang="pug">
  .assessment
    .assessment__item(v-for="(assessment, mainIndex) in arr")
      .assessment__languages
        span {{ assessment.sourceLanguage.lang }}
        span
          i(class="fas fa-angle-double-right")
        span {{ assessment.targetLanguage.lang }}

      .assessment__industry(v-for="(industryData, industryIndex) in assessment.industries")
        .assessment__industry-title {{ industryData.industry.name }}
        .assessment__table
          GeneralTable(
            :fields="fields"
            :tableData="industryData.steps"
          )
            template(v-for="field in fields" :slot="field.headerKey" slot-scope="{ field }")
              .table__header {{ field.label }}

            template(slot="step", slot-scope="{ row, index }")
              .table__data(v-if="row.step") {{ row.step.title }}

            template(slot="tqi", slot-scope="{ row, index }")
              .table__data(v-if="row.tqi.grade")
                span {{ row.tqi.grade }}
                span.icon(@click="download(row.tqi.path)")
                  i( class="fas fa-download")

            template(slot="lqa1", slot-scope="{ row, index }")
              .table__data(v-if="row.lqa1.grade")
                span {{ row.lqa1.grade }}
                span.icon(@click="download( row.lqa1.path)")
                  i( class="fas fa-download")

            template(slot="lqa2", slot-scope="{ row, index }")
              .table__data(v-if="row.lqa2.grade")
                span {{ row.lqa2.grade }}
                span.icon(@click="download(row.lqa2.path)")
                  i( class="fas fa-download")

            template(slot="lqa3", slot-scope="{ row, index }")
              .table__data(v-if="row.lqa3.grade")
                span {{ row.lqa3.grade }}
                span.icon(@click="download(row.lqa3.path)")
                  i( class="fas fa-download")
</template>

<script>

import GeneralTable from "../../../../../components/general/GeneralTable"

export default {
  props: [ 'arr' ],
  data() {
    return {
      fields: [
        {
          label: "Step",
          headerKey: "headerStep",
          key: "step",
          style: { width: "20%" }
        },
        {
          label: "TQI",
          headerKey: "headerTQI",
          key: "tqi",
          style: { width: "20%" }
        },
        {
          label: "LQA 1",
          headerKey: "headerLQA1",
          key: "lqa1",
          style: { width: "20%" }
        },
        {
          label: "LQA 2",
          headerKey: "headerLQA2",
          key: "lqa2",
          style: { width: "20%" }
        },
        {
          label: "LQA 3",
          headerKey: "headerLQA3",
          key: "lqa3",
          style: { width: "20%" }
        }
      ],
      domain: "http://localhost:3001"
    }
  },
  methods: {
    download({ path }) {
      let link = document.createElement('a')
      link.href = process.env.domain + path
      link.target = "_blank"
      link.click()
    }
  },
  components: {
    GeneralTable
  },
  mounted() {
    this.domain = process.env.domain
  }
}
</script>

<style lang="scss" scoped>
@import "../../../../../assets/scss/colors";

.assessment {
  &__languages {
    display: flex;
    gap: 10px;
    font-size: 14px;
    font-family: Roboto600;
    margin-top: 10px;
  }

  &__industry {
    &-title {
      margin: 5px 0;
    }
  }
}

.table {
  width: 100%;

  &__data {
    padding: 0 7px;
    display: flex;
    gap: 10px;
  }

  &__header {
    padding: 0 7px;
  }

  &__drop {
    position: relative;
    height: 32px;
    max-width: 220px;
    margin: 0 7px;
    width: 100%;
    background: white;
    border-radius: 4px;
  }

  &__icons {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    gap: 8px;
  }

  &__icon {
    cursor: pointer;
    opacity: 0.5;
  }

  &__opacity {
    opacity: 1;
  }

  &__input {
    width: 100%;
    padding: 0 7px;
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
  width: 100%;
  height: 32px;
  transition: .1s ease-out;

  &:focus {
    border: 1px solid $border-focus;
  }
}

.icon {
  font-size: 15px;
  cursor: pointer;
}
</style>