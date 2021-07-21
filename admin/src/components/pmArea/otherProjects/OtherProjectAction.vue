<template lang="pug">
  .project-action
    .drops
    .drops__item
      .drops__label Update project:
      .drops__menu
        .drops__refresh-button(@click="refreshProject")
          img(src="../../../assets/images/refresh-icon.png")

    .drops__item
      .drops__label Account Manager:
      .drops__menu
        input.drops__input(
          type="text"
          :value="project.accountManager !== null && project.hasOwnProperty('accountManager') ? `${project.accountManager.firstName} ${project.accountManager.lastName}` : ''"
          disabled
        )
    .drops__item
      .drops__label Project Manager:
      .drops__menu
        input.drops__input(
          type="text"
          :value="project.projectManager !== null && project.hasOwnProperty('projectManager') ? `${project.projectManager.firstName} ${project.accountManager.lastName}` : ''"
          disabled
        )

</template>

<script>
	import SelectSingle from "../../SelectSingle"
	import Button from "../../Button"
	import { mapActions } from "vuex"
	import ApproveModal from "../../ApproveModal"

	export default {
		props: {
			project: {
				type: Object
			}
		},
		data() {
			return {
				managers: []
			}
		},
		methods: {
			async refreshProject() {
				try {
					const result = await this.$http.post('/memoqapi/update-memoq-finance', {
						id: this.project._id
					})
					this.$emit('refreshCurrProject', result.data)
				} catch (err) {
					this.alertToggle({
						message: "Server Error / Cannot update Project",
						isShow: true,
						type: "error"
					})
				} finally {
					this.alertToggle({
						message: "Project update",
						isShow: true,
						type: "success"
					})
				}
			},
			...mapActions({
				alertToggle: "alertToggle"
			})
		},
		components: {
			ApproveModal,
			SelectSingle,
			Button
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .project-action {
    padding: 20px;
    box-shadow: rgba(99, 99, 99, 0.3) 0px 1px 2px 0px, rgba(99, 99, 99, 0.15) 0px 1px 3px 1px;
    box-sizing: border-box;
    width: 390px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    border-radius: 4px;
    background: white;

    .drops {
      width: 100%;
      position: relative;

      &__refresh-button {
        width: 20px;
        cursor: pointer;
        margin-top: 5px;
        height: 20px;

        img {
          width: 100%;
        }
      }

      &__menu {
        position: relative;
        width: 220px;
        height: 32px;
      }

      &__input {
        width: 133px;
        height: 28px;
        border: 1px solid $border;
        border-radius: 4px;
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
