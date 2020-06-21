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
    const staff_data = {};

    data.vauc.forEach(v=>{
        if(staff_data[v.accepted_by_id] === undefined) {
            staff_data[v.accepted_by_id] = {"vouchers": {}, "pays": 0};
        }

        if(staff_data[v.accepted_by_id]["vouchers"][v.name] === undefined){
            staff_data[v.accepted_by_id]["vouchers"][v.name] = {
                name: v.name,
                sum: +v.sum,
                amount: +v.amount
            }
        }else{
            staff_data[v.accepted_by_id]["vouchers"][v.name]["sum"] += +v.sum;
            staff_data[v.accepted_by_id]["vouchers"][v.name]["amount"] += +v.amount;
        }
    });

    data.pays_t.forEach(v=>{
        if(staff_data[v.manag_id] === undefined) staff_data[v.manag_id] = {"vouchers": {}, "pays": 0};
        staff_data[v.manag_id]["pays"] += +v.sum;
    });

    console.log(staff_data);

    const staff_keys = Object.keys(staff_data).sort((a,b) => a - b);
    if(staff_keys.length === 0){
        root.innerHTML = "All payments solved";
        return;
    }

    staff_keys.forEach(key => {
        const found = data.employees.find(em=>em.id == key);
        const paybox = cel(["div",{className: "paybox"}]);
        paybox.appendChild(cel(["p",{innerText: `${found ? found.name : "?"} [ID: ${key}]`, className: "hd"}]))

        if(staff_data[key]["pays"] !== 0){
            paybox.appendChild(cel(["p",{innerText: `Pays: ${staff_data[key]["pays"].toLocaleString('us')}$`}]))
        }

        if(Object.keys(staff_data[key]["vouchers"]).length > 0){
            paybox.appendChild(cel(["p",{innerText: `Vouchers:\n` + 
            Object.values(staff_data[key]["vouchers"]).map(obj => `${obj.name} | ${obj.amount.toLocaleString('us')}v | ${obj.sum.toLocaleString('us')}$\n`).join("")
        }]))

        }

        root.appendChild(paybox);
    })
}