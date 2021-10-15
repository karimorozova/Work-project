<template lang="pug">
  .language
    .language__title New Languages Pairs:
    .language__modal
      .language__row(v-for="(item, index) in languagesArr")
        .checkbox(@click.stop="")
          input(type="checkbox" class="language-row" :id="'language-row' + (index + 1)" :checked="false" @click="approveLanguagesPairs(index)")
          label(:for="'language-row' + (index + 1)")
        .language__pairs {{ item.source.lang }} >> {{ item.target.lang }}
    .language__buttons
      Button(value="Confirm"  @clicked="save")
      Button(value="Cancel" @clicked="close")

</template>

<script>
	import Button from "../../Button"

	export default {
		components: { Button },
		props: {
			languagesArr: {
				type: Array
			}
		},
		data() {
			return {
				approveArray: []
			}
		},
		methods: {
			save() {
				this.$emit('savePairs', this.approveArray)
			},
			close() {
				this.$emit('closePairs')
			},
			approveLanguagesPairs(index) {
				const position = this.approveArray
						.findIndex(item => JSON.stringify(item) === JSON.stringify(this.languagesArr[index]))

				if (position !== -1) {
					this.approveArray.splice(position, 1)
				} else {
					this.approveArray.push(this.languagesArr[index])
				}
			}
		}

	}
</script>

<style lang="scss" scoped>
  @import "../../../assets/scss/colors";
  .language {
    background: #fff;
    box-shadow: $box-shadow;
    width: 350px;
    padding: 20px;

    &__pairs {
      line-height: 30px;
    }

    &__row {
      min-height: 30px;
      display: flex;
    }

    &__title {
      font-size: 21px;
      font-family: Myriad600;
      margin-bottom: 20px;
    }

    &__buttons {
      margin-top: 20px;
      display: flex;
      justify-content: space-evenly;
    }
  }

  .checkbox {
    display: flex;
    margin-top: 3px;
    margin-right: 10px;

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
      padding-left: 22px;
      padding-top: 4px;

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

  .language-row {
    width: 0;
  }
</style>