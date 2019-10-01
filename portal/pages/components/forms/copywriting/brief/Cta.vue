<template lang="pug">
    .marketing-cta
        TogglerOption(
            title="CTA: Yes/No"
            :isOn="isCta"
            @toggle="toggle"
        )
</template>

<script>
import TogglerOption from "./TogglerOption";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            isCta: false
        }
    },
    methods: {
        ...mapActions(["setOrderNestedDetail"]),
        toggle() {
            this.isCta = !this.isCta;
            this.setOrderNestedDetail({rootProp: 'genbrief', prop: 'isCta', value: this.isCta});
        }
    },
    components: {
        TogglerOption
    }
}
</script>

<style lang="scss" scoped>


</style>