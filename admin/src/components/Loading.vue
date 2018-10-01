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
    background: rgba(0, 0, 0, 0.2);
    z-index: 1000;
    &__message {
        position: fixed;
        top: 50%;
        left: 50%;
        margin-left: -125px;
        width: 250px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    &__text {
        color: #FFF;
        text-shadow: 0 0 10px #000;
        font-size: 16px;
        margin-right: 20px;
    }
    &__spinner {
        border: 10px solid #f3f3f3;
        border-top: 10px solid #3498db;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1.2s linear infinite;    
    }
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
