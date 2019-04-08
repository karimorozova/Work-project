import { getClientTokenFromHeaders, getClientTokenFromDocument } from "~/utils/auth.js";

export default function ({ store, req, redirect, route }) {
    if(route.name === "request-quote") return
    if(process.server && !req) return
    const token = process.server ? getClientTokenFromHeaders(req) : getClientTokenFromDocument();
    store.commit("SET_TOKEN", token);
    if(!token) {
        if(route.path === "/login") {
        } else {
            return redirect("/login")
        }
    }
}