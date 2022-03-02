import { getClientTokenFromHeaders, getClientTokenFromDocument } from "~/utils/auth.js";
import { setPreviousLink } from "../store/actions"

export default function ({ store, req, redirect, route }) {
    if(route.name === "request-quote" || route.name === "password-reset" || route.name === "password-reset-request") return
    if(process.server && !req) return
    const token = process.server ? getClientTokenFromHeaders(req) : getClientTokenFromDocument();
    store.commit("SET_TOKEN", token);
    if(!token) {
        if(route.path === "/login") {
        } else {
            !route.path.includes('robot') && setPreviousLink(store, route.path)
            return redirect("/login")
        }
    }
}