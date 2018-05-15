<template lang="pug">
    .allProjects
        .allProjects__dropMenu(:class="{opened: openAll}")
            .dropSelect(@click="showAllProjects") All Projects
                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openAll}")
            .dropItem(v-if="openAll")
                .dropItem__filters
                    .filterBlock
                        .filterBlock__item.request
                            label Request On
                            input(type="text" v-model="requestDateFilter")
                            img(src="../../assets/images/calendar.png")
                        .filterBlock__item.projectName
                            label Project Name
                            input(type="text" v-model="projectNameFilter")
                        .filterBlock__item.sourceLangs
                            label Source Langs
                            span(v-model="sourceLangsFilter" @click="sourceLangOpen")
                                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openSourceLangs}")
                    .filterBlock
                        .filterBlock__item.deadline
                            label Deadline
                            input(type="text" v-model="deadlineFilter")
                            img(src="../../assets/images/calendar.png")                            
                        .filterBlock__item.projectId
                            label Project ID
                            input(type="text" v-model="pojectIdFilter")
                        .filterBlock__item.sourceLangs
                            label Target Langs
                            span(v-model="tergetLangsFilter" @click="targetLangOpen")
                                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openTargetLangs}")                                
                    .filterBlock
                        .filterBlock__item.status
                            label Status
                            span(v-model="statusFilter" @click="statusOpen")
                                img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseImage: openStatus}")                                
                .dropItem__table
                    Projectstable

</template>

<script>
import Projectstable from "./Projectstable";

export default {
    data() {
        return {
            requestDateFilter: '',
            projectNameFilter: '',
            deadlineFilter: '',
            pojectIdFilter: '',
            sourceLangsFilter: '',
            tergetLangsFilter: '',
            statusFilter: '',
            openAll: false,
            openSourceLangs: false,
            openTargetLangs: false,
            openStatus: false           
        }
    },
    methods: {
        showAllProjects() {
            this.openAll = !this.openAll
        },
        sourceLangOpen() {
            this.openSourceLangs = !this.openSourceLangs
        },
        targetLangOpen() {
            this.openTargetLangs = !this.openTargetLangs
        },
        statusOpen() {
            this.openStatus = !this.openStatus
        }
    },
    components: {
        Projectstable
    }
}
</script>

<style lang="scss">
    .allProjects {
        width: 89%;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        padding-top: 180px;
        position: absolute;
        left: 50%;
        margin-left: -40%;
        &__dropMenu {
            max-width: 919px;
            width: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            border: 0.4px solid #67573e;
            border-radius: 18px;
            box-shadow: 0 3px 13px rgba(103, 87, 62, 0.5);
            margin-right: 4%;
            margin-bottom: 10px;
            padding: 0 14px;
            color: #67573e;
            transition: all 0.2s;           
            .dropSelect {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                border-radius: 18px;
                padding: 14px;
                cursor: pointer;
                    .reverseImage {
                        transform: rotate(180deg);
                    }
            }
            .dropItem {
                width: 100%;
                &__filters {
                    display: flex;
                    justify-content: space-between;
                    .filterBlock {
                        width: 30%;
                        &__item {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 15px;
                            input, span {
                                padding: 5px;
                                border: 1px solid #67573e;
                                width: 175px;
                                height: 20px;
                            }
                            span {
                                position: relative;
                                overflow: hidden;
                                cursor: pointer;
                                img {
                                    position: absolute;
                                    top: 0px;
                                    right: 0;
                                    background-color: white;
                                    padding: 8px;
                                }
                                .reverseImage {
                                    transform: rotate(180deg);
                                }
                            }
                        }
                        .request, .deadline {
                            position: relative;
                            img {
                                position: absolute;
                                width: 19px;
                                right: 2px;
                                padding: 4px;
                                background-color: white;
                                cursor: pointer;
                            }
                        }
                        .status {
                            justify-content: flex-start;
                            label {
                                margin-right: 10px;
                            }
                        }
                    }
                }
                &__table {
                    max-height: 500px;
                    overflow: scroll;
                }
            }
        }
        .opened {
            border-radius: 0;
            border: none;
            margin-bottom: 0;
        }
        
    }
</style>
