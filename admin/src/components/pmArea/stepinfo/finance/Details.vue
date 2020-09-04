<template lang="pug">
    .details
        .details__icons(v-if="areIcons")
            img.details__icon(v-for="(icon, key) in dynamicIcons" :src="icon.src" :class="{'details_opacity-06': isActive(key)}" @click="makeAction(key)")
        .details__row
            .details__col
                .col__title Rate:
                    span.details__data.details_opacity-06(v-if="!isEditing") {{ financeData.rateValue }} &euro;
                    input.details__input(v-else type="text" size="6" v-model="currentData.rateValue")
            .details__col
                .col__title Quantity[Relative]:
                    span.details__data.details_opacity-06(v-if="!isQuantityEditable") {{ financeData.quantityRelative }}
                    input.details__input(v-else type="text" size="6" v-model="currentData.quantityRelative")
            .details__col
                .col__title Quantity [Total]:
                    span.details__data.details_opacity-06(v-if="!isQuantityEditable") {{ financeData.quantityTotal }}
                    input.details__input(v-else type="text" size="6" v-model="currentData.quantityTotal")

        .details__row.details_border-top
            .details__col.details_margin-top
                .details__item.details_no-margin-bottom
                    .col__title Total:
                        span.details__data(
                            type="text"
                            :value="financeData.subtotal"
                            :class="{'details_opacity-06': !isEditing}"
                        ) {{ financeData.subtotal }} &euro;

        ValidationErrors(v-if="areErrorsExist" :errors="errors" @closeErrors="closeErrorsBlock" :isAbsolute="isEditing")
</template>

<script>
    import LabelVal from "@/components/LabelVal";
    import ValidationErrors from "../../../ValidationErrors";
    import {mapGetters} from "vuex";

    export default {
        props: {
            financeData: {type: Object},
        },
        data() {
            return {
                icons: {
                    save: {
                        src: require("../../../../assets/images/Other/save-icon-qa-form.png"),
                    },
                    edit: {
                        src: require("../../../../assets/images/Other/edit-icon-qa.png"),
                    },
                },
                isEditing: false,
                currentData: "",
                areErrorsExist: false,
                floatRegex: /^[+-]?\d+(\.\d+)?$/,
                integerRegex: /^[1-9]\d*$/,
            };
        },
        methods: {
            isActive(key) {
                return key === "edit" ? this.isEditing : !this.isEditing;
            },
            makeAction(key) {
                if (key === "edit" && this.isEditing) return this.cancel();
                if (key === "edit") {
                    this.isEditing = true;
                    this.currentData = Object.keys(this.financeData).reduce((prev, cur) => {
                        prev[cur] = this.financeData[cur];
                        return {...prev};
                    }, {});
                } else {
                    if (!this.isEditing) return;
                    this.checkForErrors();
                }
            },
            checkForErrors() {
                this.errors = [];
                if (
                    !this.currentData.rateValue ||
                    !this.floatRegex.test(this.currentData.rateValue)
                )
                    this.errors.push("Set valid Rate value (integer/float)");
                if (
                    this.currentData.minimum &&
                    !this.floatRegex.test(this.currentData.minimum)
                )
                    this.errors.push("Set valid Minimum Charge value (integer/float)");
                if (
                    !this.currentData.quantityRelative ||
                    !this.integerRegex.test(this.currentData.quantityRelative)
                )
                    this.errors.push("Set valid Quantity[Relative] value(integer)");
                if (
                    !this.currentData.quantityTotal ||
                    !this.integerRegex.test(this.currentData.quantityTotal)
                )
                    this.errors.push("Set valid Quantity[Total] value(integer)");
                if (this.errors.length) {
                    return (this.areErrorsExist = true);
                }
                this.$emit("save", this.currentData);
                this.cancel();
            },
            closeErrorsBlock() {
                this.areErrorsExist = false;
            },
            cancel() {
                this.isEditing = false;
                this.currentData = "";
                this.closeErrorsBlock();
            },
        },
        computed: {
            ...mapGetters({
                userGroup: "getUserGroup",
            }),

            isQuantityEditable() {
                const groups = ["Administrators", "Developers"];
                return this.isEditing && groups.indexOf(this.userGroup.name) !== -1;
            },
            areIcons() {
                let forbidden = ["Cancelled", "Cancelled Halfway", "Completed"];
                const groups = ["Administrators", "Developers"];
                if (groups.indexOf(this.userGroup.name) !== -1) {
                    return forbidden.indexOf(this.financeData.stepStatus) === -1;
                }
                return (
                    [...forbidden, "Started"].indexOf(this.financeData.stepStatus) === -1
                );
            },
            dynamicIcons() {
                let result = {
                    save: {
                        src: require("../../../../assets/images/Other/save-icon-qa-form.png"),
                    },
                    edit: {
                        src: require("../../../../assets/images/Other/edit-icon-qa.png"),
                    },
                };
                if (this.isEditing) {
                    result.edit = {
                        src: require("../../../../assets/images/cancel_icon.jpg"),
                    };
                }
                return result;
            },
        },
        components: {
            LabelVal,
            ValidationErrors,
        },
    };
</script>

<style lang="scss" scoped>
    @import "../../../../assets/scss/colors";

    .details {
        box-sizing: border-box;
        padding: 20px;
        border: 0.5px solid $light-brown;
        position: relative;

        &__icons {
            width: 100%;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            height: 22px;
        }

        &__icon {
            margin-left: 10px;
            cursor: pointer;
        }
        &__col{
            justify-content: flex-start;
            display: grid;
        }

        &__row {
            width: 100%;
            box-sizing: border-box;
            display: flex;
            height: 50px;
            align-items: center;
            justify-content: space-between;
        }

        &__item {
            margin-bottom: 25px;
        }

        &__data {
            display: inline-block;
            margin-left: 10px;
            width: 70px;
        }

        &__input {
            max-width: fit-content;
            box-sizing: border-box;
            border: 1px solid $light-brown;
            padding: 0 5px;
            border-radius: 5px;
            outline: none;
            color: $main-color;
            margin-left: 10px;
            height: 28px;
        }

        &_opacity-06 {
            opacity: 0.6;
        }

        &_border-top {
            border-top: 2px solid #938676;
        }

        &_no-margin-bottom {
            margin-bottom: 0;
        }

        &_margin-top {
            margin-top: 20px;
        }
    }
</style>
