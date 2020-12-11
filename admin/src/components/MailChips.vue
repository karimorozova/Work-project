<template lang="pug">
  .container
    .mailBox
      .mailBox__to
        span To:
      .mailBox__mails
        .mailBox__chips(v-for="(item, index) in selectedEmails")
          .chips
            .chips__mail
              span {{item}}
            .chips__close(@click="deleteSelectedEmails(index)")
              span(class="close") &#10006;
        .mailBox__input
          input(
            type="text"
            ref="input"
            v-on:keyup.enter="addSelectedEmailByEnter"
            placeholder="Enter or choose an email address"
          )
    .selectBox(ref="option")
      .selectBox__container(v-if="isAllEmails && availableAllEmails.length")
        .selectBox__body
          .selectBox__option(v-for="(item, index) in availableAllEmails" @click="addSelectedEmails(index)" )
            .selectBox__option-icon  {{firstIconSymbol(item)}}
            .selectBox__option-text  {{item}}
</template>

<script>
	export default {
		props: {
			emails: {
				type: Array,
				default: []
			}
		},
		data() {
			return {
				isAllEmails: false,
				selectedEmails: [],
				allEmails: [],
			}
		},
		methods: {
			addSelectedEmailByEnter() {
				if(this.validEmail(this.$refs.input.value)) if(!this.selectedEmails.includes(this.$refs.input.value)) {
					this.selectedEmails.push(this.$refs.input.value);
					this.emailActions()
				}
				this.clearInput();
			},
			clearInput() {
				this.$refs.input.value = ''
			},
			firstIconSymbol(str) {
				return (str[0]).toUpperCase();
			},
			addSelectedEmails(index) {
				const selectedElem = this.availableAllEmails[index];
				this.selectedEmails.push(selectedElem);
				this.emailActions()
			},
			deleteSelectedEmails(index) {
				this.selectedEmails.splice(index, 1);
				this.emailActions()
			},
			closeOptions() {
				this.isAllEmails = false
			},
			openOptions() {
				this.isAllEmails = true
			},
			validEmail(email) {
				const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return re.test(email);
			},
			optionsClickOutside(e) {
				if(this.availableAllEmails.length) if(!this.$refs.option.contains(e.target) && this.$refs.input !== document.activeElement && e.target.className !== 'close') this.closeOptions();
			},
			emailActions() {
				this.$emit('emailAction', this.selectedEmails)
			},
		},
		computed: {
			availableAllEmails() {
				return this.allEmails.filter(item => this.validEmail(item)).filter(item => !this.selectedEmails.includes(item))
			}
		},
		beforeDestroy() {
			this.$refs.input.removeEventListener('focusin', () => true, false);
			document.removeEventListener('click', () => true, false)
		},
		created() {
			this.allEmails = this.emails;
		},
		mounted() {
			this.$refs.input.addEventListener('focusin', () => this.openOptions());
			document.addEventListener('click', (e) => this.optionsClickOutside(e))
		},
	}
</script>

<style lang="scss" scoped>
  .selectBox {
    margin: 10px 30px;
    color: #67573E;
    z-index: 5555;
    position: relative;

    &__container {
      position: absolute;
      background: white;
      width: 100%;
      z-index: 9000;
      border-radius: 5px;
    }

    &__body {
      border: 1px solid #67573E;
      border-radius: 5px;
      box-shadow: 0 10px 6px -6px #333;
      max-height: 260px;
      overflow-y: auto;
    }

    &__option {
      display: flex;
      margin: 5px 0;
      padding: 10px;
      font-weight: bold;
      cursor: pointer;
      transition: all .1s ease-out;

      &:hover {
        background: #DED3C7;
      }

      &-icon {
        height: 25px;
        width: 25px;
        background: #67573E;
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 27px;
      }

      &-text {
        font-size: 16px;
        margin-left: 10px;
        line-height: 25px;
        letter-spacing: .5px;
      }
    }
  }

  .mailBox {
    border-top: 1px solid #67573E;
    border-bottom: 1px solid #67573E;
    display: flex;
    color: #67573E;


    &__to {
      font-weight: bold;
      margin-top: 15px;
    }

    &__mails {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
      align-content: flex-start;
      align-items: flex-start;
    }

    &__input {
      margin-left: 10px;

      input {
        width: 230px;
        height: 50px;
        outline: none;
        border: none;
        color: #67573E;
        font-size: 14px;
      }

      input::placeholder {
        color: #D6CDC8;
        font-size: 14px;
      }
    }

    &__chips {
      padding: 5px 12px;
      margin-left: 10px;
      border: 1px solid #67573E;
      border-radius: 5px;
      min-height: 10px;
      margin-top: 10px;
      width: fit-content;
      cursor: default;

      .chips {
        display: flex;

        &__mail {
          font-size: 14px;
          line-height: 18px;
          color: #D6CDC8;
        }

        &__close {
          margin-left: 8px;
          line-height: 18px;
          font-size: 14px;
          cursor: pointer;
        }
      }
    }
  }
</style>