<template lang="pug">
.loading
    .loading__message
        span.loading__text Loading
        .loading__spinner
</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>
.loading {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    z-index: 10000;
    &__message {
        position: fixed;
        top: 0;
        left: 50%;
        margin-left: -125px;
        padding: 30px 0;
        width: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #FFF;
        box-shadow: rgba(81, 68, 48, 0.3) 0px 1px 2px 0px, rgba(81, 68, 48, 0.15) 0px 1px 3px 1px;
    }
    &__text {
        color: #68573E;
        font-size: 16px;
        margin-right: 20px;
    }
    &__spinner {
        border: 7px solid #e0dcd8;
        border-top: 7px solid #68573E;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        animation: spin 1.2s linear infinite;    
    }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
