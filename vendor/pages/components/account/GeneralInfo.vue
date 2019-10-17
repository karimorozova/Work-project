<template lang="pug">
    .general
        .general__block
            VendorPhoto
        .general__block
            Personal
        .general__block
            OtherInfo
</template>

<script>
import VendorPhoto from "./general/VendorPhoto";
import Personal from "./general/Personal";
import OtherInfo from "./general/OtherInfo";

export default {
    components: {
        VendorPhoto,
        Personal,
        OtherInfo
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.general {
    box-sizing: border-box;
    margin: 20px 10px 40px 10px;
    padding: 20px;
    box-shadow: 0 0 15px $brown-shadow;
    width: 1040px;
    display: flex;
    justify-content: space-between;
    &__block {
        width: 30%;
        &:first-child {
            max-width: 180px;
        }
    }
}

</style>
