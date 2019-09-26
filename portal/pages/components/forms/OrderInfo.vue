<template lang="pug">
    .order-info
        .order-info__title YOUR ORDER
        .order-info__main
            .info-block
                .info-block__title SERVICE:
                    span.info-block__num 1
                .info-block__item 
                    span.info-block__text {{ service }}
            .info-block
                .info-block__title LANGUAGE(S):
                    span.info-block__num 2
                .info-block__item(v-if="isDuo")
                    span.info-block__label Source:
                    span.info-block__text {{ source.lang }}
                .info-block__item
                    span.info-block__label Target:
                    span.info-block__text {{ targetsList }} 
            .info-block
                .info-block__item
                    span.info-block__num 3
                .info-block__title(v-if="isDuo") INDUSTRY:
                .info-block__title(v-else) PACKAGE:
                .info-block__item(v-if="isDuo")
                    span.info-block__text {{ selectedIndustry }}
                .info-block__item(v-if="!isDuo")
                    span.info-block__text {{ selectedPackage }}
            .info-block(v-if="isCoptwriting")
                .info-block__title TYPE:
                    span.info-block__num 4
                .info-block__item 
                    span.info-block__text {{ selectedType }}
            .info-block
                .info-block__title SUGGESTED DEADLINE
                .info-block__item
                    span.info-block__text {{ deadline }}
</template>

<script>
import { mapGetters } from "vuex";
import moment from "moment";

export default {
    props: {
        isDuo: {type: Boolean, default: true},
        isCoptwriting: {type: Boolean},
        service: {type: String},
        industry: {type: String}
    },
    computed: {
        ...mapGetters({
            orderDetails: "getOrderDetails"
        }),
        source() {
            return this.orderDetails.source ? this.orderDetails.source : {lang: 'Select'}; 
        },
        targetsList() {
            let result = "Select";
            if(this.orderDetails.targets && this.orderDetails.targets.length) {
                result = this.orderDetails.targets.reduce((init, cur) => {
                    return `${init}${cur.lang}; `
                },"")
            }
            return result;
        },
        deadline() {
            return this.orderDetails.deadline ? moment(this.orderDetails.deadline).format("DD-MM-YYYY") : ""
        },
        selectedIndustry() {
            return this.industry || 'Select';
        },
        selectedPackage() {
            return this.orderDetails.package || "Select";
        },
        selectedType() {
            return this.orderDetails.type || "Select"; 
        }
    }
    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.order-info {
    position: sticky;
    top: 7vh;
    padding: 15px 0;
    color: $main-color;
    margin-left: 20px;
    border: 1px solid $main-color;
    border-radius: 15px;
    width: 250px;
    box-sizing: border-box;
    &__title {
        border-bottom: 1px solid $light-brown;
        text-align: center;
        padding-bottom: 10px;
        font-size: 22px;
    }
    &__main {
        padding: 20px 20px 0 40px;
    }
}

.info-block {
    position: relative;
    margin-bottom: 15px;
    &__title {
        font-weight: bold;
        font-size: 18px;
    }
    &__num {
        position: absolute;
        left: -20px;
        top: -3px;
        font-size: 24px;
        font-weight: 800;
    }
    &__item {
        margin-top: 10px;
    }
    &__label {
        margin-right: 10px;
    }
    &__text {
        font-size: 14px;
        color: $orange;
    }
}

</style>
