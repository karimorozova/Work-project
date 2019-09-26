<template lang="pug">
    .form-wrapper
        slot    
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.form-wrapper {
    width: 682px;
    box-sizing: border-box;
    border-radius: 15px;
    border: 1px solid $main-color;
    padding: 40px 80px 20px 80px;
    margin-bottom: 40px;
}

</style>
