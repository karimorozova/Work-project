<template lang="pug">
.social
    ul.social__list
        li.social__item(v-for="social in socialsArray")
            a.social__link(:href="social.url")
                img.social__image(:src="social.image")
</template>

<script>
export default {
    data() {
        return {
            socialsArray: [
                {url: 'https://www.facebook.com/PangeaLocalizationServices/', image: require('../assets/images/social/facebook.png')},
                {url: 'https://www.linkedin.com/company/pangea-language-service', image: require('../assets/images/social/linkedin.png')},
                {url: 'https://twitter.com/Pangea_Local', image: require('../assets/images/social/twitter.png')},
                {url: 'https://www.youtube.com/channel/UCKlcUH-8dbg7eZy-nZyDREw', image: require('../assets/images/social/youtube.png')},
                {url: 'https://www.instagram.com/pangea_local/', image: require('../assets/images/social/instagram.png')},
                {url: 'https://www.pinterest.com/pangealocalizat/', image: require('../assets/images/social/pinterest.png')}
            ]
        }
    }
}
</script>

<style lang="scss" scoped>

.social {
    display: inline;
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 0 10px;
    &__list {
        padding-left: 0;
    }
    &__item {
        display: inline;
        list-style: none;
    }
    &__link {
        text-decoration: none;
    }
    &__image {
        margin: 5px;
        @media (max-width: 400px) {
            width: 31px;
        }
    }
}

</style>
