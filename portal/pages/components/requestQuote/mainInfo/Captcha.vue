<template lang="pug">
    .captcha
        span.captcha__comment Please, confirm that you are not a robot
        .g-recaptcha(data-sitekey="6LfHMFEUAAAAAJrIpd_0BOsfWqS04aLnEaT3NVOZ"
            style= {"transform": "scale(0.77)",
                "-webkit-transform": "scale(0.77)",
                "transform-origin": "150px 0",
                "-webkit-transform-origin": "150px 0" })    
</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>

.captcha {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    &__comment {
        font-size: 12px;
        position: relative;
        margin-bottom: 5px;
        &:after {
            content: "*";
            color: red;
            position: absolute;
            top: -3px;
            right: -5px;
        }
    }
}

</style>
