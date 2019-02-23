export default ({ route, redirect }) => {
    if(route.name === "index") {
        return redirect("/dashboard")
    }
}