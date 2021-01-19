export default {
    methods: {
        sortMixin(field, isAscSort, data ) {
            data.sort((a, b) => {
                const first = isAscSort ? a[field] : b[field]
                const second = isAscSort ? b[field] : a [field]

                if (first > second) {
                    return 1;
                } else if (first < second) {
                    return -1;
                } else if (first === second) {
                    return 0;
                }
            })
        }
    }
}