export const getVendorTokenFromCookie = (req) => {
    if(!req.headers.cookie) return
    const vendorToken = req.headers.cookie.replace(/(?:(?:^|.*;\s*)vendor\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    return vendorToken;
}

export const getVendorTokenFromLocalStorage = () => {
    const vendorToken = localStorage.getItem("token");
    return vendorToken;
}