const employee_names = document.getElementById("employee_names");
const infobox = document.getElementById("infobox");
const inputFields = document.getElementById("inputFields");
const calculate = document.getElementById("calculate");
const final = document.getElementById("final");
const response = document.getElementById("response");
let nameClicked = ()=>{};
let data, filtered_auto_ranks;
let selected_employee, inputsList = {};

fetch("data.php")
    .then(res=>res.json())
    .then(res=>{
        if(!res || res.error !== null){
            calculate.hidden = true;
            employee_names.parentElement.hidden = true;
            infobox.innerHTML = res.error + "<br> Try again later";
        }else{
            data = res;

            filtered_auto_ranks = Object.values(data.ranks.filter(r=>r["auto_vouchers"] === "1"))
                .map(r=>({
                    ...r, 
                    vouchers_required: parseInt(r.vouchers_required),
                    employee_cut: parseInt(r.employee_cut),
                })).sort((a,b) => a.vouchers_required - b.vouchers_required);

            infobox.innerHTML = "Select employee";

            for (let i = data.vouchers.length - 1; i >= 0; i--) {
                const v = data.vouchers[i];
                if(v.disabled === "1") continue;
                const newField = document.createElement("div");
                newField.innerHTML = `${v.name} | ${v.price}$<br>`;
                const input = document.createElement("input");
                input.type = "number";
                input.value = 0;
                newField.appendChild(input);
                inputsList[v.id] = { input, voucher: v };
                inputFields.prepend(newField);
            }

            updateEmployeeSelectList();
            calculate.addEventListener("click",handleCalculateButton);
        }
    }).catch(err=>{
        console.log(err);
        infobox.innerHTML = "no data";
    });


function updateEmployeeSelectList(){
    if(data.employees.length > 0){
        employee_names.innerHTML = `<option value="-1">Select employee</option>`;
        
        employee_names.innerHTML += data.employees.map((em,i)=>{
            return `<option value="${em.id}">NAME: ${em.name}#${em.ingameid} | EID: ${em.id} | VOUCHERS: ${em.vouchers} | RANK: ${em.rank}</option>`
        }).join("");
    }else{
        employee_names.innerHTML = `<option value="-1">No Employee Found, Try Again Later</option>`;
    }
}

nameClicked = (id) => {
    if(id === "-1") return;
    const found = data.employees.find(el=>el.id === id);
    if(!found) return;
    selected_employee = found;
    infobox.innerHTML = "<table>"+Object.entries(found).map(el => `<tr><th>${el[0]}</th><td>${el[1]}</td></tr>`).join("")+"</table>";
}

