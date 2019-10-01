<template lang="pug">
    .marketing-subject
        TogglerOption(
            title="Subject line"
            label="Any specific words/themes to include/not include in the subject line?"
            :isOn="isSubject"
            @toggle="toggle"
            @setValue="setSubject"
        )
</template>

<script>
import TogglerOption from "./TogglerOption";
import { mapActions } from "vuex";

export default {
    data() {
        return {
            isSubject: false
        }
    },
    methods: {
        ...mapActions(["setOrderNestedDetail"]),
        toggle() {
            this.isSubject = !this.isSubject;
        },
        setSubject({value}) {
            this.setOrderNestedDetail({rootProp: 'genbrief', prop: 'Subject line', value});
        }
    },
    components: {
        TogglerOption
    }
}
</script>

<style lang="scss" scoped>


</style>
