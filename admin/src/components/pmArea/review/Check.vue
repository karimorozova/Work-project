<template lang="pug">
    .check-line
        i.check-line__icon.fa.fa-check-circle(@click="toggleApprovement" :class="{'check-line_green': isApproved}")
        span.check-line__text {{ text }}
</template>

<script>
export default {
    props: {
        isApproved: {type: Boolean},
        text: {tyep: String}
    },
    methods: {
        toggleApprovement() {
            this.$emit('toggleApprovement');
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.check-line {
    display: flex;
    align-items: center;
    &__icon {
        color: $light-brown;
        font-size: 20px;
        cursor: pointer;
        transition: all 0.4s;
        margin-right: 5px;
    }
    &_green {
        color: $green-approve;
        transform: rotateY(360deg);
    }
}

</style>
