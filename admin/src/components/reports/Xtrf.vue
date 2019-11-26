<template lang="pug">
    .xtrf
        .xtrf__item TIER
            .xtrf__upload
                input.xtrf__input(type="file" @change="uploadFiles" multiple)
            .xtrf__dates
                label.xtrf__label(for="start") Start
                input.xtrf__date(name="start" type="date" v-model="start")
                label.xtrf__label(for="end") End
                input.xtrf__date(name="end" type="date" v-model="end")
            .xtrf__industries
                .xtrf__text(v-for="indus in industries" @click="setIndustry(indus)" :class="{'xtrf_active': indus === industry}") {{ indus }}
            Button(value="Save Tier" @clicked="saveTier")
        .xtrf__item LQA
            .xtrf__upload
                input.xtrf__input(type="file" @change="uploadFiles")
            .xtrf__dates
                input.xtrf__date(type="date" v-model="start")
            Button(value="Save Lqa" @clicked="saveLqa")
        .xtrf__item Benchmark
            .xtrf__upload
                input.xtrf__input(type="file" @change="uploadFiles")
            .xtrf__dates
                input.xtrf__date(type="date" v-model="start")
            Button(value="Save Prices" @clicked="savePrices")
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
        async saveTier() {
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
        },
        async saveLqa() {
            let formData = new FormData();
            for(let file of this.files) {
                formData.append("reportFiles", file);
            } 
            try {
                const result = await this.$http.post("/reportsapi/xtrf-lqa", formData);
                console.log(result);
            } catch(err) {
                console.log(err);
            }
        },
        async savePrices() {
            let formData = new FormData();
            for(let file of this.files) {
                formData.append("reportFiles", file);
            } 
            try {
                const result = await this.$http.post("/reportsapi/xtrf-prices", formData);
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
    &__upload {
        margin: 10px 0;
    }
    &__input, &__industries {
        margin-bottom: 10px;
    }
    &__text {
        border: 1px solid black;
        border-radius: 5px;
        margin: 5px 0;
        padding: 5px;
        box-sizing: border-box;
        text-align: center;
        cursor: pointer;
    }
    &__dates {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    }
    &_active {
        background-color: green;
        color: white;
    }
    &__item {
        margin-bottom: 40px;
    }
}

</style>
