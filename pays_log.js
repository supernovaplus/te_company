const root = document.getElementById("root");
root.className = "pays_log"
const data = {};

fetch("api_v1_get.php?q=employees,pays_log")
.then(res=>res.json())
.then(res=>{
    if(res.error !== null){
        root.innerHTML = res.error;
    }else if(res.employees && res.employees.length > 0){
        for (const key in data) { delete key; }
        Object.assign(data, res);
        renderPage(1, true);
    }else{
        root.innerHTML = "Database Error #1";
    };
}).catch(err=>{
    root.innerHTML = "Database Error #2";
    console.log(err);
});


async function renderPage(pageid = 1, inital = false){
    if(!inital){
        root.innerHTML = "Loading";
        await fetch("api_v1_get.php?q=pays_log&page="+pageid)
        .then(res=>res.json())
        .then(res=>{
            data.pays_log = res.pays_log;
            data.pages = res.pages;
        });
    }

    if(!data.pages || data.pages[0]["count"] == 0 || data.pays_log.length === 0) {
        root.innerHTML = "Nothing to show";
        return;
    }

    root.innerHTML = "";
    const allentries = parseInt(data.pages[0]["count"]);

    const table = cel(["table"]);
    const filter = [];
    const keys = Object.keys(data.pays_log[0]).filter(k => !filter.includes(k) );
    
    table.appendChild(cel(["tr",  ...keys.map(k => ["th", {innerText: k}])]));

    for (let i = 0; i < data.pays_log.length; i++) {
        table.appendChild(cel([ "tr",   
            ...keys.map(k => ["td", {innerText: data.pays_log[i][k]}])]));
    }

    root.appendChild(table);
    if(allentries > pageid * 20){
        root.appendChild(cel(["input", {type: "button", value: "Next", onclick:()=>{
            renderPage(pageid + 1);
        }}]));
    }

    if(pageid > 1){
        root.appendChild(cel(["input", {type: "button", value: "Back", onclick:()=>{
            renderPage(pageid - 1);
        }}]));
    }

    root.appendChild(cel(["p", {innerText: `Page: ${pageid} / Total Records: ${allentries}`}]));

}
