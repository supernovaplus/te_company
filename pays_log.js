const root = document.getElementById("root");
root.className = "pays"
const data = {};

fetch("api_v1_get.php?q=employees,vauc,pay_t")
.then(res=>res.json())
.then(res=>{
    if(res.error !== null){
        root.innerHTML = res.error;
    }else if(res.employees && res.employees.length > 0){
        for (const key in data) { delete key; }
        Object.assign(data, res);
        loaded();
    }else{
        root.innerHTML = "Database Error #1";
    };
}).catch(err=>{
    root.innerHTML = "Database Error #2";
    console.log(err);
});


function loaded(){
    root.innerHTML = "";

}