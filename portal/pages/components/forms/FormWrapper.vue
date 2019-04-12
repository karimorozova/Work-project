<template lang="pug">
    .form-wrapper
        slot    
</template>

<script>
export default {
    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.form-wrapper {
    width: 682px;
    box-sizing: border-box;
    border-radius: 10px;
    border: 1px solid $main-color;
    padding: 40px 80px 20px 80px;
}

</style>