function handleCalculateButton(e){
    if(!selected_employee){
        final.innerHTML = "No employee is selected.";
        return;
    }else{
        final.innerHTML = "";
    }

    let current_total_vouchers = parseInt(selected_employee["vouchers"]);
    let vouchers_from_input = 0;
    
    for (const key in inputsList) {
        const val = inputsList[key].input.value;
        if(val && val > 0){
            inputsList[key].leftovers = parseInt(inputsList[key].input.value);
            vouchers_from_input += parseInt(inputsList[key].input.value);
        }

    };

    if(vouchers_from_input === 0){
        final.innerHTML = `Input error`;
        return;
    }

    
    const body = [];
    loop();

    function loop(){
        const filtered = Object.values(inputsList).filter(el=>el.leftovers > 0);

        if(filtered.length > 0){

            const currentRank = selected_employee["auto_rank"] === "0" ? 
                data.ranks.find(rank => rank.id === selected_employee["custom_rank"]) : 
                getCurrentRank(filtered_auto_ranks, current_total_vouchers);

            const newNextRank = selected_employee["auto_rank"] === "0" ? 
                { id:"-1", name: "N/A" } : 
                getNextRank(filtered_auto_ranks, current_total_vouchers);

            //if more than needed
            if(newNextRank.id !== "-1" && 
                (current_total_vouchers + filtered[0].leftovers) - newNextRank.vouchers_needed > newNextRank.vouchers_needed){

                const total_calculated_sum = newNextRank.vouchers_needed * parseInt(filtered[0].voucher.price);

                body.push({
                    amount: parseInt(newNextRank.vouchers_needed),
                    employee_id: parseInt(selected_employee.id),
                    rank_id: parseInt(currentRank.id),
                    vouchers_id: parseInt(filtered[0].voucher.id),
                    total_calculated_sum,
                    
                    employee_cut: currentRank["employee_cut"],
                    accepted_by_id: data.user.eid,
                    vouchers_holding_id: data.user.eid,

                    misc: {
                        voucher_name: filtered[0].voucher.name,
                        rank_name: currentRank.name,
                        employeecut: Math.round(total_calculated_sum * (currentRank["employee_cut"] * 0.01))
                    }
                });

                current_total_vouchers += newNextRank.vouchers_needed;
                filtered[0].leftovers -= newNextRank.vouchers_needed;

            //if less than needed
            }else{

                const total_calculated_sum = filtered[0].leftovers * parseInt(filtered[0].voucher.price);
                body.push({
                    amount: parseInt(filtered[0].leftovers),
                    employee_id: parseInt(selected_employee.id),
                    rank_id: parseInt(currentRank.id),
                    vouchers_id: parseInt(filtered[0].voucher.id),
                    total_calculated_sum,
                    
                    employee_cut: currentRank["employee_cut"],
                    accepted_by_id: data.user.eid,
                    vouchers_holding_id: data.user.eid,

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
            
            const table = document.createElement("table");
            final.appendChild(table);
            table.innerHTML += `<tr><th>#</th><th>Amount</th><th>Type</th><th>Rank</th><th>Employee Cut</th></tr>`;

            table.innerHTML += body.map((v,i)=>{
                const string = `<tr><td>#${i+1}</td><td>${v.amount}</td><td>${v.misc.voucher_name}</td><td>${v.misc.rank_name}</td><td>$${Number(v.misc.employeecut).toLocaleString("us")}</td></tr>`;
                delete(v.misc);
                return string;
            }).join("");


            final.innerHTML += `<hr>Vouchers after turnin => ${current_total_vouchers}<br>`;

            const acceptButton = document.createElement("input");
            acceptButton.type = "button";
            acceptButton.value = "Send data to the database";
            final.appendChild(acceptButton);

            
            acceptButton.addEventListener("click",(e)=>{
                acceptButton.disabled = true;
                calculate.disabled = true;
                
                console.log(body);
                fetch("turnin_api.php",{
                    method: 'POST',
                    credentials: 'include',
                    body: JSON.stringify(body)
                    }).then(res=>res.json()).then(res=>{
                        if(res.status && res.status === 201){
                            response.innerHTML = res.response + "<br>";

                            const refreshButton = document.createElement("input");
                            refreshButton.type = "button";
                            refreshButton.value = "Refresh Page";
                            refreshButton.onclick = ()=>window.location = window.location;
                            response.appendChild(refreshButton);
                        }else{
                            response.innerHTML = "Error while sending to the database #2<br>";
                            if(res.error){
                                response.innerHTML += res.error;
                            }

                            setTimeout(() => {
                                acceptButton.disabled = false;
                            }, 1000);
                            
                        }
                }).catch(err=>{
                    console.error(err);
                    response.innerHTML = "Error while sending to the database #3";

                    setTimeout(() => {
                        acceptButton.disabled = false;
                    }, 1000);
                });
            });

        };

    };
}

function getCurrentRank(filtered_auto_ranks, vouchers){
    let lastRank;
    for (let i = 0; i < filtered_auto_ranks.length; i++) {
        if(filtered_auto_ranks[i]["vouchers_required"] <= vouchers){
            lastRank = filtered_auto_ranks[i];
        }
    }
    return lastRank;
};

function getNextRank(filtered_auto_ranks, vouchers){
    const lastRank = filtered_auto_ranks.find(el=>el["vouchers_required"] > vouchers);
    return lastRank === undefined ? {
        id:"-1", name: "N/A"
    } : {
        ...lastRank, 
        vouchers_needed: lastRank["vouchers_required"] - vouchers,
    };
};