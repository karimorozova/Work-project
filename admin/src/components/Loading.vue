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
    position: fixed;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    z-index: 1000;
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
        box-shadow: 0 0 8px #68573E;
    }
    &__text {
        color: #68573E;
        font-size: 16px;
        margin-right: 20px;
    }
    &__spinner {
        border: 7px solid #d8d8d8;
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
