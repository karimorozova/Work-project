<template lang="pug">
.arrows
    .arrows__right
        img(src="../../../assets/images/right.png" @click="forward")
    .arrows__left
        img(src="../../../assets/images/left.png" @click="back")
</template>

<script>
export default {
    methods: {
        forward() {
            this.$emit('forward');
        },
        back() {
            this.$emit('back');
        }
    }
}
</script>

<style lang="scss" scoped>

.arrows {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    &__left, &__right {
        img {
            cursor: pointer;
            border-radius: 50%;
            &:active {
                background-color: #DFD7CD;
            }
        }
    }
}

</style>
