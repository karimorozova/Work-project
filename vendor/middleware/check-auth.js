import { getVendorTokenFromHeaders, getVendorTokenFromDocument } from "~/utils/auth.js";
import { setPreviousLink } from "../store/actions"

export default function ({ store, req, redirect, route }) {
    if(route.name === "application"  || route.name === "forgot") return
    if(process.server && !req) return
    const token = process.server ? getVendorTokenFromHeaders(req) : getVendorTokenFromDocument();
    store.commit("SET_TOKEN", token);
    if(!token) {
        if(route.path === "/login") {
        } else {
            setPreviousLink(store, route.path)
            return redirect("/login")
        }
    }
}