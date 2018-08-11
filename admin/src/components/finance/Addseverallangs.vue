<template lang="pug">
.addSeveral-wrap
    .add-several
        .add-several__language
            .title
                span Source language
            .list
            .arrows
                .arrows__right
                    img(src="../../assets/images/right.png")
                .arrows__left
                    img(src="../../assets/images/left.png")
            .list
        .add-several__language
            .title
                span Target language
            .list
            .arrows
                .arrows__right
                    img(src="../../assets/images/right.png")
                .arrows__left
                    img(src="../../assets/images/left.png")
            .list
        .add-several__service-industry
            .title.service-title
                span Service 
            .dropSelect(v-click-outside="outClick")
                .select
                    span.selected.no-industry Options
                    .arrowButton
                        img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: dropped}")
                .drop(v-if="dropped")
                    .drop__item(v-for="(status, index) in statuses" @click="changeStatus(index)" :class="{chosen: status == selectedStatus}")
                        span {{ status }}
            .title
                span Industry
            .dropSelect(v-click-outside="outClick")
                .select
                    span.selected.no-industry Options
                    .arrowButton
                        img(src="../../assets/images/open-close-arrow-brown.png" :class="{reverseIcon: dropped}")
                .drop(v-if="dropped")
                    .drop__item(v-for="(status, index) in statuses" @click="changeStatus(index)" :class="{chosen: status == selectedStatus}")
                        span {{ status }}
        .add-several__service-rates
        .submit-button
            input.submit-button__button(type="submit" @submit.prevent="toBack" value="Submit")
</template>

<script>
export default {
    data() {
        return {

        }
    },
    methods: {
        toBack() {
            this.$emit('toBack');
        }
    }
}
</script>

<style lang="scss" scoped>

.addSeveral-wrap {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
}

.add-several {
    padding: 40px 40px 20px 30px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-shadow: 0 5px 15px rgba(85, 55, 0, 0.5);
    border-radius: 3px;
    background-color: #FFF;
    width: 690px;
    &__language, &__service-industry {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 30px;
        .service-title {
            width: 100px;
            margin-right: 18px;
            display: flex;
            justify-content: center;
        }
    }
}

.list {
    height: 187px;
    width: 191px;
    border: 1px solid #67573E;
    border-radius: 10px;
}

.arrows {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 80px;
    &__left, &__right {
        img {
            cursor: pointer;
        }
    }
}

.drop-menu {
    width: 191px;
    height: 22px;
    border-radius: 4px;
    border: 1px solid #67573E;
}

.submit-button {
    &__button {
        background-color: #ff876c;
        color: white;
        font-size: 18px;
        width: 164px;
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
        border: none;
        outline: none;
        box-shadow: 0 5px 10px rgba(103, 87, 62, 0.6);
        margin-top: 15px;
        cursor: pointer;
    }
}

</style>
