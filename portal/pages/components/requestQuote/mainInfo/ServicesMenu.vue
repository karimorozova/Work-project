<template lang="pug">
    .services-menu
        .services-menu__title(@click="toggle" :class="{'services-menu_opacity-07': isOpacity}") {{ selectedService.title }}
            img.service-menu__arrow(src="../../../../assets/images/arrow_open.png" :class="{'services-menu_rotate': isOpen}")
        .services-menu__drop(v-if="isOpen")
            template(v-for="(service, index) in services" )
                .services-menu__item.left-aligned(
                    v-if="service && !isEven(index)" 
                    @click="selectService(service)" 
                    :class="{'services-menu_active': isActive(service)}") {{ service.title }}
                .services-menu__item(
                    v-if="service && isEven(index)" 
                    @click="selectService(service)" 
                    :class="{'services-menu_active': isActive(service)}") {{ service.title }}
</template>

<script>

export default {
    props: {
        selectedService: {
            type: Object,
            default: () => { return {title: 'Select'} }
        }
    },
    data() {
        return {
            isOpen: false,
            services: []
        }
    },
    methods: {
        isActive(service) {
            return this.selectedService.title === service.title;
        },
        toggle() {
            this.isOpen = !this.isOpen;
        },
        isEven(index) {
            return index % 2 === 0;
        },
        async getServices() {
            try {
                const result = await this.$axios.get("/api/services?filter=active");
                this.services = result.data.filter(item => item.active);
            } catch(err) {
                console.log(err);
            }
        },
        selectService(service) {
            this.$emit("selectService", { service });
        }
    },
    computed: {
        isOpacity() {
            return this.selectedService.title === 'Select';            
        }
    },
    created() {
        this.getServices();
    }
}
</script>

<style lang="scss" scoped>
@import "../../../../assets/scss/colors.scss";

.services-menu {
    width: 100%;
    box-shadow: 0 2px 10px $deep-brown;
    border-radius: 12px;
    &:hover {
        box-shadow: 0 1px 10px $deep-brown;
    }
    &__title {
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        cursor: pointer;
    }
    &_opacity-07 {
        opacity: 0.7;
    }
    &_rotate {
        transform: rotate(180deg);
    }
    &__drop {
        padding: 15px 10px;
        box-sizing: border-box;
        border-top: 1px solid $light-brown;
        display: flex;
        flex-wrap: wrap;
        align-items: center
    }
    &__item {
        font-size: 12px;
        width: 50%;
        border: 1px solid $main-color;
        border-radius: 3px;
        box-sizing: border-box;
        padding: 5px;
        cursor: pointer;
        &:hover {
            background-color: $main-color;
            color: $white;
        }
    }
    &_active  {
        background-color: $light-brown;
        font-weight: 600;
    }
}

</style>
