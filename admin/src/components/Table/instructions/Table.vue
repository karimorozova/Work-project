<template lang="pug">
    .i-table(v-click-outside="setDefaults")
        SettingsTable(
            :fields="fields"
            :tableData="instructions"
            :errors="errors"
            :areErrors="areErrors"
            @closeErrors="closeErrors"
        ) 
            .i-table__header(slot="headerType" slot-scope="{ field }") {{ field.label }}
            .i-table__header(slot="headerContent" slot-scope="{ field }") {{ field.label }}
            .i-table__header(slot="headerIcons" slot-scope="{ field }") {{ field.label }}
            template(slot="type" slot-scope="{ row, index }")
                .i-table__data(v-if="currentActive !== index") {{ row.type }}
                .i-table__editing-data(v-else)
                    input.i-table__input(type="text" v-model="currentInstruction.type")
            template(slot="content" slot-scope="{ row, index }")
                .i-table__data(v-if="currentActive !== index") {{ row.content }}
                .i-table__editing-data(v-else)
                    textarea.i-table__text(v-model="currentInstruction.content" rows='3')
            .i-table__icons(slot="icons" slot-scope="{ row, index }")
                img.i-table__icon(v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'i-table_opacity': isActive(key, index)}")
        Add(@add="addRow")
</template>

<script>
import SettingsTable from "../SettingsTable";
import Add from "@/components/Add";
import crudIcons from "@/mixins/crudIcons";
import ClickOutside from "vue-click-outside";
import { mapActions } from "vuex";

export default {
    mixins: [crudIcons],
    props: {
        alliInstructions: {
            type: Array,
            default: () => []
        },
        instructions: {
            type: Array,
            default: () => []
        },
        isSpecific: {
            type: Boolean
        }
    },
    data() {
        return {
            fields: [
                {label: "Type", headerKey: "headerType", key: "type", width: "18%", padding: "0"},
                {label: "Content", headerKey: "headerContent", key: "content", width: "64%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "18%", padding: "0"},
            ],
            currentActive: -1,
            currentInstruction: {},
            areErrors: false,
            errors: []
        }
    },
    methods: {
        ...mapActions({
            alertToggle: "alertToggle"
        }),
        async makeAction(index, key) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return this.isEditing();
            }
            switch(key) {
                case "edit":
                    this.setEditingData(index);
                    break;
                case "cancel":
                    this.setDefaults();
                    break;
                case "delete":
                    await this.deleteInstruction(index);
                    break;
                default:
                    await this.checkErrors(index);
            }
        },
        setEditingData(index) {
            this.currentActive = index;
            this.currentInstruction = {...this.instructions[index]};
        },
        setDefaults() {
            this.currentActive = -1;
            this.currentInstruction = {};
            this.$emit("fitlerInstructions");
        },
        closeErrors() {
            this.areErrors = false;
        },
        addRow() {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            this.currentInstruction = {
                type: "",
                content: "",
                isSpecific: this.isSpecific
            }
            this.instructions.push(this.currentInstruction);
            this.currentActive = this.instructions.length - 1;
        },
        async deleteInstruction(index) {
            if(!this.instructions[index]._id) {
                return this.setDefaults();
            }
            try {
                await this.$http.delete(`/api/instructions/${this.instructions[index]._id}`);
                this.$emit("refreshInstructions");
                this.setDefaults();
            } catch(err) {
                this.alertToggle({message: "Error on deleting instruction", isShow: true, type: "error"});
            }
        },
        async checkErrors(index) {
            if(this.currentActive === -1) return;
            const sameType = this.alliInstructions.find(item => {
                return item.type === this.currentInstruction.type && item._id !== this.currentInstruction._id
                })
            this.errors = [];
            if(!this.currentInstruction.type || sameType) this.errors.push("Type title should be unique and not empty");
            if(!this.currentInstruction.content) this.errors.push("Type content should not be empty");
            if(this.errors.length) {
                return this.areErrors = true;
            }
            await this.save();
        },
        async save() {
            try {
                await this.$http.post("/api/instructions", {instruction: this.currentInstruction});
                this.$emit("refreshInstructions");
                this.setDefaults();
            } catch(err) {
                this.alertToggle({message: "Error on saving instruction", isShow: true, type: "error"});
            }
        }
    },
    components: {
        SettingsTable,
        Add
    },
    directives: {
        ClickOutside
    }
}
</script>

<style lang="scss" scoped>
@import "../../../assets/scss/colors.scss";
@import "../../../assets/styles/settingsTable";

.i-table {
    &__data {
        @extend %table-data;
        height: 52px;
    }
    &__editing-data {
        @extend %table-data;
        height: 52px;
        box-shadow: inset 0 0 7px $brown-shadow;
    }
    &__input {
        @extend %table-text-input;
    }
    &__icons {
        @extend %table-icons;
    }
    &__icon {
        @extend %table-icon;
    }
    &__text {
        @extend %table-text-input;
        resize: none;
        background-color: transparent;
    }
    &_opacity {
        opacity: 1;
    }
}

</style>
