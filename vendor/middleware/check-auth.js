import { getVendorTokenFromHeaders, getVendorTokenFromDocument } from "~/utils/auth.js";

export default function ({ store, req, redirect, route }) {
    if(route.name === "application") return
    if(process.server && !req) return
    const token = process.server ? getVendorTokenFromHeaders(req) : getVendorTokenFromDocument();
    store.commit("SET_TOKEN", token);
    if(!token) {
        if(route.path === "/login") {
        } else {
            return redirect("/login")
        }
    }
}