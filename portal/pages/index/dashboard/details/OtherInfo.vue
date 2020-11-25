<template lang="pug">
    .other-info
        .other-info__header
            .other-info__photo
                img.other-info__image(v-if="project.accountManager && project.accountManager.photo" :src="domain+project.accountManager.photo")
                img.other-info__image.other-info_no-photo(v-else src="../../../../assets/images/man.png")
            .other__info__item
                LabelValue(title="Account Manager" :value="fullManagerName" customClass="pair_column-flex")
        .other-info__item
            LabelValue(title="Services" :value="getServices()" customClass="pair_column-flex align-centered")
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
            return moment(date).format("DD-MM-YYYY")
        },
        getServices() {
            if(this.project.status === 'Requested') {
                return this.project.service.title;
            }
            return this.getProjectServices();
        },
        getProjectServices() {
            let projectServices = "";
            const { tasks } = this.project;
            const tasksServices = tasks.map(item => item.service._id).filter((item, index, arr) => {
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
            if(this.project.accountManager) {
                result = this.project.accountManager.firstName + " " + this.project.accountManager.lastName;
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
    height: 350px;
    box-sizing: border-box;
    padding: 20px 0;
    &__header {
        width: 100%;
        padding: 0 20px 20px;
        box-sizing: border-box;
        border-bottom: 1px solid $light-brown;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    &__photo {
        width: 44px;
        height: 44px;
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
