<template lang="pug">
    .marketing-bonus
        TogglerOption(
            title="Bonus/Offers"
            label="Bonus/Offers details"
            :isOn="isBonus"
            :isTip="true"
            tip="Please list key info about promotion"
            @toggle="toggle"
            @setValue="setBonus"
        )
</template>

<script>
import TogglerOption from "./TogglerOption";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            isBonus: false
        }
    },
    methods: {
        ...mapActions(["setOrderNestedDetail"]),
        toggle() {
            this.isBonus = !this.isBonus;
        },
        setBonus({value}) {
            this.setOrderNestedDetail({rootProp: 'genBrief', prop: 'Bonus/Offers', value});
        }
    },
    components: {
        TogglerOption
    }
}
</script>

<style lang="scss" scoped>


</style>