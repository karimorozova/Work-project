<template lang="pug">
  .sales-info
    .lead-info
      label.lead-info__label.lead-info_relative Lead Source:
        Asterisk(:customStyle="{top: '-4px'}")
      .lead-info__menu(:class="{'sales-info_error-shadow': !client.leadSource && isEmpty}")
        SelectSingle(
          :options="leadsources",
          placeholder="Select",
          :selectedOption="client.leadSource",
          @chooseOption="chosenLeadsource"
        )
    .lead-info
      label.lead-info__label.lead-info_relative Lead Generator:
      .lead-info__menu
        SelectSingle(
          placeholder="Select"
          :hasSearch="true"
          :selectedOption="currentClient.hasOwnProperty('leadGeneration') ? currentClient.leadGeneration : leadGeneration"
          :options="['test','test2']"
          @chooseOption="setGenerator"
        )
</template>

<script>
	import SelectSingle from '../SelectSingle'
	import Asterisk from "../Asterisk"
	import { mapGetters, mapActions } from "vuex"

	export default {
		props: {
			client: {
				type: Object
			},
			isEmpty: {
				type: Boolean
			}
		},
		data() {
			return {
				leadGeneration: '',
				leadsources: []
			}
		},
		methods: {
			...mapActions({
				storeClientPropertyOverallData: "storeClientPropertyOverallData"
			}),
			chosenLeadsource({ option }) {
				this.$emit("setLeadSource", { option })
			},
			setGenerator({ option }) {
				this.leadGeneration = option
				this.storeClientPropertyOverallData({ prop: "leadGeneration", value: this.leadGeneration })
			},
			async getSources() {
				try {
					const result = await this.$http.get('/api/leadsources')
					this.leadsources = result.data.map(item => item.source)
				} catch (err) {
					console.log(err)
				}
			}
		},
		created() {
			this.getSources()
		},
		computed: {
			...mapGetters({
				currentClient: "currentClientOverallData"
			})
		},
		components: {
			Asterisk,
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>

  .sales-info {
    width: 40%;
    display: flex;
    flex-direction: column;

    &_error-shadow {
      box-shadow: 0 0 5px red;
      border-radius: 4px;
    }
  }

  .lead-info, .status-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &__label {
      margin-bottom: 0;
    }

    &_relative {
      position: relative;
    }

    &__data {
      display: flex;
      justify-content: flex-start;
      opacity: 0.4;
    }
  }

  .lead-info {
    height: 50px;

    &__menu {
      display: flex;
      justify-content: flex-start;
      position: relative;
      width: 190px;
      height: 30px;
    }

  }

</style>
