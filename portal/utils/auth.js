export const getClientTokenFromHeaders = (req) => {
    if(!req.headers.cookie) return
    const clientToken = req.headers.cookie.replace(/(?:(?:^|.*;\s*)client\s*\=\s*([^;]*).*$)|^.*$/, "$1");
    return clientToken;
}

export const getClientTokenFromDocument = () => {
    const matches = document.cookie.match(new RegExp(
        "(?:^|; )" + "client".replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    const clientToken = matches ? decodeURIComponent(matches[1]) : undefined;
    return clientToken;
}