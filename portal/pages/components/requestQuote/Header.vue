<template lang="pug">
    .request-header
        .logo
            .header-container
                a.logo__link(href="https://www.pangea.global/")
                    img.logo__image(src='../../../assets/images/new-logo.png')
        .title
            .header-container
                span.title__text Request a Quote    
</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>

.request-header {
    display: flex;
    flex-direction: column;
    .header-container {
        max-width: 1320px;
        margin: 0 auto;
    }
}

.logo {
    box-shadow: 0 5px 30px rgba(92, 46, 26, 0.4);
    z-index: 1;
    &__image {
        padding: 6px 0 12px 0;
        margin-left: 20%;
        @media (max-width: 1280px) {
            margin-left: 10px;
        }
        @media (max-width: 450px) {
            margin-left: 15%;
        }
    }
    @media (max-width: 1024px) {
        justify-content: left;
    }
}

.title {
    max-height: 273px;
    background-image: url('../../../assets/images/header2.jpg');
    background-size: cover;
    padding: 6.3% 0 5.6%;
    margin-bottom: 45px;
    @media (max-width: 860px) {
        background-repeat: no-repeat;
        background-size: contain;
    }
    @media (max-width: 768px) {
        margin-bottom: 5px;
        background-size: cover;
        background-position-x: center;
    }

    &__text {
        color: #665741;
        font-size: 56px;
        margin-left: 20%;
        font-weight: bold;
        font-family: 'Open Sans', sans-serif;
        text-shadow:
        -1px -1px 0 #fff,
        1px -1px 0 #fff,
        -1px 1px 0 #fff,
        1px 1px 0 #fff;
        @media (max-width: 1280px) {
            margin-left: 10px;
        }
        @media (max-width: 580px) {
            font-size: 36px;
        }
    }
}

</style>
