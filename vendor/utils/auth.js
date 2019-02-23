export const getVendorTokenFromHeaders = (req) => {
    if(!req.headers.cookie) return
    const vendorToken = req.headers.cookie.replace(/(?:(?:^|.*;\s*)vendor\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    return vendorToken;
}

export const getVendorTokenFromDocument = () => {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + "vendor".replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    const vendorToken = matches ? decodeURIComponent(matches[1]) : undefined;
    return vendorToken;
}