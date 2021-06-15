<template lang="pug">
    .help-info(:class="{'help-info_block': isHelpInfo}")
        .help-info__contacts-link
            .help-info__title NEED HELP?
            .help-info__help-message
                p.help-info__text Having problems submitting a form? <br> Access our
                    a.help-info__link(href="https://www.pangea.global/contact-us") Contact Us 
                    | page for assistance.    
</template>

<script>
export default {
    props: {
        isHelpInfo: {type: Boolean}
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.help-info {
    border: 1px solid $main-color;
    border-radius: 4px;
    margin-top: 20px;
    max-width: 250px;
    box-sizing: border-box;
    color: $main-color;
    padding-top: 15px;
    &__title {
        border-bottom: 1px solid $light-brown;
        text-align: center;
        padding-bottom: 10px;
        font-size: 22px;
    }
    &__text {
        padding: 0 20px;
        text-align: center;
    }
    &__link {
        font-weight: bold;
        margin: 0 5px;
        font-size: 18px;
        color: $main-color;
    }
    @media (max-width: 1024px) {
        display: none;
    }
}

.help-info_block {
    @media (max-width: 1024px) {
        display: block;
        background-color: $white;
        z-index: 10;
        position: fixed;
        right: 5px;
        top: 150px;
    }
}

</style>
