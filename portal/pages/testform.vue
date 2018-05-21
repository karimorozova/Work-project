<template lang="pug">
    .mainWrap
        button(@click="showProd") Show
        button(@click="changeProd") Change
        p(v-if="show" v-for="prod in products") {{ prod }}
</template>


<script>

export default {
    data() {
        return {
            show: false
        }
    },
    methods: {
        showProd() {
            this.show = !this.show;
        },
        changeProd() {
        this.$store.dispatch('loadProducts', ['dwwd','asdaswedwd', 'fewreewerwe', 'da22222sdad', 'poikpfo', 'oiuhoekrc', 'ikuerhiujneck'])
            
        }
    },
    computed: {
        products() {
            return this.$store.state.products;
        }
    },
    created() {
        // this.$store.commit('loadProducts', ['aasd','asdasd', 'fewrwerwe', 'dasdad'])
    }
};
</script>

<style lang="scss">

</style>

