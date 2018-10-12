<template lang="pug">
.project-action
    .project-action__title Project Action: 
    .project-action__drop-menu
        SelectSingle(
            :selectedOption="selectedAction"
            :options="actions"
            placeholder="Select Action"
            @chooseOption="setAction"
        )
    .project-action__confirm(v-if="selectedAction")
        Button(value="Confirm" @clicked="makeAction")
</template>

<script>
import SelectSingle from "../SelectSingle";
import Button from "../Button";
import { mapGetters, mapActions } from 'vuex';

export default {
    props: {
        project: {
            type: Object
        }
    },
    data() {
        return {
            selectedAction: "",
            actions: ["Send a Quote", "Other Action"]
        }
    },
    methods: {
        setAction({option}) {
            this.selectedAction = option;
        },
        async makeAction() {
            this.loadingToggle(true);
            try {
                const result = await this.$http.post('/pm-manage/send-quote', {id: this.project._id});
                this.alertToggle({message: 'The Quote has been sent', isShow: true, type: 'success'})
            } catch(err) {
                this.alertToggle({message: 'Internal server error. Cannot send the Quote.', isShow: true, type: 'error'})
            }
            this.loadingToggle(false);
        },
        ...mapActions({
            loadingToggle: 'loadingToggle',
            alertToggle: "alertToggle"
        }),
    },
    components: {
        SelectSingle,
        Button
    }
}
</script>

<style lang="scss" scoped>
@import '../../assets/scss/colors.scss';

.project-action {
    padding: 10px 20px;
    box-shadow: 0 3px 20px $brown-shadow;
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    &__title {
        padding-bottom: 5px;
        font-size: 20px;
        border-bottom: 1px solid $brown-border;
        margin-bottom: 30px;
    }
    &__drop-menu {
        height: 28px;
        position: relative;
        margin-bottom: 20px;
    }
}
</style>
