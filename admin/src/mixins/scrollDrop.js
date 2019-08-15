export default {
    data() {
        return {
            bodyClass: '.table__tbody'
        }
    },
    methods: {
        scrollDrop({drop, offsetTop, offsetHeight}) {
            let querySelector = this.bodyClass;
            if(this.ratesBodyClass) {
                querySelector = `.${this.ratesBodyClass}`
            }
            let tbody = document.querySelector(querySelector);
            if(this.isScrollDrop(drop, tbody)) {
                setTimeout(() => {
                    const offsetBottom = offsetTop + offsetHeight*2;
                    const scrollBottom = tbody.scrollTop + tbody.offsetHeight;                    
                    if (offsetBottom > scrollBottom) {
                        tbody.scrollTop = offsetBottom + offsetHeight*2 - tbody.offsetHeight;
                    }
                }, 100);
            }
        },
        isScrollDrop(drop, elem) {
            return drop;
        }
    }
}