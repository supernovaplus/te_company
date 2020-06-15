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

    const div = cel(["div", {className: "pays"}]);

    
    staff_keys.forEach(staff_key => {

        const paybox = cel(["div",{className: "paybox"}]);
        

        paybox.appendChild(cel(["p",{innerText: "EMPLOYEE => " + staff_key, className: "phead"}]))

        let lastType;
        staff_data[staff_key].forEach(data => {
            if(!lastType || lastType !== data.newtype){
                paybox.appendChild(cel(["hr"]));
                paybox.appendChild(cel(["p",{innerText: data.newtype}]));
                lastType = data.newtype;
            }

            const lele = Object.entries(data).map(k => `${k[0]} => ${k[1]}`);
            console.log(lele);
            paybox.appendChild(cel("p",{innerText: lele.join("\n")}));
        })


        div.appendChild(paybox);
    })

    root.appendChild(div);


}