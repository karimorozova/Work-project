<template lang="pug">
    .check-circle(:class="[customClass, {'check-circle_absolute': isAbsolute}]" :style="positionStyle")
        i.check-circle__icon.fa.fa-check-circle(:class="{'check-circle_green': isChecked}" @click="toggle")
</template>

<script>
export default {
    props: {
        isChecked: {type: Boolean},
        isAbsolute: {type: Boolean},
        customClass: {type: String},
        positionStyle: {type: Object}
    },
    methods: {
        toggle() {
            this.$emit("toggle");
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.check-circle {
    &__icon {
        font-size: 18px;
        color: $light-brown;
        cursor: pointer;
    }
    &_absolute {
        position: absolute;
    }
    &_green {
        color: $green-approve;        
    }
}

</style>
