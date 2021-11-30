import { getClientTokenFromHeaders, getClientTokenFromDocument } from "~/utils/auth.js";
import { setPreviousLink } from "../store/actions"

export default function ({ store, req, redirect, route }) {
    if(route.name === "request-quote" || route.name === "forgot") return
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