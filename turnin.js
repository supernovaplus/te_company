const root = document.getElementById("root")
root.className = "turnin";
const data = {};
let infobox, vouchersinputbox, finalbox;
const inputList = [];

fetch("api_v1_get.php?q=employees,ranks,vouchers")
.then(res=>res.json())
.then(res=>{
    if(res.error !== null){
        root.innerHTML = res.error; 
    }else if(res.employees && res.employees.length > 0){
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
    data.filtered_auto_ranks = Object.values(data.ranks.filter(r=>r["auto_vouchers"] === "1"))
    .map(r=>({
        ...r, 
        vouchers_required: parseInt(r.vouchers_required),
        employee_cut: parseInt(r.employee_cut),
    })).sort((a,b) => a.vouchers_required - b.vouchers_required);

    infobox = cel(["table"]);
    vouchersinputbox = cel(["div"]);
    finalbox = cel(["div"]);

    root.appendChild(cel(["div",["select",{onchange: (e)=>selectemployee(e.target.value)}, 
        ["option", {value: "-1", innerText: "Select employee"}],
        ...data.employees.map(em => ["option",{value: em.id, innerText: `NAME: ${em.name}#${em.ingameid} | EID: ${em.id} | VOUCHERS: ${em.vouchers} | RANK: ${em.rank}`}])
    ]]));

    root.appendChild(infobox);
    root.appendChild(vouchersinputbox);
    root.appendChild(finalbox);
}

function selectemployee(id){
    if(id == "-1") return;
    const found = data.employees.find(em => em.id == id);

    vouchersinputbox.innerHTML = "";
    infobox.innerHTML = "";
    finalbox.innerHTML = "";
    inputList.length = 0;

    if(!found) return;

    const keys = ["name", "ingameid", "auto_rank", "vouchers", "rank"];
    infobox.appendChild(cel(["tr", ...keys.map(k=>["tr",["th",{innerText: k}], ["td", {innerHTML: found[k]}]])]));

    for (let i = 0; i < data.vouchers.length; i++) {
        const v = data.vouchers[i];
        if(v.disabled === "1") continue;

        const newField = cel(["div",{innerText: `${v.name} | ${v.price}`}]);
        vouchersinputbox.appendChild(newField);

        const input = cel(["input", {type: "number", value: 0, name: v.id}]);
        newField.appendChild(input);

        inputList.push({input, voucher: v})
    }

    const calculateButton = cel(["input", {type: "button", value: "calculate", onclick: () => {
        handleCalculateButton(found, calculateButton);
    }}])

    vouchersinputbox.appendChild(calculateButton)
}


function handleCalculateButton(found, calculateButton){
    finalbox.innerHTML = "";
    let current_total_vouchers = parseInt(found["vouchers"]);
    let vouchers_from_input = 0;
    const body = [];
    
    for (const key in inputList) {
        const val = inputList[key].input.value;
        if(val && val > 0){
            inputList[key].leftovers = parseInt(inputList[key].input.value);
            vouchers_from_input += parseInt(inputList[key].input.value);
        }
    };

    if(vouchers_from_input === 0){
        finalbox.innerHTML = `Input error`;
        return;
    }

    loop();

    function loop(){
        const filtered = Object.values(inputList).filter(el=>el.leftovers > 0);

        if(filtered.length > 0){

            const currentRank = found["auto_rank"] === "0" ? 
                data.ranks.find(rank => rank.id === found["custom_rank"]) : 
                getCurrentRank(current_total_vouchers);

            const newNextRank = found["auto_rank"] === "0" ? 
                { id:"-1", name: "N/A" } : 
                getNextRank(current_total_vouchers);

            if(newNextRank.id !== "-1" && 
                (current_total_vouchers + filtered[0].leftovers) - newNextRank.vouchers_needed > newNextRank.vouchers_needed){

                const total_calculated_sum = newNextRank.vouchers_needed * parseInt(filtered[0].voucher.price);

                body.push({
                    amount: parseInt(newNextRank.vouchers_needed),
                    employee_id: parseInt(found.id),
                    rank_id: parseInt(currentRank.id),
                    vouchers_id: parseInt(filtered[0].voucher.id),
                    total_calculated_sum,
                    
                    employee_cut: currentRank["employee_cut"],
                    accepted_by_id: data.user.eid,
                    ceo_covered: 0,

                    misc: {
                        voucher_name: filtered[0].voucher.name,
                        rank_name: currentRank.name,
                        employeecut: Math.round(total_calculated_sum * (currentRank["employee_cut"] * 0.01))
                    }
                });

                current_total_vouchers += newNextRank.vouchers_needed;
                filtered[0].leftovers -= newNextRank.vouchers_needed;

            }else{

                const total_calculated_sum = filtered[0].leftovers * parseInt(filtered[0].voucher.price);
                body.push({
                    amount: parseInt(filtered[0].leftovers),
                    employee_id: parseInt(found.id),
                    rank_id: parseInt(currentRank.id),
                    vouchers_id: parseInt(filtered[0].voucher.id),
                    total_calculated_sum,
                    
                    employee_cut: currentRank["employee_cut"],
                    accepted_by_id: data.user.eid,
                    ceo_covered: 0,

                    misc: {
                        voucher_name: filtered[0].voucher.name,
                        rank_name: currentRank.name,
                        employeecut: Math.round(total_calculated_sum * (currentRank["employee_cut"] * 0.01))
                    }
                });

                current_total_vouchers += filtered[0].leftovers;
                filtered[0].leftovers = 0;
            }

            loop();

        }else{

        
            const table = cel(["table",["tr",["th",{innerText: "#"}],["th",{innerText: "Amount"}],["th",{innerText: "Type"}],["th",{innerText: "Rank"}],["th",{innerText: "Employee Cut"}]]]);
            finalbox.appendChild(table);

            for (let i = 0; i < body.length; i++) {
                table.appendChild(cel(["tr", 
                    ["td", {innerText: "#"+(i+1)}], 
                    ["td", {innerText: body[i].amount}],
                    ["td", {innerText: body[i].misc.voucher_name}],
                    ["td", {innerText: body[i].misc.rank_name}],
                    ["td", {innerText: "$" + Number(body[i].misc.employeecut).toLocaleString("us")}]
                ]));

                delete body[i].misc;
            }

            finalbox.appendChild(cel(["p", {innerText: `Vouchers after turnin => ${current_total_vouchers}`}]));

            const acceptButton = cel(["input", {type: "button", value: "Send data to the database"}]);
            finalbox.appendChild(acceptButton);

            const responsebox = cel(["p"]);
            finalbox.appendChild(responsebox);

            acceptButton.onclick = () => {
                acceptButton.disabled = true;
                calculateButton.disabled = true;

                console.log(body);
                fetch("api_v1_put.php?q=add_vouchers",{
                    method: 'PUT',
                    credentials: 'include',
                    body: JSON.stringify(body)
                }).then(res=>res.json()).then(res=>{
                        if(res.status && res.status === 201){
                            responsebox.innerText = res.response;
                            finalbox.appendChild(cel(["input", {type: "button", value: "Refresh Page", onclick: () => window.location = window.location}]));
                        }else{
                            
                            if(res.error){
                                responsebox.innerText = res.error;
                            }else{
                                responsebox.innerText = "Error while sending to the database #2\n";
                            }

                            setTimeout(() => {
                                acceptButton.disabled = false;
                                calculateButton.disabled = false;
                            }, 1000);
                            
                        }
                }).catch(err=>{
                    console.error(err);
                    responsebox.innerText = "Error while sending to the database #3";

                    setTimeout(() => {
                        acceptButton.disabled = false;
                        calculateButton.disabled = false;
                    }, 1000);
                });
            };
        
        };
    };
}

function getCurrentRank(vouchers){
    let lastRank;
    for (let i = 0; i < data.filtered_auto_ranks.length; i++) {
        if(data.filtered_auto_ranks[i]["vouchers_required"] <= vouchers){
            lastRank = data.filtered_auto_ranks[i];
        }
    }
    return lastRank;
};

function getNextRank(vouchers){
    const lastRank = data.filtered_auto_ranks.find(el=>el["vouchers_required"] > vouchers);
    return lastRank === undefined ? {
        id:"-1", name: "N/A"
    } : {
        ...lastRank, 
        vouchers_needed: lastRank["vouchers_required"] - vouchers,
    };
};