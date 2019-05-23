<template lang="pug">
    .progress-line
        .progress-line__filler(:style="{width: progress + '%'}")
        .progress-line__tooltip 
            span.progress-line__value {{ progress }}%    
</template>

<script>
export default {
    props: {
        progress: {
            type: [Number, String]
        }
    }
}
</script>

<style lang="scss" scoped>
@import "../assets/scss/colors.scss";

.progress-line {
    width: 100%;
    height: 15px;
    border: 1px solid $brown-border;
    position: relative;
    box-sizing: border-box;
    padding: 1px;
    &__tooltip {
        position: absolute;
        width: 100%;
        opacity: 0;
        transition: all 0.2s;
        top: -1px;
        display: flex;
        justify-content: center;
    }
    &:hover {
        .progress-line__tooltip {
            opacity: 1;
        }
    }
    &__filler {
        background-color: $green;
        height: 100%;
        max-width: 100%;
    }
    &__value {
        background-color: $white;
        color: $main-color;
        font-size: 14px;
        padding: 0 3px;
    }
}

</style>
