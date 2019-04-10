<template lang="pug">
    .other-info
        .other-info__header
            .other-info__photo
                img.other-info__image(v-if="project.projectManager && project.projectManager.photo" :src="domain+project.projectManager.photo")
                img.other-info__image.other-info_no-photo(v-else src="../../../../assets/images/man.png")
            .other__info__item
                LabelValue(title="Project Manager" :value="fullManagerName" customClass="pair_column-flex")
        .other-info__item
            LabelValue(title="Services" :value="getServices()" customClass="pair_column-flex")
        .other-info__item
            LabelValue(v-if="project.industry" title="Industry" :value="project.industry.name" customClass="pair_column-flex")
        .other-info__item
            LabelValue(title="Requested On" :value="getFormattedDate(project.start)" customClass="pair_column-flex")
        .other-info__item
            LabelValue(title="Suggested Deadline" :value="getFormattedDate(project.deadline)" customClass="pair_column-flex")
</template>

<script>
import LabelValue from "~/components/LabelValue";
import moment from "moment";
import { mapGetters, mapActions } from "vuex";

export default {
    data() {
        return {
            domain: ""
        }
    },
    methods: {
        getFormattedDate(date) {
            return moment(this.project.createdAt).format("DD-MM-YYYY")
        },
        getServices() {
            let projectServices = "";
            const { tasks } = this.project;
            const tasksServices = tasks.map(item => item.service).filter((item, index, arr) => {
                return arr.indexOf(item) === index;
            });
            projectServices = this.allServices.reduce((init, cur) => {
                if(tasksServices.indexOf(cur._id) !== -1) {
                    init = !init ? init + cur.title : init + ', ' + cur.title
                }
                return init;
            }, "")
            return projectServices;
        }
    },
    computed: {
        ...mapGetters({
            project: "getSelectedProject",
            allServices: "getAllServices"
        }),
        fullManagerName() {
            let result = "";
            if(this.project.projectManager) {
                result = this.project.projectManager.firstName + " " + this.project.projectManager.lastName;
            }
            return result;
        }
    },
    components: {
        LabelValue
    },
    mounted() {
        this.domain = process.env.domain;
    }
}
</script>


<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.other-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    min-height: 350px;
    height: 100%;
    box-sizing: border-box;
    &__header {
        width: 100%;
        padding: 0 30px 20px;
        box-sizing: border-box;
        border-bottom: 1px solid $light-brown;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    &__photo {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px solid $light-brown;
        margin-bottom: 10px;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        align-items: center;
        overflow: hidden;

    }
    &__image {
        max-width: 33px;
        max-height: 33px;
        object-fit: contain;
    }
    &_no-photo {
        margin-right: 2px;
    }
}

</style>
