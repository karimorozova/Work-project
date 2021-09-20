<template lang="pug">
  .delivery
    DataTable(
      :fields="fields"
      :tableData="deliverables"
      :bodyClass="['review-body', {'tbody_visible-overflow': deliverables.length < 6}]"
      :tableheadRowClass="deliverables.length < 6 ? 'tbody_visible-overflow' : ''"
      :headCellClass="'padding-with-check-box'"
    )

      .deliverables-table__header(slot="headerID" slot-scope="{ field }") {{ field.label }}
      .deliverables-table__header(slot="headerPair" slot-scope="{ field }") {{ field.label }}
      .deliverables-table__header(slot="headerFile" slot-scope="{ field }") {{ field.label }}
      .deliverables-table__header(slot="headerAction" slot-scope="{ field }") {{ field.label }}


      .deliverables-table__data(slot="ID" slot-scope="{ row }") {{row.deliveryInternalId}}
      .deliverables-table__data(slot="pair" slot-scope="{ row }") {{row.languagePair}}
      .deliverables-table__data(slot="file" slot-scope="{ row }") {{row.filesLength}}
      .deliverables-table__dataIcon(slot="icon" slot-scope="{row}")
        .tooltip
          span#myTooltip2.tooltiptext-left(v-html="getDeliveryTime(row)")
          i.far.fa-clock
        .deliverables-table__downloadIcon(@click="download(row)")
          i.fas.fa-download



      //.deliverables-table__data(slot="action" slot-scope="{ row, index }")
        //.deliverables-table__icons(v-if="row.status === 'Ready for Delivery' && canUpdateDr2")
          .deliverables-table__icon(@click="openContactsModalOne(row)")
            i.fas.fa-truck-loading

        //.deliverables-table__icons(v-if="row.status !== 'Ready for Delivery'")
          img.deliverables-table__icon(v-for="(icon, key) in getIcons(row)" :src="icon.src" @click="dr2Action(row, key)")
  
</template>

<script>
import moment from "moment"
import DataTable from "./Tables/DataTable"
import { mapGetters } from "vuex"
export default {
	props: {
		project: {
			type: Object,
		}
	},
	data() {
		return {
			fields: [
				{ label: "ID", headerKey: "headerID", key: "ID", width: "37%" },
				{ label: "Language pair", headerKey: "headerPair", key: "pair", width: "37%" },
				{ label: "# Files", headerKey: "headerFile", key: "file", width: "13%" },
				{ label: "Delivery", headerKey: "headerAction", key: "icon", width: "13%" },
			],
		}
	},
	methods: {
		download({path}){
      let link = document.createElement('a')
      link.href = process.env.domain + path
      link.target = "_blank"
      link.click()
    },
		getDeliveryTime({deliveredAt}) {
			return `At: ${moment(deliveredAt).format('DD-MM-YYYY, HH:mm')}`
		},
	},
	computed: {
		...mapGetters({
        allLanguages: "allLanguages"
    }),
		deliverables() {
			const { tasksDR2: {singleLang, multiLang}, tasksDeliverables } = this.project
      return tasksDeliverables.map(item => {
      	const allDR2 = [...singleLang, ...multiLang ]
	        const currentDelivery = allDR2.find(({_id}) => `${_id}` === `${item.deliverablesId}`)
          if(!currentDelivery) return false
          const languagePair = currentDelivery.hasOwnProperty('sourceLanguage') ?
              `${this.allLanguages.find(({_id}) => `${_id}` === `${currentDelivery.sourceLanguage}`).symbol} >> ${this.allLanguages.find(({_id}) => `${_id}` === `${currentDelivery.targetLanguage}`).symbol}` :
              'Multilingual'
          const filesLength = currentDelivery.hasOwnProperty('file') ? '1' : currentDelivery.files.length

	        return {
		        deliveredAt: item.deliveredAt,
            path: item.path,
		        deliveryInternalId: currentDelivery.deliveryInternalId,
		        languagePair,
		        filesLength
          }
      }).filter(Boolean)
		}
	},
	components: {
		DataTable
	}
}
</script>

<style lang="scss" scoped>
  .deliverables-table{
    &__dataIcon{
      display: flex;
      justify-content: space-evenly;
    }
    &__downloadIcon{
      cursor: pointer;
    }
  }
  .tooltip {
    position: relative;
    display: flex;
    font-size: 16px;
    margin-right: 5px;
    cursor: help;

    .tooltiptext-left {
      font-size: 14px;
      visibility: hidden;
      width: 220px;
      background-color: #67573e;
      color: #fff;
      text-align: center;
      border-radius: 4px;
      padding: 5px;
      position: absolute;
      z-index: 1;
      right: 38px;
      opacity: 0;
      top: -5px;
      transition: opacity .3s;

      &::after {
        content: "";
        position: absolute;
        top: 8px;
        right: -10px;
        margin-left: -10px;
        transform: rotate(270deg);
        border-width: 5px;
        border-style: solid;
        border-color: #67573e transparent transparent;
      }
    }

    &:hover {
      .tooltiptext-left {
        visibility: visible;
        opacity: 1;
      }
    }
  }
</style>