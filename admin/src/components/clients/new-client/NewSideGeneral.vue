<template lang="pug">
  .general-info
    .block-item
      label.block-item__label Status:
        span.require *
      .block-item__drop.block-item_maxhigh-index(:class="{'general-info_error-shadow': isSaveClicked && !client.status}")
        SelectSingle(
          :options="['Active', 'Inactive', 'Potential']",
          placeholder="Status",
          :selectedOption="clientStatus",
          @chooseOption="setStatus"
        )
    .block-item(v-if="clientType !== 'Individual'")
      label.block-item__label Payment Type:
        span.require *
      .block-item__drop(:class="{'general-info_error-shadow': isSaveClicked && !client.paymentType}")
        SelectSingle(
          :options="['PPP', 'Pre-Payment', 'Monthly', 'Custom']",
          placeholder="Payment Type",
          :selectedOption="client.paymentType",
          @chooseOption="setPaymentType"
        )
    .block-item
      label.block-item__label Account Manager:
        span.require *
      .block-item__drop.block-item_high-index(:class="{'general-info_error-shadow': isSaveClicked && !client.accountManager}")
        SelectSingle(
          placeholder="Option",
          :options="users.filter(i => i.group.name === 'Account Managers').map(i => `${i.firstName} ${i.lastName}`)",
          :selectedOption="getFullName(client.accountManager)",
          @chooseOption="(data) => setManager(data, 'accountManager')"
        )
    //.block-item
      label.block-item__label Sales Manager:
        span.require *
      .block-item__drop.block-item_medium-index(:class="{'general-info_error-shadow': isSaveClicked && !client.salesManager}")
        AMSelect(:selectedManager="client.salesManager" @chosenManager="(manager) => setManager(manager, 'salesManager')" group="Sales")
    .block-item
      label.block-item__label Project Manager:
        span.require *
      .block-item__drop(:class="{'general-info_error-shadow': isSaveClicked && !client.projectManager}")
        SelectSingle(
          placeholder="Option"
          :options="users.filter(i => i.group.name === 'Project Managers').map(i => `${i.firstName} ${i.lastName}`)"
          :selectedOption="getFullName(client.projectManager)"
          @chooseOption="(data) => setManager(data, 'projectManager')"
        )

    .block-item
      label.block-item__label Test:
      .block-item__check-item.checkbox
        input(type="checkbox" id="test" :checked="client.isTest" @change="setTest")
        label(for="test")
</template>

<script>
	import SelectSingle from "../../SelectSingle"
	import { mapGetters } from "vuex"

	export default {
		props: {
			client: {
				type: Object
			},
			isSaveClicked: {
				type: Boolean
			},
			clientType: {
				type: String
			}
		},
		data() {
			return {}
		},
		methods: {
			setManager({ option }, prop) {
				this.client[prop] = this.users.find(i => `${ i.firstName } ${ i.lastName }` === option)
			},
			setPaymentType({ option }) {
				this.$set(this.client, 'paymentType', option)
			},
			setTest() {
				this.client.isTest = event.target.checked
			},
			setStatus({ option }) {
				this.client.status = option
			},
			getFullName(manager) {
				return (`${ manager.firstName || "" } ${ manager.lastName || "" }`).trim()
			}
		},
		computed: {
			...mapGetters({
				users: "getUsers"
			}),
			clientStatus() {
				if (!this.client.status) {
					this.client.status = 'Potential'
				}
				return this.client.status
			}
		},
		components: {
			SelectSingle
		}
	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";

  .general-info {
    padding: 20px;

    &_error-shadow {
      box-shadow: 0 0 5px $red;
      height: 31px;
    }

    .block-item:last-child {
      height: 30px;
    }

    .block-item {
      display: flex;
      height: 50px;

      &__last {
        height: 30px;
      }

      &_maxhigh-index {
        z-index: 12;
      }

      &_high-index {
        z-index: 10;
      }

      &_medium-index {
        z-index: 8;
      }

      &__label {
        width: 130px;
        padding-top: 6px;
      }

      &__drop {
        position: relative;
        width: 220px;
        height: 32px;
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
