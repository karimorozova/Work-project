<template lang="pug">
    .filesSelect
        .select__selected(:class='{errorActive: !projects[index].fileType.text && !projects[index].fileType.exist, savedDisable: projects[index].icons[0].status}')
            span {{ selectFile }}
            .icon(@click="showFiles")
                i.fa.fa-caret-down
        .drop(v-if="droppedFile && projects[index].icons[1].status")
            span.drop_item(@click="changeFile(typeIndex, index)" v-for="(type, typeIndex) in fileType") {{ type }}
</template>

<script>
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
            fileType: ["Images", "Files", "URLs"],
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
    }
}
</script>

<style>

</style>
