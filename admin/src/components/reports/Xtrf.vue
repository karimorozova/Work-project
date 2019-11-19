<template lang="pug">
    .xtrf
        .xtrf__upload
            input.xtrf__input(type="file" @change="uploadFiles" multiple)
        .xtrf__dates
            input.xtrf__date(type="date" v-model="start")
            input.xtrf__date(type="date" v-model="end")
        .xtrf__industries
            .xtrf__text(v-for="industry in industries" @click="setIndustry(industry)") {{ industry }}
        Button(value="Save" @clicked="save")
</template>

<script>
import Button from "@/components/Button";

export default {
    data() {
        return {
            files: [],
            start: new Date(),
            end: new Date(),
            industry: 'All',
            industries: ['All', 'Finance', 'Gaming']
        }
    },
    methods: {
        uploadFiles(e) {
            const { files } = e.target;
            if(files.length) {
                for(let file of files) {
                    const isExist = this.files.find(item => item.name === file.name);
                    if(!isExist) {
                        this.files.push(file);
                    }
                }
            }
        },
        setIndustry(industry) {
            this.industry = industry;
        },
        async save() {
            let formData = new FormData();
            formData.append("start", this.start);
            formData.append("end", this.end);
            formData.append("industry", this.industry);
            for(let file of this.files) {
                formData.append("reportFiles", file);
            } 
            try {
                const result = await this.$http.post("/reportsapi/xtrf-tier", formData);
                console.log(result);
            } catch(err) {
                console.log(err);
            }
        }
    },
    components: {
        Button
    }
}
</script>

<style lang="scss" scoped>

.xtrf {
    width: 200px;
    padding: 40px;
    &__input, &__industries {
        margin-bottom: 10px;
    }
    &__dates {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    }
}

</style>
