const root = document.getElementById("root");
const data = {};

fetch("api_v1.php?data=1")
.then(res=>res.json())
.then(res=>{
    if(res.error !== null){
        root.innerHTML = res.error;

    }else if(res.employees.length > 0){
        Object.assign(data, res);
        loaded();
    }else{
        root.innerHTML = "error 2";
    };
}).catch(err=>{
    root.innerHTML = "error 1";
    console.log(err);
});


function loaded(){
    


}