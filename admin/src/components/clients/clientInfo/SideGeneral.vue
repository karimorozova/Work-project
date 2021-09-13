<template lang="pug">
  .general-info
    .title General Information
    .block-items
      .block-item
        label.block-item__label Status:
          span.require *
        .block-item__drop.index-10(:class="{'general-info_error-shadow': isSaveClicked && !currentClientOverallData.status}")
          SelectSingle(
            :options="['Active', 'Inactive', 'Potential']",
            placeholder="Status",
            :selectedOption="currentClientOverallData.status",
            @chooseOption="setStatus"
          )
      .block-item
        label.block-item__label Payment Type:
          span.require *
        .block-item__drop(:class="{'general-info_error-shadow': isSaveClicked && !currentClientOverallData.paymentType}")
          SelectSingle(
            :options="['PPP', 'Pre-Payment', 'Monthly', 'Custom']",
            placeholder="Payment Type",
            :selectedOption="currentClientOverallData.paymentType",
            @chooseOption="setPaymentType"
          )
      .block-item
        label.block-item__label Test:
        .block-item__check-item.checkbox
          input(type="checkbox" id="test" :checked="currentClient.isTest" @change="setTest")
          label(for="test")
      .block-item
        label.block-item__label Account Manager:
          span.require *
        .block-item__drop.index-9(:class="{'general-info_error-shadow': isSaveClicked && !currentClientOverallData.accountManager}")
          SelectSingle(
            :options="users.filter(i => i.group.name === 'Account Managers').map(i => `${i.firstName} ${i.lastName}`)",
            placeholder="Select",
            :selectedOption="getFullName(currentClientOverallData.accountManager)",
            @chooseOption="(data) => setManager(data, 'accountManager')"
          )
      //.block-item
        label.block-item__label Sales Manager:
          span.require *
        .block-item__drop.block-item_medium-index(:class="{'general-info_error-shadow': isSaveClicked && !currentClientOverallData.salesManager}")
          AMSelect(:selectedManager="currentClientOverallData.salesManager" @chosenManager="(manager) => setManager(manager, 'salesManager')" group="Sales")
      .block-item
        label.block-item__label Project Manager:
          span.require *
        .block-item__drop.index-8(:class="{'general-info_error-shadow': isSaveClicked && !currentClientOverallData.projectManager}")
          SelectSingle(
            :options="users.filter(i => i.group.name === 'Project Managers').map(i => `${i.firstName} ${i.lastName}`)",
            placeholder="Select",
            :selectedOption="getFullName(currentClientOverallData.projectManager)",
            @chooseOption="(data) => setManager(data, 'projectManager')"
          )
</template>

<script>
	import { mapGetters, mapActions } from "vuex"
	import SelectSingle from "../../SelectSingle"

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
      setPaymentType({option}) {
        this.storeClientPropertyOverallData({prop: 'paymentType', value: option})
      },
			setStatus({ option }) {
				this.storeClientPropertyOverallData({ prop: "status", value: option })
			},
			setManager({ option }, prop) {
				this.storeClientPropertyOverallData({ prop, value: this.users.find(i => `${ i.firstName } ${ i.lastName }` === option) })
			},
			getFullName(manager) {
				return `${ manager.firstName || "" } ${ manager.lastName || "" }`
			}
		},
		computed: {
			...mapGetters({
				currentClient: "getCurrentClient",
				currentClientOverallData: "currentClientOverallData",
				users: "getUsers"
			})
		},
		components: {
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors.scss";

  .block-items {
    padding: 20px;
    border: 2px solid $light-border;
    border-radius: 4px;
  }

  .title {
    font-size: 16px;
    margin-bottom: 5px;
    letter-spacing: 0.2px;
  }

  .index-10 {
    z-index: 10;
  }

  .index-9 {
    z-index: 9;
  }

  .index-8 {
    z-index: 8;
  }

  .general-info {

    .block-item {
      display: flex;
      height: 45px;
      align-items: center;
      position: relative;

      &__last {
        height: 32px;
      }

      &__label {
        width: 130px;
        padding-top: 6px;
      }

      &__drop {
        position: relative;
        width: 220px;
        height: 32px;
        background-color: white;
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
          border: 1px solid #c1bbb1;
          left: 0px;
          top: 3px;
          background: white;
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
