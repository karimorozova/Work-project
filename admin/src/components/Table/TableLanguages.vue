<template lang="pug">
.languages
    .languages__table
        SettingsTable(
            :fields="fields"
            :tableData="langPaging[currentPage-1]"
            :errors="errors"
            :areErrors="areErrors"
            @closeErrors="closeErrors"
        )
            template(slot="headerIcon" slot-scope="{ field }")
                .languages__header {{ field.label }}
            template(slot="headerName" slot-scope="{ field }")
                .languages__header {{ field.label }}
            template(slot="headerSymbol" slot-scope="{ field }")
                .languages__header {{ field.label }}
            template(slot="headerIso1" slot-scope="{ field }")
                .languages__header {{ field.label }}
                    .languages__header-icon(@click="toggleTooltip('iso1')" v-click-outside="() => closeTooltip('isTooltip1')")
                        img.languages__info-icon(src="../../assets/images/info-icon-white.png")
                        .languages__tooltip(v-if="isTooltip1") (two letters)
            template(slot="headerIso2" slot-scope="{ field }")
                .languages__header {{ field.label }}
                    .languages__header-icon(@click="toggleTooltip('iso2')" v-click-outside="() => closeTooltip('isTooltip2')")
                        img.languages__info-icon(src="../../assets/images/info-icon-white.png")
                        .languages__tooltip(v-if="isTooltip2") (three letters)
            template(slot="headerActive" slot-scope="{ field }")
                .languages__header {{ field.label }}
            template(slot="headerIcons" slot-scope="{ field }")
                .languages__header {{ field.label }}
            template(slot="icon" slot-scope="{ row, index }")
                .languages__data.languages_centered(:class="{'languages_active': currentActive === index}")
                    img.languages__flag(:src="row.icon")
                    .languages__upload(v-if="currentActive === index" :class="{'languages_no-back': imageData}")
                        input.languages__load-file(type="file" @change="uploadFile")
                        img.languages__file-preview(v-if="imageData" :src="imageData")
            template(slot="name" slot-scope="{ row, index }")
                .languages__data {{ row.lang }}
            template(slot="symbol" slot-scope="{ row, index }")
                .languages__data {{ row.symbol }}
            template(slot="iso1" slot-scope="{ row, index }")
                .languages__data {{ row.iso1 }}
            template(slot="iso2" slot-scope="{ row, index }")
                .languages__data {{ row.iso2 }}
            template(slot="active" slot-scope="{ row, index }")
                .languages__data.languages_centered(:class="{'languages_active': currentActive === index}")
                    img.languages__checkbox(v-if="row.active" src="../../assets/images/selected-checkbox.png" @click="toggleActive(index)" :class="{'languages_opacity': currentActive === index}")
                    img.languages__checkbox(v-else src="../../assets/images/unselected-checkbox.png" @click="toggleActive(index)" :class="{'languages_opacity': currentActive === index}")
            template(slot="icons" slot-scope="{ row, index }")
                .languages__icons
                    img.languages__icon(v-if="key !== 'delete'" v-for="(icon, key) in icons" :src="icon.icon" @click="makeAction(index, key)" :class="{'languages_opacity': isActive(key, index)}")
    .languages__pagination
        .languages__prev(@click="prevPage" :class="{'languages_non-active': !hasPrev}")
            span.languages__title Previous page
        .languages__page-numbers(v-for="(arr, num) in langPaging")
            span.languages__page-number(@click="toPage(num)" :class="{'languages_current': num === currentPage-1}") {{ num + 1 }}
        .languages__next(@click="nextPage" :class="{'languages_non-active': !hasNext}") 
            span.languages__title Next page
</template>

<script>
import SettingsTable from "./SettingsTable";
import { mapGetters, mapActions } from "vuex";
import ClickOutside from "vue-click-outside";
import crudIcons from "@/mixins/crudIcons";

