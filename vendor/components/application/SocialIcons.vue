<template lang="pug">
  .social
    .social__item(v-for="social in socialsArray" :style="{backgroundImage: `url('${social.image}')`}")
      a.social__link(:href="social.url")
</template>

<script>
export default {
  data() {
    return {
      socialsArray: [
        { url: 'https://www.facebook.com/PangeaLocalizationServices/', image: require('../../assets/images/social/facebook.png') },
        { url: 'https://www.linkedin.com/company/pangea-language-service', image: require('../../assets/images/social/linkedin.png') },
        { url: 'https://twitter.com/Pangea_Local', image: require('../../assets/images/social/twitter.png') },
        { url: 'https://www.youtube.com/channel/UCKlcUH-8dbg7eZy-nZyDREw', image: require('../../assets/images/social/youtube.png') },
        { url: 'https://www.instagram.com/pangea_global/', image: require('../../assets/images/social/instagram.png') },
        { url: 'https://www.pinterest.com/pangealocalizat/', image: require('../../assets/images/social/pinterest.png') }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>

.social {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -27px;
  padding-bottom: 10px;

  &__list {
    padding-left: 0;
  }

  &__item {
    background-position: -7px -7px;
    border-radius: 50%;
    margin: 5px;
  }

  &__link {
    text-decoration: none;
    width: 28px;
    height: 28px;
    display: block;
  }

  &__image {
    margin: 5px;
  }
}

</style>
