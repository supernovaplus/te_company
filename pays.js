const root = document.getElementById("root");
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
    const staff_data = {};

    root.appendChild(document.createElement("hr"))
    data.vauc.forEach(el=>root.appendChild(cel(["p",{innerText: JSON.stringify(el)}])));
    root.appendChild(document.createElement("hr"))
    data.pays_t.forEach(el=>root.appendChild(cel(["p",{innerText: JSON.stringify(el)}])));
    root.appendChild(document.createElement("hr"))
    root.appendChild(document.createElement("hr"))

    data.vauc.forEach(v=>{
        if(staff_data[v.accepted_by_id] === undefined) staff_data[v.accepted_by_id] = [];
        v.newtype = "vouchers";
        staff_data[v.accepted_by_id].push(v);
    });

    data.pays_t.forEach(v=>{
        if(staff_data[v.manag_id] === undefined) staff_data[v.manag_id] = [];
        v.newtype = "pays";
        staff_data[v.manag_id].push(v);
    });

    const staff_keys = Object.keys(staff_data).sort((a,b) => a - b);
    console.log(staff_data);
    if(staff_keys.length === 0){
        root.innerHTML = "All payments solved";
        return;
    }

    const table = cel(["table",{className: "paytable"}]);
    
    staff_keys.forEach(staff_key => {
        const tbody = cel(["tbody",{className: "pay"},["tr",
            ["th",{innerText: "EMPLOYEE => " + staff_key, colspan: 3}], 
            ["th",["input", {type: "button", value: "submit"}]]]]);

        let lastType;
        staff_data[staff_key].forEach(data => {
            if(!lastType || lastType !== data.newtype){
                tbody.appendChild(cel("tr",...Object.keys(data).map(k => ["th", {innerText: k}])));
                lastType = data.newtype;
            }

            tbody.appendChild(cel("tr",...Object.values(data).map(k => ["td", {innerText: k}])));
        })


        table.appendChild(tbody);
        table.appendChild(cel(["tbody",{className: "spacer"}]));
    })

    root.appendChild(table);


}