export default {
    mixins: [crudIcons],
    data() {
        return {
            fields: [
                {label: "Icon", headerKey: "headerIcon", key: "icon", width: "12%", padding: "0"},
                {label: "Name", headerKey: "headerName", key: "name", width: "28%", padding: "0"},
                {label: "Symbol", headerKey: "headerSymbol", key: "symbol", width: "12%", padding: "0"},
                {label: "ISO 639-1", headerKey: "headerIso1", key: "iso1", width: "12%", padding: "0"},
                {label: "ISO 639-2", headerKey: "headerIso2", key: "iso2", width: "12%", padding: "0"},
                {label: "Active", headerKey: "headerActive", key: "active", width: "12%", padding: "0"},
                {label: "", headerKey: "headerIcons", key: "icons", width: "12%", padding: "0"},
            ],
            languages: [],
            currentPage: 1,
            currentActive: -1,
            file: [],
            imageData: "",
            isTooltip1: false,
            isTooltip2: false,
            areErrors: false,
            errors: []
        }
    },
    methods: {
        toPage(num) {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            this.currentPage = num + 1;
        },
        nextPage() {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            if (this.currentPage < this.pagesTotal) {
                this.currentPage = this.currentPage + 1;
            }
        },
        prevPage() {
            if(this.currentActive !== -1) {
                return this.isEditing();
            }
            if (this.currentPage > 1) {
                this.currentPage = this.currentPage - 1;
            } else {
                return true;
            }
        },
        toggleTooltip(iso) {
            if(iso === "iso1") {
                this.isTooltip1 = !this.isTooltip1;
                this.isTooltip2 = false;
            } else {
                this.isTooltip2 = !this.isTooltip2;
                this.isTooltip1 = false;
            }
        },
        closeTooltip(prop) {
            this[prop] = false;
        },
        toggleActive(index) {
            if(this.currentActive !== index) return;
            this.languages[index].active = !this.languages[index].active;
        },
        async makeAction(index, key) {
            if(this.currentActive !== -1 && this.currentActive !== index) {
                return this.isEditing();
            }
            if(key === "save") {
                await this.saveChanges(index);
                this.cancel();
            }
            if(key === "edit") {
                this.currentActive = index;
            }
            if(key === "cancel") {
                if(this.currentActive === -1) return;
                this.cancel();
                await this.getLanguages();
            }
        },
        closeErrors() {
            this.areErrors = false;
        },
        async saveChanges(index) {
            if(this.currentActive === -1) return;
            const id = this.languages[this.currentActive]._id;
            let newData = new FormData();
            const isActive = this.languages[this.currentActive].active ? 1 : "";
            newData.append("flag", this.file[0]);
            newData.append("icon", this.languages[this.currentActive].icon);
            newData.append("active", isActive);
            try {
                await this.$http.put(`/api/languages/${id}`, newData);
                await this.getLanguages();
                this.alertToggle({message: "Information updated.", isShow: true, type: "success"})
            } catch(err) {
                this.alertToggle({message: "Error on saving language.", isShow: true, type: "error"});
            }
        },
        uploadFile(event) {
            this.file.push(event.target.files[0]);
            const input = event.target;
            if (input.files && input.files[0]) {
                let reader = new FileReader();
                reader.onload = (e) => {
                this.imageData = e.target.result;
                }
                reader.readAsDataURL(input.files[0]);
            }
        },
        cancel() {
          this.currentActive = -1;
          this.file = [];
          this.imageData = "";
        },
        async getLanguages() {
            try {
                const result = await this.$http.get("/api/languages"); 
                this.languages = result.body.sort((a, b) => {
                    if (a.lang < b.lang) return -1;
                    if (a.lang > b.lang) return 1;
                });    
            } catch(err) {
                this.alertToggle({message: "Error on getting languages.", isShow: true, type: "error"});
            }
        },
        ...mapActions({
            alertToggle: "alertToggle"
        }),
    },
    computed: {
        hasNext() {
            return this.currentPage < this.pagesTotal ? 1 : 0;
        },
        hasPrev() {
            return this.currentPage > 1 ? 1 : 0;
        },
        pagesTotal() {
            let number = 0;
            if (this.langPaging.length) {
                number = this.langPaging.length;
            }
            return number;
        },
        langPaging() {
            let result = [[]];
            let page = [];
            if (this.languages.length) {
                result = [];
                for (let i = 14; i < this.languages.length; i = i + 15) {
                    page = [];
                    for (let j = i - 14; j <= i; j++) {
                        page.push(this.languages[j]);
                    }
                    result.push(page);
                    if (i + 15 > this.languages.length) {
                        page = [];
                        for (let m = i + 1; m < this.languages.length; m++) {
                        page.push(this.languages[m]);
                        }
                        result.push(page);
                    }
                }
            }
            return result;
        }
    },
    components: {
        SettingsTable,
    },
    directives: {
        ClickOutside
    },
    mounted() {
        this.getLanguages();
    }
}
</script>

<style lang="scss" scoped>
@import "../../assets/scss/colors.scss";

.languages {
    width: 933px;
    background-color: $white;
    padding: 20px;
    box-shadow: 0 0 10px $main-color;
    position: relative;
    &__table {
        height: 550px;
    }
    &__header {
        position: relative;
    }
    &__header-icon {
        position: absolute;
        top: -2px;
        left: 60%;
        cursor: pointer;
    }
    &__tooltip {
        position: relative;
        top: -42px;
        left: -50%;
        color: $orange;
        width: 100px;
    }
    &__data {
        height: 32px;
        padding: 0 5px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        position: relative;
    }
    &__checkbox {
        width: 22px;
        height: 22px;
        cursor: pointer;
        opacity: 0.5;
    }
    &_centered {
        justify-content: center;
    }
    &__flag, &__file-preview {
        width: 32px;
        height: 22px;
    }
    &__pagination {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 10px;        
    }
    &__prev, &__next {
        text-align: center;
        padding: 5px;
        width: 130px;
        border: 1px solid $main-color;
        margin: 5px;
        cursor: pointer;
    }
    &_non-active {
        opacity: 0.4;
    }
    &__page-numbers {
        margin-left: 10px;
        margin-right: 10px;
    }
    &__page-number {
        cursor: pointer;
        margin-right: 5px;
        &:first-child {
            margin-left: 5px;
        }
    }
    &_current {
        border: 1px solid gold;
        padding: 4px;
    }
    &__icons {
        padding-top: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    &__icon {
        cursor: pointer;
        opacity: 0.5;
        margin-right: 8px;
    }
    &_opacity {
        opacity: 1;
    }
    &__upload {
        position: relative;
        background: url("../../assets/images/Other/upload-icon.png");
        background-position-x: right;
        background-repeat: no-repeat;
        width: 40%;
        height: 22px;
        overflow: hidden;
    }
    &__load-file {
        width: 33px;
        height: 22px;
        border: none;
        outline: none;
        opacity: 0;
        z-index: 2;
        position: absolute;
        left: 15px;
        cursor: pointer;
    }
    &_no-back {
        background: none;
    }
    &__file-preview {
        margin-left: 10px;
    }
    &_active {
        box-shadow: inset 0 0 8px $brown-shadow;
    }
}

</style>