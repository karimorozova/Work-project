<template lang="pug">
.preview(v-click-outside="closePreview")
    span.preview__close(@click="closePreview") +
    .preview__title Quote Preview
    .preview__details
        .preview__message
    .preview__button
        Button(value="Send" @clicked="sendQuote")
</template>

<script>
import ClickOutside from "vue-click-outside";
import Button from "../Button";
import { mapGetters, mapActions } from "vuex";

export default {
    props: {
        message: {
            type: String
        }
    },
    data() {
        return {
        }
    },
    methods: {
        closePreview() {
            this.$emit("closePreview");
        },
        editMessage(e) {
            const message = e.target.value;
            this.$emit("editMessage", { message });
        },
        async sendQuote() {
            let element = document.querySelector(".preview__message");
            try {
                const result = await this.$http.post('/pm-manage/send-quote', {id: this.project._id, message: element.innerHTML});
                await this.storeProject(result.body);
                this.$emit("closePreview");
                this.alertToggle({message: "Quote Details sent", isShow: true, type: "success"})
            } catch(err) {
                this.alertToggle({message: "Error on sending a quote details", isShow: true, type: "error"})
            }
        },
        ...mapActions({
            alertToggle: "alertToggle",
            storeProject: "setCurrentProject"
        })
    },
    computed: {
        ...mapGetters({
            project: "getCurrentProject"
        }),
        projectLanguages() {
            let result = this.project.tasks.reduce((init, cur) => {
                return `${init}${cur.sourceLanguage}${cur.targetLanguage}; `
            }, "")
        }
    },
    components: {
        Button
    },
    directives: {
        ClickOutside
    },
    mounted() {
        let element = document.querySelector(".preview__message");
        element.insertAdjacentHTML('beforeend', this.message);
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.preview {
    position: relative;
    background-color: $white;
    width: max-content;
    top: 10%;
    left: 20%;
    padding: 20px;
    box-shadow: 0 0 10px $brown-shadow;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    &__close {
        position: absolute;
        top: 5px;
        right: 10px;
        transform: rotate(45deg);
        font-weight: 600;
        font-size: 24px;
        cursor: pointer;
    }
    &__details {
        width: 100%;
        box-sizing: border-box;
        overflow-y: overlay;
    }
    &__title {
        font-size: 20px;
        margin-bottom: 10px;
    }
    &__message {
        max-height: 600px;
        width: 100%;
    }
    &__button {
        margin-top: 20px;
    }
}

</style>
