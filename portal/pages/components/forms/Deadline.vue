<template lang="pug">
    .project-deadline
        TitleInput(title="SUGGESTED DEADLINE:" :isAsterisk="true" customClass="pair-block_flex-end")
            .project-deadline__date(v-click-outside="closePicker")
                input.project-deadline__input(type="text" placeholder="dd-mm-yyyy" readonly :value="formattedDeadline")
                img.project-deadline__icon(src="../../../assets/images/calendar.png" @click="togglePicker")
                .project-deadline__picker
                    Datepicker(v-if="isPickerOpened" 
                        :inline="true" 
                        :monday-first="true"
                        :highlighted="highlighted"
                        :disabled="disabled"
                        @selected="setDeadline"
                        wrapperClass="small")
</template>

<script>
import TitleInput from "./TitleInput";
import Datepicker from '~/components/Datepicker';
import moment from "moment";
import ClickOutside from "vue-click-outside";

export default {
    data() {
        return {
            highlighted: {
                days: [6, 0]
            },
            disabled: {
                to: moment().add(-1, 'day').endOf('day').toDate()
            },
            isPickerOpened: false,
            selectedDeadline: ""
        }
    },
    methods: {
        togglePicker () {
            this.isPickerOpened = !this.isPickerOpened;
        },
        closePicker() {
            this.isPickerOpened = false;
        },
        setDeadline(date) {
            this.selectedDeadline = date;
            this.closePicker();
        }
    },
    computed: {
        formattedDeadline() {
            return this.selectedDeadline ? moment(this.selectedDeadline).format("DD-MM-YYYY") : "";
        }
    }, 
    components: {
        TitleInput,
        Datepicker
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.project-deadline {
    &__input {
        box-sizing: border-box;
        height: 30px;
        width: 90%;
        padding: 0 5px;
        outline: none;
        border: 1px solid $main-color;
        border-radius: 5px;
        font-size: 14px;
        margin-top: 5px;
        display: flex;
        justify-content: flex-end;
        text-align: center;
        &::-webkit-input-placeholder {
            opacity: 0.6;
        }
    }
    &__date {
        position: relative;
    }
    &__picker {
        position: absolute;
    }
    &__icon {
        position: absolute;
        right: -5px;
        top: 5px;
        width: 20px;
        cursor: pointer;
    }
}

</style>
