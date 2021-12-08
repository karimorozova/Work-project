<template lang="pug">
  .delivery
    .delivery__title Deliverables:
    .delivery__table
      GeneralTable(
        :fields="fields"
        :tableData="deliverables"
        :isBodyShort="true"
      )

        template(v-for="field in fields", :slot="field.headerKey", slot-scope="{ field }")
          .table__header {{ field.label }}


        .table__data(slot="ID" slot-scope="{ row }") {{row.deliveryInternalId}}
        .table__data(slot="at" slot-scope="{ row }") {{ getDeliveryTime(row) }}
        .table__dataTooltip(slot="pair" slot-scope="{ row }")
          .tooltip
            .tooltip-data(v-html="row.languagePair")
            i(class="fas fa-info")

        .table__data(slot="file" slot-scope="{ row }") {{row.filesLength}}
        .table__dataTooltip(slot="icon" slot-scope="{row}")
          .table__downloadIcon(@click="download(row)")
            i.fas.fa-download



        //.table__data(slot="action" slot-scope="{ row, index }")
          //.table__icons(v-if="row.status === 'Ready for Delivery' && canUpdateDr2")
            .table__icon(@click="openContactsModalOne(row)")
              i.fas.fa-truck-loading

          //.table__icons(v-if="row.status !== 'Ready for Delivery'")
            img.table__icon(v-for="(icon, key) in getIcons(row)" :src="icon.src" @click="dr2Action(row, key)")

</template>

<script>
import moment from "moment"
import DataTable from "./Tables/DataTable"
import { mapActions, mapGetters } from "vuex"
import GeneralTable from "./pangea/GeneralTable"

export default {
  props: {
    project: {
      type: Object
    }
  },
  data() {
    return {
      fields: [
        { label: "ID", headerKey: "headerID", key: "ID", style: { width: "30%" } },
        { label: "Delivered", headerKey: "headerAT", key: "at", style: { width: "28%" } },
        { label: "Files", headerKey: "headerFile", key: "file", style: { width: "14%" } },
        { label: "Languages", headerKey: "headerPair", key: "pair", style: { width: "14%" } },
        { label: "", headerKey: "headerAction", key: "icon", style: { width: "14%" } }
      ]
    }
  },
  methods: {
    ...mapActions({
      getLanguages: "getLanguages"
    }),
    download({ path }) {
      let link = document.createElement('a')
      link.href = process.env.domain + path
      link.target = "_blank"
      link.click()
    },
    getDeliveryTime({ deliveredAt }) {
      return moment(deliveredAt).format('MMM D, HH:mm')
    }
  },
  computed: {
    ...mapGetters({
      allLanguages: "allLanguages"
    }),
    deliverables() {
      if (!this.allLanguages.length) return []
      const { tasksDR2: { singleLang, multiLang }, tasksDeliverables } = this.project

      return tasksDeliverables.map(item => {
        const allDR2 = [ ...singleLang, ...multiLang ]
        const currentDelivery = allDR2.find(({ _id }) => `${ _id }` === `${ item.deliverablesId }`)
        if (!currentDelivery) return false

        let languagePair = ''
        if (currentDelivery.hasOwnProperty('sourceLanguage') && currentDelivery.hasOwnProperty('targetLanguage')) {
          const source = this.allLanguages.find(({ _id }) => `${ _id }` === `${ currentDelivery.sourceLanguage }`)
          const target = this.allLanguages.find(({ _id }) => `${ _id }` === `${ currentDelivery.targetLanguage }`)
          languagePair = `<span>${ source.symbol }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;">>></span><span>${ target.symbol }</span>`
        } else {
          languagePair = currentDelivery.tasks.reduce((acc, curr) => {
            const task = this.project.tasks.find(i => i.taskId === curr)
            if (task) acc = acc + `<span>${ task.sourceLanguage }</span><span style="font-size: 12px;color: #9c9c9c;margin: 0 4px;">>></span><span>${ task.targetLanguage }</span><br>`
            return acc
          }, '')
        }
        return {
          deliveredAt: item.deliveredAt,
          path: item.path,
          deliveryInternalId: currentDelivery.deliveryInternalId,
          languagePair,
          filesLength: currentDelivery.hasOwnProperty('files') ? currentDelivery.files.length : currentDelivery.file.length
        }
      }).filter(Boolean)

    }
  },
  mounted() {
    this.getLanguages()
  },
  components: {
    GeneralTable,
    DataTable
  }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors";

.delivery {
  &__title {
    font-size: 14px;
    margin: 18px 0;
    font-family: Myriad600;
  }
}

//.table {
//  &__dataIcon {
//    display: flex;
//    justify-content: space-evenly;
//  }
//
//  &__downloadIcon {
//    cursor: pointer;
//  }
//}


.table {
  &__header {
    padding: 0 0 0 7px;
  }

  &__data {
    padding: 0 7px;
    width: 100%;
  }

  &__actions {
    justify-content: center;
  }

  &__icons {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }

  &__statusAndProgress {
    width: 100%;
    padding: 0 7px;
  }

  &__dataTooltip {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  &__downloadIcon {
    cursor: pointer;
  }
}

.tooltip {
  position: relative;
  display: flex;
  cursor: help;
  text-align: center;

  &-data {
    visibility: hidden;
    font-size: 14px;
    max-width: 280px;
    min-width: 140px;
    background: white;
    border-radius: 4px;
    right: 15px;
    top: -7px;
    padding: 8px 8px 6px 8px;
    position: absolute;
    z-index: 555;
    opacity: 0;
    transition: opacity .3s;
    border: 1px solid $text;
    color: $text;

    &::after {
      content: "";
      position: absolute;
      top: 8px;
      right: -12px;
      transform: rotate(270deg);
      border-width: 6px;
      border-style: solid;
      border-color: $text transparent transparent;
    }
  }

  &:hover {
    .tooltip-data {
      visibility: visible;
      opacity: 1;
    }
  }
}
</style>