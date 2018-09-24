<template lang="pug">
.header
    .header__logo
        a.header__link(href="https://www.pangea.global/")
            img.header__image(src="../assets/images/new-logo.png")
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
        width: 34%;
        padding-right: 100px;
        margin: 5px 0;
        display: flex;
        justify-content: flex-start;
        @media (max-width: 1440px) {
        width: 40%;
        }
        @media (max-width: 1440px) {
            width: 50%;
        }
        @media (max-width: 1024px) {
            width: 60%;
        }
        @media (max-width: 768px) {
            width: 80%;
        }
    }
}

.header__background {
    width: 100%;
    height: 273px;
    background-image: url('../assets/images/header2.jpg');
    background-size: cover;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 0;
    display: flex;
    justify-content: center;
}

.header__text {
    width: 34%;
    padding-right: 100px;
    color: #665741;
    font-size: 56px;
    font-weight: bold;
    font-family: 'Open Sans', sans-serif;
    text-shadow:
        -1px -1px 0 #fff,
        1px -1px 0 #fff,
        -1px 1px 0 #fff,
        1px 1px 0 #fff;
    @media (max-width: 1440px) {
        width: 40%;
    }
    @media (max-width: 1440px) {
        width: 50%;
    }
    @media (max-width: 1024px) {
        width: 60%;
    }
    @media (max-width: 768px) {
        width: 80%;
    }
}
</style>
