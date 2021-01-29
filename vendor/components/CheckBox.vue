<template lang="pug">
    .check-box(:class="{'check-box_opacity': isReadonly}")
        img.check-box__image(v-if="isChecked" src="../assets/images/selected-checkbox.png" @click="unCheck")
        img.check-box__image(v-else src="../assets/images/unselected-checkbox.png" @click="check")
            
</template>

<script>
export default {
    props: {
        isChecked: {type: Boolean},
        isReadonly: {type: Boolean}
    },
    methods: {
        check() {
            if(this.isReadonly) return;
            this.$emit("check");
        },
        unCheck() {
            if(this.isReadonly) return;
            this.$emit("unCheck");
        }
    }
}
</script>

<style lang="scss" scoped>
    .check-box {
        &__image {
            height: 20px;
            width: 20px;
        }
        &_opacity {
            cursor: no-drop;
            opacity: 0.5;
        }
    }
</style>
