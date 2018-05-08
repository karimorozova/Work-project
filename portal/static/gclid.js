window.onload = function getGclid() {        
    document.getElementById("00N1r00000Fie4G").value = (name = new RegExp('(?:^|;\\s*)gclid=([^;]*)').exec(document.cookie)) ? 
    name.split(",")[1] : ""; }