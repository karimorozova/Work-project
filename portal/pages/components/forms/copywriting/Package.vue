<template lang="pug">
    .copywriting-package
        TitleInput(title="PACKAGE:" :isAsterisk="true")
            .sizes
                .sizes__item(v-for="(size, index) in packageSizes")
                    .sizes__radio
                        CustomRadio(
                            :isChecked="size.isChecked"
                            @toggleRadio="setSize(index)")
                    .sizes__name {{ size.name }}
</template>

<script>
import TitleInput from "../TitleInput";
import CustomRadio from "@/components/CustomRadio";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            packageSizes: []
        }
    },
    methods: {
        ...mapActions([
            "setOrderDetail"
        ]),
        setSize(index) {
            this.packageSizes = this.packageSizes.map((item, ind) => {
                item.isChecked = ind === index;
                return item;
            })
            this.setOrderDetail({prop: "packageSize", value: this.packageSizes[index]});
        },
        async getPackages() {
            try {
              // MAX, do we need this now?
                const result = await this.$axios.get('/api/units');
                const packages = result.data.find(item => item.type === 'Packages');
                // this.packageSizes
                // this.packageSizes = result.data.map(item => {
                //     item.isChecked = false;
                //     return item;
                // });
                // this.packageSizes[0].isChecked = true;
                // this.setOrderDetail({prop: "packageSize", value: this.packageSizes[0]})
            } catch(err) {

            }
        }
    },
    components: {
        TitleInput,
        CustomRadio
    },
    created() {
        this.getPackages();
    }
}
</script>

<style lang="scss" scoped>

.sizes {
    width: calc(100% - 12px);
    padding-left: 12px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    &__item {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-top: 20px;
    }
    &__name {
        font-size: 14px;
        margin-top: 15px;
    }
}

</style>
