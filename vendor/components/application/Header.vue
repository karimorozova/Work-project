<template lang="pug">
  .header
    .header__logo
      a.header__link(href="https://www.pangea.global/")
        img.header__image(src="../../assets/images/new-logo.png")
    .header__background
      span.header__text {{ headerText }}
</template>

<script>

	export default {
		props: {
			headerText: {
				type: String
			}
		}
	}
</script>

<style lang="scss" scoped>

  .header {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;

    &__logo {
      width: 650px;
      margin: 5px 0;
      display: flex;
      justify-content: flex-start;
      @media all and (orientation: portrait) and (max-width: 767px) {
        width: auto;
      }

    }
  }

  .header__background {
    width: 100%;
    height: 251px;
    background-image: url('../../assets/images/pangea-header.jpg');
    background-size: cover;
    background-repeat: no-repeat;
    display: flex;
    justify-content: center;
    align-items: center;
    background-position: 100% 100%;
  }

  .header__text {
    width: 620px;
    font-size: 50px;
    color: white;
    font-family: Roboto600;
    text-shadow: 1px 1px 2px #666;
    @media all and (orientation: portrait) and (max-width: 767px) {
      /*flex-direction: column;*/
      font-size: 45px;
      width: auto;
    }
    @media all and (orientation: landscape) and (max-width: 1000px) {
      /*flex-direction: row;*/
    }
  }
</style>
