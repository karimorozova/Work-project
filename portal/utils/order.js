export const appendData = (orderDetails) => {
    let details = new FormData();
    for(let key in orderDetails) {
        if(key !== 'detailFiles' && key !== 'refFiles') {
            details.append(key, orderDetails[key])
        }
    }
    if(orderDetails.detailFiles && orderDetails.detailFiles.length) {
        for(let file of orderDetails.detailFiles) {
            details.append('detailFiles', file);
        }
    }
    if(orderDetails.refFiles && orderDetails.refFiles.length) {
        for(let file of orderDetails.refFiles) {
            details.append('refFiles', file);
        }
    }

    return details;
}