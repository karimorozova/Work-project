<template lang="pug">
    .project-name
        TitleInput(title="PROJECT NAME:" :isAsterisk="true")
            input.project-name__input(type="text" placeholder="50 characters maximum" :value="orderDetails.projectName" @input="setProjectName")
</template>

<script>
import TitleInput from "./TitleInput";
import { mapGetters, mapActions } from "vuex";

export default {
    methods: {
        ...mapActions({
            setOrderDetail: "setOrderDetail" 
        }),
        setProjectName(e) {
            const value = e.target.value;
            this.setOrderDetail({prop: 'projectName', value})
        }
    },
    computed: {
        ...mapGetters({
            orderDetails: "getOrderDetails"
        }),
        projectName() {
            return this.orderDetails.projectName || "";
        }
    },
    components: {
        TitleInput
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.project-name {
    &__input {
        box-sizing: border-box;
        height: 30px;
        width: 100%;
        padding: 0 5px;
        outline: none;
        border: 1px solid $main-color;
        border-radius: 5px;
        font-size: 14px;
        margin-left: 12px;
        margin-top: 5px;
        &::-webkit-input-placeholder {
            opacity: 0.6; 
        }
    }
}

</style>
