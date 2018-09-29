<template lang="pug">
.sidebar
    span.sidebar__title(v-if="title") {{ title }}
    .sidebar__inner
      .sidebar__col(v-for="(link, index) in links") {{ link }}
</template>

<script>
export default {
    props: {
        links: {
            type: Array
        },
        title: {
            type: String
        }
    }
}
</script>

<style lang="scss" scoped>
.sidebar {
    height: 100%;
    background-color: #fff;
    width: 175px;
    box-shadow: 7px 1px 10px rgba(103, 87, 62, 0.4);
    display: flex;
    flex-direction: column;
    font-family: MyriadPro;
    color: #67573e;
    font-size: 22px;
    transition: all 1s;
    &__title {
        display: flex;
        justify-content: center;
        padding: 44px 0;
        font-weight: 700;
    }
    &__inner {
        display: flex;
        flex-direction: column;
    }   
    &__col {
        display: flex;
        justify-content: center;
        border-top: 1px solid #c4beb6;
        border-bottom: 1px solid #c4beb6;
        padding: 5px 0;
        cursor: pointer;
        &:nth-child(2) {
            border: none;
        }
    }  
}
</style>
