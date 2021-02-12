<template lang="pug">
  .alert-message
    .alet-message__icon(v-if="type === 'error'")
      i.icon.fa.fa-exclamation(aria-hidden='true')
    .alet-message__icon(v-else)
      i.icon.fa.fa-check(aria-hidden='true')
    .alert-message__text(:class="[type === 'error' ? 'alert-message_error' : 'alert-message_success']") {{ text }}
</template>

<script>
	export default {
		props: {
			text: {
				type: String
			},
			type: {
				type: String
			}
		}
	}
</script>

<style lang="scss" scoped>
  @import '../assets/scss/colors.scss';

  .alert-message {
    display: flex;
    align-items: center;
    position: fixed;
    z-index: 100;
    right: 20px;
    top: 80px;
    max-width: 250px;
    padding: 30px 40px;
    box-shadow: rgba(103, 87, 62, 0.3) 0px 2px 5px, rgba(103, 87, 62, 0.15) 0px 2px 6px 2px;
    background-color: $white;

    &_error {
      position: relative;
      color: $orange;
    }

    &_success {
      position: relative;
      color: $green-approve;
    }
  }

  .fa-exclamation {
    color: $orange;
  }

  .fa-check {
    color: $green-approve;
  }

  .icon {
    font-size: 18px;
    margin-right: 10px;
  }
</style>
