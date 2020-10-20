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
      .button(@click="save") Confirm
      .button(@click="close") Cancel

</template>

<script>
	export default {
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
						.findIndex(item => JSON.stringify(item) === JSON.stringify(this.languagesArr[index]));

				if(position !== -1) {
					this.approveArray.splice(position, 1);
				} else {
					this.approveArray.push(this.languagesArr[index]);
				}
			}
		},

	}
</script>

<style lang="scss" scoped>

  .language {
    background: #fff;
    box-shadow: 0 0 10px rgba(103, 87, 62, 0.7);
    width: 360px;
    padding: 20px;

    &__pairs {
      line-height: 30px;
    }

    &__row {
      min-height: 30px;
      display: flex;
    }

    &__title {
      font-size: 22px;
      border-bottom: 1px solid #68573e;
      margin-bottom: 20px;
    }

    &__buttons {
      margin-top: 20px;
      display: flex;
      justify-content: space-between;
    }
  }

  .button {
    height: 31px;
    color: #fff;
    font-size: 14px;
    border-radius: 10px;
    box-shadow: 0 3px 5px rgba(103, 87, 62, .5);
    background-color: #d15f45;
    border: 1px solid #d15f45;
    cursor: pointer;
    outline: none;
    padding: 0 50px;
    line-height: 31px;
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

  .language-row {
    width: 0;
  }
</style>