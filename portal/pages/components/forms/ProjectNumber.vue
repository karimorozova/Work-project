<template lang="pug">
    .project-number
        TitleInput(title="Client Project Number:")
            input.project-number__input(
              type="text"
              placeholder="Project ID"
              :value="orderDetails.clientProjectNumber"
              @input="setProjectNumber"
              )
</template>

<script>
import TitleInput from "./TitleInput";
import { mapGetters, mapActions } from "vuex";

export default {
    methods: {
        ...mapActions({
            setOrderDetail: "setOrderDetail"
        }),
        setProjectNumber(e) {
            const value = e.target.value;
            this.setOrderDetail({prop: 'clientProjectNumber', value})
        }
    },
    computed: {
        ...mapGetters({
            orderDetails: "getOrderDetails"
        }),
        projectNumber() {
            return this.orderDetails.clientProjectNumber || "";
        }
    },
    components: {
        TitleInput
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.project-number {
    &__input {
        box-sizing: border-box;
        height: 30px;
        width: 220px;
        padding: 0 5px;
        outline: none;
        border: 1px solid $main-color;
        border-radius: 5px;
        font-size: 14px;
        margin-top: 5px;
        &::-webkit-input-placeholder {
            opacity: 0.6;
        }
    }
}

</style>
