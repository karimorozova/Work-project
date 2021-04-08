<template lang="pug">
  .general-info
    .title General Information
    .block-items
      .block-item
        label.block-item__label Status:
          span.require *
        .block-item__drop.block-item_maxhigh-index(:class="{'general-info_error-shadow': isSaveClicked && !currentClientOverallData.status}")
          ClientStatusSelect(:selectedStatus="currentClientOverallData.status" @chosenStatus="setStatus")
      .block-item
        label.block-item__label Test:
        .block-item__check-item.checkbox
          input(type="checkbox" id="test" :checked="currentClient.isTest" @change="setTest")
          label(for="test")
      .block-item
        label.block-item__label Account Manager:
          span.require *
        .block-item__drop.block-item_high-index(:class="{'general-info_error-shadow': isSaveClicked && !currentClientOverallData.accountManager}")
          AMSelect(:selectedManager="currentClientOverallData.accountManager" @chosenManager="(manager) => setManager(manager, 'accountManager')"  group="Account Managers")
      //.block-item
        label.block-item__label Sales Manager:
          span.require *
        .block-item__drop.block-item_medium-index(:class="{'general-info_error-shadow': isSaveClicked && !currentClientOverallData.salesManager}")
          AMSelect(:selectedManager="currentClientOverallData.salesManager" @chosenManager="(manager) => setManager(manager, 'salesManager')" group="Sales")
      .block-item
        label.block-item__label Project Manager:
          span.require *
        .block-item__drop(:class="{'general-info_error-shadow': isSaveClicked && !currentClientOverallData.projectManager}")
          AMSelect(:selectedManager="currentClientOverallData.projectManager" @chosenManager="(manager) => setManager(manager, 'projectManager')"  group="Project Managers")
</template>

<script>
	import ClientStatusSelect from "../ClientStatusSelect"
	import { mapGetters, mapActions } from "vuex"
	import AMSelect from "../AMSelect"

	export default {
		props: {
			isSaveClicked: { type: Boolean }
		},
		data() {
			return {}
		},
		methods: {
			...mapActions([ "storeClientPropertyOverallData", "updateClientStatus", "alertToggle" ]),
			async setTest(event) {
				const client = {
					id: this.currentClient._id,
					isTest: event.target.checked
				}
				try {
					await this.updateClientStatus(client)
					this.alertToggle({
						message: "Client status updated",
						isShow: true,
						type: "success"
					})
				} catch (err) {
					this.alertToggle({
						message: "Server error / Cannot update Client status",
						isShow: true,
						type: "error"
					})
				}
			},
			setStatus({ status }) {
				this.storeClientPropertyOverallData({ prop: "status", value: status })
			},
			setManager({ manager }, prop) {
				this.storeClientPropertyOverallData({ prop, value: manager })
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient",
				currentClientOverallData: "currentClientOverallData"
			})
		},
		components: {
			ClientStatusSelect,
			AMSelect
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .block-items {
    padding: 10px;
    border: 1px solid #e8e8e8;
  }

  .title {
    font-size: 18px;
    margin-bottom: 5px;
  }

  .general-info {

    .block-item {
      display: flex;
      height: 45px;
      align-items: center;
      position: relative;

      &__last {
        height: 30px;
      }

      /*&_maxhigh-index {*/
      /*  z-index: 12;*/
      /*}*/

      &_high-index {
        z-index: 10;
      }

      &_medium-index {
        z-index: 8;
      }

      &__label {
        width: 160px;
        padding-top: 6px;
      }

      &__drop {
        position: relative;
        width: 190px;
        height: 30px;
      }
    }

    .require {
      font-size: 14px;
      color: red;
      margin-left: 2px;
    }

    #test {
      width: 0;
    }

    .checkbox {
      display: flex;
      height: 28px;

      input[type="checkbox"] {
        opacity: 0;

        + {
          label {
            &::after {
              content: none;
            }
          }
        }

        &:checked {
          + {
            label {
              &::after {
                content: "";
              }
            }
          }
        }
      }

      label {
        position: relative;
        display: inline-block;
        margin-top: 4px;

        &::before {
          position: absolute;
          content: "";
          display: inline-block;
          height: 16px;
          width: 16px;
          border: 1px solid;
          left: 0px;
          top: 3px;
        }

        &::after {
          position: absolute;
          content: "";
          display: inline-block;
          height: 5px;
          width: 9px;
          border-left: 2px solid;
          border-bottom: 2px solid;
          transform: rotate(-45deg);
          left: 4px;
          top: 7px;
        }
      }
    }
  }
</style>
