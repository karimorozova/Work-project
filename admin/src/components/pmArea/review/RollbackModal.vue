<template lang="pug">
  .rollback
    .rollback__text
      div Are you sure you want to rollback the Delivery Review ?
      div to:
        span.bold &nbsp; {{ selectedManager }}

    .rollback__menu
      SelectSingle(
        :options="managersNames"
        :selectedOption="selectedManager"
        @chooseOption="setManager"
      )
    .rollback__buttons
      .rollback__button
        Button(value="Yes" @clicked="rollback")
      .rollback__button
        Button(value="Cancel" @clicked="close")
</template>

<script>
	import SelectSingle from "@/components/SelectSingle"
	import Button from "@/components/Button"
	import reviewManagers from "@/mixins/reviewManagers"

	export default {
		mixins: [ reviewManagers ],
		props: {
			manager: { type: Object }
		},
		data() {
			return {
				managers: []
			}
		},
		methods: {
			close() {
				this.$emit("close")
			},
			setManager({ option }) {
				const managerIndex = this.managersNames.indexOf(option)
				this.$emit("setRollbackManager", { manager: this.managers[managerIndex] })
			},
			rollback() {
				this.$emit("rollBack")
			}
		},
		computed: {
			selectedManager() {
				return this.manager ? `${ this.manager.firstName } ${ this.manager.lastName }` : ""
			}
		},
		components: {
			SelectSingle,
			Button
		},
		mounted() {
			this.getManagers()
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .rollback {
    display: flex;
    align-items: center;
    flex-direction: column;
    background-color: $white;
    box-shadow: $box-shadow;
    box-sizing: border-box;
    padding: 20px;
    width: 500px;

    &__text {
      font-size: 16px;
      text-align: center;
    }

    &__menu {
      position: relative;
      height: 32px;
      width: 220px;
      margin: 20px 0;
    }

    &__buttons {
      display: flex;
      justify-content: center;
    }

    &__button {
      margin: 0 10px;
    }
  }

  .bold {
    font-family: 'Myriad600'
  }

</style>
