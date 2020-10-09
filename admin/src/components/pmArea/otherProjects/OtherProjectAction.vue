<template lang="pug">
  .project-action
    .drops
    .drops__item
      .drops__label Account Manager:
      .drops__menu
        input.drops__input(type="text" value="AM" disabled)
      //SelectSingle(
      //  :options="accManagers"
      //  :selectedOption="selectedAccManager"
      //  @chooseOption="(e) => setManager(e, 'accountManager')"
      //)
    .drops__item
      .drops__label Project Manager:
      .drops__menu
        input.drops__input(type="text" value="PM" disabled)
      //SelectSingle(
      //  :options="projManagers"
      //  :selectedOption="selectedProjManager"
      //  @chooseOption="(e) => setManager(e, 'projectManager')"
      //)

</template>

<script>
	import SelectSingle from "../../SelectSingle";
	import Button from "../../Button";
	import { mapActions } from "vuex";
	import ApproveModal from "../../ApproveModal";

	export default {
		props: {},
		data() {
			return {
				managers: [],
			};
		},
		methods: {
			// async setManager({ option }, prop) {
			// 	const manager = this.managers.find(
			// 			item => `${ item.firstName } ${ item.lastName }` === option
			// 	);
			// 	if(manager._id === this.project[prop]._id) return;
			// 	try {
			// 		if(this.type === "project") {
			// 			await this.setProjectValue({
			// 				id: this.project._id,
			// 				prop,
			// 				value: manager
			// 			});
			// 		} else {
			// 		}
			// 	} catch (err) {
			// 	}
			// },

			// async getManagers() {
			// 	try {
			// 		const result = await this.$http.get("/users");
			// 		this.managers = result.data;
			// 	} catch (err) {
			// 		this.alertToggle({
			// 			message: "Error on getting managers",
			// 			isShow: true,
			// 			type: "error"
			// 		});
			// 	}
			// },
			...mapActions({
				// setProjectValue: "setProjectValue",
				alertToggle: "alertToggle",
			})
		},
		computed: {

			// accManagers() {
			// 	let result = [];
			// 	if(this.managers.length) {
			// 		result = this.managers.filter(
			// 				item => item.group.name === "Account Managers"
			// 		);
			// 		result = result.map(item => `${ item.firstName } ${ item.lastName }`);
			// 	}
			// 	return result;
			// },
			// projManagers() {
			// 	let result = [];
			// 	if(this.managers.length) {
			// 		result = this.managers.filter(
			// 				item => item.group.name === "Project Managers"
			// 		);
			// 		result = result.map(item => `${ item.firstName } ${ item.lastName }`);
			// 	}
			// 	return result;
			// },
			// selectedAccManager() {
			// 	return this.project.accountManager
			// 			? this.project.accountManager.firstName +
			// 			" " +
			// 			this.project.accountManager.lastName
			// 			: "";
			// },
			// selectedProjManager() {
			// 	return this.project.projectManager
			// 			? this.project.projectManager.firstName +
			// 			" " +
			// 			this.project.projectManager.lastName
			// 			: "";
			// },
		},
		components: {
			ApproveModal,
			SelectSingle,
			Button
		},
		async created() {
			// this.getManagers();
		}
	};
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .project-action {
    padding: 20px;
    box-shadow: 0 0 10px #67573e9d;
    box-sizing: border-box;
    width: 390px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    .drops {
      width: 100%;
      position: relative;

      &__menu {
        position: relative;
        width: 190px;
        height: 30px;
      }

      &__input {
        width: 133px;
        height: 28px;
        border: 1px solid #68573E;
        border-radius: 5px;
        padding: 0 5px;
        color: #68573E;
        font-size: 14px;
        outline: none;
        padding-right: 30px;
      }

      &__item {
        @extend %item-style;
        width: 100%;
        justify-content: space-between;
      }

      &__text {
        font-size: 14px;
        font-weight: bolder;
      }

      &__label {
        position: relative;
        width: 160px;
      }

      &__assigned-icon {
        position: absolute;
        left: -18px;
        width: 15px;
      }
    }

    #sub-line {
      margin-top: 29px;
    }

    %item-style {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
  }
</style>
