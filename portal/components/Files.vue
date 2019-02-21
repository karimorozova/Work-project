<template lang="pug">
    .filesSelect
        .select__selected(:class='{errorActive: !projects[main].fileType.text && !projects[main].fileType.exist, savedDisable: projects[main].icons[0].status}')
            span {{ selectFile }}
            .icon(@click="showFiles")
                i.fa.fa-caret-down
        .drop(v-if="droppedFile && projects[main].icons[1].status" v-click-outside="outClick")
            span.drop_item(@click="changeFile(typeIndex, main)" v-for="(type, typeIndex) in fileType") {{ type }}
</template>

<script>
import ClickOutside from "vue-click-outside";

export default {
    props: {
        index: {
        type: Number
        },
        projects: {
        type: Array
        }
    },
    data () {
        return {
            droppedFile: false,
            fileType: ["URL", "HTML", "Image"],
            typeIndex: ''
        }
    },
    methods: {
        showFiles() {
            this.droppedFile = !this.droppedFile
        },
        changeFile(typeIndex, index) {
            this.typeIndex = typeIndex;
            this.$emit("addFile", {index, type: this.fileType[typeIndex]})
            this.droppedFile = false;
        },
        outClick() {
            this.droppedFile = false;
        }
    },
    computed: {
        selectFile() {
            if(!this.projects[this.index].fileType.text){
                return 'Options'
            } else {
                return this.projects[this.index].fileType.text
            }
        }
    },
    directives: {
        ClickOutside
    }
}
</script>

<style>

</style>
