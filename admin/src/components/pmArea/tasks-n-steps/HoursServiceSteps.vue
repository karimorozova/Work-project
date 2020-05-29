<template lang="pug">
    .hours-steps
        .hours-steps__step(v-if="tasksData.stepsAndUnits.length && tasksData.workflow.id == 2917" v-for="(step , index) in tasksData.stepsAndUnits")
            
            .hours-steps__block(v-if="step.unit !== 'Packages' &&  step.unit !== 'CAT Wordcount'")
                .hours-steps__title Step {{step.stepCounter}} - {{step.step}}
                .hours-steps__main
                    .hours-steps__item
                        LabelVal(:text="step.unit")
                            input.hours-steps__input(type="number" min="1" max="1000" placeholder="Hours" @change="(e) => setHours(e, step.step)" @input="setLimit" @keydown="removeNonDigit")
                            .tasks-langs__item
                    //- .hours-steps__item
                    //-     LabelVal(text="Quantity")
                    //-         input.hours-steps__input(type="number" min="1" max="1000" @change="(e) => setQuantity(e, step.step)" @input="setLimit" @keydown="removeNonDigit")
            
            .hours-steps__block(v-if="step.unit == 'CAT Wordcount'")
                .hours-steps__title Step {{step.stepCounter}} - {{step.step}}
                .hours-steps__main
                    .hours-steps__sub-title Template
                    .hours-steps__drop-menu
                        SelectSingle(
                            :selectedOption="selectedTemplate"
                            :options="allTemplates"
                            placeholder="Template"
                            @chooseOption="setTemplate"
                        )

            .hours-steps__block(v-if="step.unit == 'Packages'")
                .hours-steps__title Step {{step.stepCounter}} - {{step.step}}
                .hours-steps__main
                    .hours-steps__item
                        LabelVal(text="Quantity")
                            input.hours-steps__input(type="number" min="1" max="1000" @change="(e) => setQuantity(e, step.step)" @input="setLimit" @keydown="removeNonDigit")
                    .hours-steps__item
                        .hours-steps__sub-title Template
                        .hours-steps__drop-menu
                            SelectSingle(
                                placeholder="Package"
                                :options="packages"
                                :selectedOption="selectedPackage"
                                @chooseOption="setPackage"
                            )
                    
                    //- .hours-steps__item        
                    //-     LabelVal(text="Package")
                    //-         input.hours-steps__input(type="number" min="1" max="1000" @change="(e) => setQuantity(e, step.step)" @input="setLimit" @keydown="removeNonDigit")


        | {{tasksData.stepsAndUnits}}
                
</template>

<script>
import LabelVal from "@/components/LabelVal";
import { mapGetters, mapActions } from 'vuex';
import taskData from "@/mixins/taskData";
import SelectSingle from "@/components/SelectSingle";

export default {
    mixins: [taskData],
    dsta(){
        return {
            templates: [],
            packages: [],
            selectedPackage: "",

    }
    },
    methods: {
        ...mapActions({
            setDataValue: "setTasksDataValue"
        }),
        setQuantity(e, step) {
            this.setDataValue({prop: "quantity", value: e.target.value});
        },
        setHours(e, step) {
            this.setDataValue({prop: `${step.step}-hours`, value: +e.target.value});
        },
        setTemplate({ option }) {
            const value = this.templates.find(item => item.name === option);
            this.setDataValue({prop: "template", value});
        },
        setPackage({option}) {
            this.selectedPackage = option;
            this.setDataValue({prop: "packageSize", value: option});
        },
        async getMemoqTemplates() {
            try {
                const result = await this.$http.get("/memoqapi/templates");
                this.templates = result.data || [];
                if(this.templates.length) {
                    const defTemplate = this.templates.find(item => item.name === '2 Steps');
                    this.setTasksDataValue({prop: "template", value: defTemplate || this.templates[0]});
                }
            } catch(err) { }
        }
    },
    created(){
        this.getMemoqTemplates();
    },
    computed: {
        ...mapGetters({
            tasksData: "getTasksData"
        }),
        serviceSteps() {
            let result = [...this.tasksData.service.steps];
            if(this.tasksData.workflow.name === '1 Step' && result.length > 1) {
                result.pop();
            }
            return result;
        },
        selectedTemplate() {
            return this.tasksData.template ? this.tasksData.template.name : "";
        },       
        allTemplates() {
            return this.templates.map(item => item.name);
        },
    },
    components: {
        LabelVal,
        SelectSingle
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
        padding: 12px 20px 0;

    }
    &__title {
        position: relative;
        max-width: 100%;
        margin: 10px 0 5px;
        text-align: center;
        font-size: 18px;
    }
    &__sub-title{
        margin-top: 6px;
        margin-right: 10px;
    }
    &__main {
        display: flex;
        width: 100%;
        margin: 7px 0;
        justify-content: center;
    }
    &__drop-menu {
      position: relative;
      width: 191px;
      border-radius: 6px;
      height: 29px;
      background: #fff;
      margin-bottom: 15px;
    }
    &__input {
        color: $main-color;
        width: 75px;
        margin-left: 10px;
        outline: none;
        border: 1px solid $main-color;
        border-radius: 5px;
        box-sizing: border-box;
        padding-left: 5px;
        transition: all 0.2s;   
        height: 28px;
        // &:focus {
        //     box-shadow: 0 0 10px $deep-brown;
        // }
        &::-webkit-inner-spin-button,
        &::-webkit-outer-spin-button {
            -webkit-appearance: none; 
            margin: 0;
        }
    }
    &__stage {
        opacity: 0.8;
    }
}

</style>
