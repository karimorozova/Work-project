<template lang="pug">
  .component
    .component__title Receivables
    .component__table-group
      .component__content
        GeneralTable(
          :fields="fieldsForDay"
          :tableData="xtrfStats.today"
          :isBodyShort="true"
        )
          template(v-for="field in fieldsForDay" :slot="field.headerKey" slot-scope="{ field }")
            .table__header {{ field.label }}

          template(slot="name" slot-scope="{ row, index }")
            .table__data {{ row.name }}

          template(slot="value" slot-scope="{ row, index }")
            .table__data
              span(v-if="index !== 2 " style="color: #999;") &#36;
              span(v-else  style="color: #999;") &#128;
              span {{ normalizeValue( row.value )}}

      .component__content
        GeneralTable(
          :fields="fieldsForMonth"
          :tableData="xtrfStats.month"
          :isBodyShort="true"
        )
          template(v-for="field in fieldsForMonth" :slot="field.headerKey" slot-scope="{ field }")
            .table__header {{ field.label }}

          template(slot="name" slot-scope="{ row, index }")
            .table__data {{ row.name }}

          template(slot="value" slot-scope="{ row, index }")
            .table__data
              span(v-if="index !== 2 " style="color: #999;") &#36;
              span(v-else  style="color: #999;") &#128;
              span {{ normalizeValue( row.value )}}


</template>

<script>
	import GeneralTable from '../../GeneralTable'

	export default {
		props: {
      xtrfStats: {
				type: Object,
			}
		},
		data() {
			return {
        fieldsForDay: [
					{
						label: "Today",
						headerKey: "headerName",
						key: "name",
						style: { "width": "50%" }
					},
					{
						label: "",
						headerKey: "headerValue",
						key: "value",
						style: { "width": "50%" }
					},
				],
        fieldsForMonth: [
          {
            label: "Month",
            headerKey: "headerName",
            key: "name",
            style: { "width": "50%" }
          },
          {
            label: "",
            headerKey: "headerValue",
            key: "value",
            style: { "width": "50%" }
          },
        ]
			}
		},
		methods: {
      normalizeValue(value) {
        return parseFloat(value).toFixed(2)
      }
		},
		components: {
			GeneralTable
		}
	}
</script>

<style scoped lang="scss">
  @import "../../../assets/scss/colors";

  .component {
    &__title {
      position: absolute;
      top: 17px;
      font-size: 18px;
      font-family: 'Myriad600';
    }
    &__content{
      margin-top: 40px;
      width: 48%;
    }
    &__table-group {
      display: flex;
      justify-content: space-between;
    }
  }

  a {
    color: $text;
    text-decoration: none;
    transition: .2s ease-out;

    &:hover {
      text-decoration: underline;
    }
  }

  .table {
    &__header {
      padding: 0 0 0 6px;
    }

    &__data {
      padding: 0 6px;
      width: 100%;
      display: flex;
      gap: 4px;
    }
  }
</style>