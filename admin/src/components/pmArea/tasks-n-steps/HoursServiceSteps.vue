<template lang="pug">
    .hours-steps
        .hours-steps__step(v-for="({ step }, index) in serviceSteps")
            .hours-steps__block
                .hours-steps__title {{ step.title }}
                .hours-steps__main
                    .hours-steps__item
                        LabelVal(text="Hours")
                            input.hours-steps__input(type="text")
                    .hours-steps__item
                        LabelVal(text="Quantity")
                            input.hours-steps__input(type="number")
                .hours-steps__stage Step {{ index+1 }}
</template>

<script>
import LabelVal from "@/components/LabelVal";
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters({
            tasksData: "getTasksData"
        }),
        serviceSteps() {
            let result = [...this.tasksData.service.steps];
            if(this.tasksData.workflow.name === '1 Step') {
                result.pop();
            }
            return result;
        }
    },
    components: {
        LabelVal
    }    
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";

.hours-steps {
    &__block {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 40px;
        border: 1px solid $main-color;
        box-sizing: border-box;
        background-color: $active-background;
    }
    &__title {
        position: relative;
        top: -10px;
        background-color: white;
        padding: 0 5px;
        width: fit-content;
    }
    &__main {
        display: flex;
        justify-content: space-around;
        width: 100%;
        margin: 5px 0;
    }
    &__input {
        width: 70px;
        margin-left: 10px;
        outline: none;
        border: 1px solid $main-color;
        box-sizing: border-box;
        padding-left: 5px;
        transition: all 0.2s;
        &:focus {
            box-shadow: 0 0 10px $deep-brown;
        }
    }
    &__stage {
        opacity: 0.8;
    }
}

</style>
