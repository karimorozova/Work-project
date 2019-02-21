import { getVendorTokenFromCookie, getVendorTokenFromLocalStorage } from "~/utils/auth.js";

export default function ({ req, redirect, route }) {
    if(route.name === "application") return
    if(process.server && !req) return
    const token = process.server ? getVendorTokenFromCookie(req) : getVendorTokenFromLocalStorage();
    if(!token) {
        redirect("/login")
    }
}