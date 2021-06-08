<template lang="pug">
    .industries
        SectionTitle(text="CHOOSE AN INDUSTRY" number="3" isAsterisk)
        .industries__list
            .industries__item(v-for="industry in industries" @click="setIndustry(industry)" :class="{'industries_active': isActive(industry)}")
                img.industries__icon(:src="domain + industry.icon")
                p.industries__name {{ industry.name }}
</template>

<script>
import SectionTitle from "./SectionTitle";
import { mapGetters, mapActions } from "vuex";
import setDomain from "@/mixins/setDomain";

export default {
    mixins: [setDomain],
    data() {
        return {
            industries: []
        }
    },
    methods: {
        ...mapActions({
            setDetail: "setRequestQuoteDetail"
        }),
        isActive(industry) {
            return this.requestDetails.industry && this.requestDetails.industry.name === industry.name;
        },
        setIndustry(industry) {
            this.setDetail({prop: "industry", value: industry});
        },
        async getIndustries() {
            try {
                const result = await this.$axios.get("/api/industries");
                this.industries = result.data.filter(item => item.active);
            } catch(err) {

            }
        }
    },
    computed: {
        ...mapGetters({
            requestDetails: "getRequestQuoteDetails"
        })
    },
    components: {
        SectionTitle
    },
    created() {
        this.getIndustries();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.industries {
    margin-bottom: 30px;
    &__list {
        display: flex;
        flex-wrap: wrap;
    }
    &__item {
        display: flex;
        align-items: center;
        border: 1px solid $main-color;
        border-radius: 10px;
        width: 30%;
        height: 75px;
        padding: 5px;
        margin: 5px;
        box-sizing: border-box;
        cursor: pointer;
        &:hover {
            background-color: $main-color;
            color: $white;
            .industries__icon {
                filter: invert(100%) brightness(5);;
                -webkit-filter: invert(100%) brightness(5);
            }
        }
        @media (max-width: 680px) {
            width: 40%;
        }
        @media (max-width: 540px) {
            width: 70%;
        }
    }
    &__icon {
        width: 39px;
    }
    &__name {
        padding: 5px 0 0 10px;
    }
    &_active {
        background-color: $main-color;
        color: $white;
        .industries__icon {
            filter: invert(100%) brightness(5);;
            -webkit-filter: invert(100%) brightness(5);
        }
    }
}

</style>
