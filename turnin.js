let nameClicked = ()=>{};

(async ()=>{
    const data = await fetch("data.php").then(res=>res.json());

    const employee_names = document.getElementById("employee_names");

    if(!data || !employee_names){
        return console.log("no data");
    }
    
    const infobox = document.getElementById("infobox");
    const inputFields = document.getElementById("inputFields");
    const calculate = document.getElementById("calculate");
    const final = document.getElementById("final");
    const response = document.getElementById("response");

    const filtered_auto_ranks = Object.values(data.ranks.filter(r=>r["auto_vouchers"] === "1"))
        .map(r=>({
            ...r, 
            vouchers_required: +r.vouchers_required,
            employee_cut: +r.employee_cut,
        })).sort((a,b) => a.vouchers_required - b.vouchers_required)
    let selected_employee = {};
    const inputsList = {};

    updateEmployeeSelectList();
    function updateEmployeeSelectList(){
        if(data.employees.length > 0){
            employee_names.innerHTML = `<option value="-1">Select employee</option>`;
            
            employee_names.innerHTML += data.employees.map((el,i)=>{
                
                // //for debug
                // if(i === 0){
                //     setTimeout(() => {
                //         nameClicked(el.id);
                //     }, 100);
                //     return `<option value="${el.id}" selected>NAME: ${el.name} | ID: ${el.id} | VOUCHERS: ${el.vouchers} | RANK: ${el.rank}</option>`
                // }
    
                return `<option value="${el.id}">NAME: ${el.name} | ID: ${el.id} | VOUCHERS: ${el.vouchers} | RANK: ${el.rank}</option>`
            }).join("");
        }else{
            employee_names.innerHTML = `<option value="-1">No Employee Found, Try Again Later</option>`;
        }
    }


    infobox.innerHTML = "Select employee";

    nameClicked = (id) => {
        if(id === "-1") return;
        const found = data.employees.find(el=>el.id === id);
        if(!found) return;
        selected_employee = found;
        infobox.innerHTML = "<table>"+Object.entries(found).map(el => `<tr><th>${el[0]}</th><td>${el[1]}</td></tr>`).join("")+"</table>";
    }

    for (let i = data.vouchers.length - 1; i >= 0; i--) {
        const v = data.vouchers[i];
        const newField = document.createElement("div");
        newField.innerHTML = `${v.name} | ${v.price}$<br>`;
        const input = document.createElement("input");
        input.type = "number";
        input.value = 0;
        newField.appendChild(input);
        inputsList[v.id] = { input, voucher: v };
        inputFields.prepend(newField);
    }

    calculate.addEventListener("click",(e)=>{

        if(Object.keys(selected_employee).length === 0){
            final.innerHTML = "No employee is selected.";
            return;
        }else{
            final.innerHTML = "";
        }

        let current_total_vouchers = parseInt(selected_employee["vouchers"]);
        // const nextRank = getNextRank(parseInt(selected_employee["vouchers"]));

        // if(selected_employee["auto_rank"] === "0" || nextRank.id === "-1"){
        //     finalTurnin();
        // }else{

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

        const post = [];
        const accepted_by_id = 5;
        loop();

        function loop(){
            const filtered = Object.values(inputsList).filter(el=>el.leftovers > 0);

            if(filtered.length > 0){

                const currentRank = selected_employee["auto_rank"] === "0" ? 
                    data.ranks.find(rank => rank.id === selected_employee["custom_rank"]) : 
                    getCurrentRank(current_total_vouchers);

                const newNextRank = selected_employee["auto_rank"] === "0" ? 
                    { id:"-1", name: "N/A" } : 
                    getNextRank(current_total_vouchers);

                //if more than needed
                if(newNextRank.id !== "-1" && 
                    (current_total_vouchers + filtered[0].leftovers) - newNextRank.vouchers_needed > newNextRank.vouchers_needed){

                    const totalmoney = newNextRank.vouchers_needed * parseInt(filtered[0].voucher.price);
                    post.push({
                        amount: parseInt(newNextRank.vouchers_needed),
                        accepted_by_id,
                        employeeid: parseInt(selected_employee.id),
                        rankid: parseInt(currentRank.id),
                        voucherid: parseInt(filtered[0].voucher.id),
                        totalmoney,
                        employeecut: Math.round(totalmoney * (currentRank["employee_cut"] * 0.01)),

                        misc: {
                            voucher_name: filtered[0].voucher.name,
                            rank_name: currentRank.name
                        }
                    });

                    current_total_vouchers += newNextRank.vouchers_needed;
                    filtered[0].leftovers -= newNextRank.vouchers_needed;

                //if less than needed
                }else{

                    const totalmoney = filtered[0].leftovers * parseInt(filtered[0].voucher.price);
                    post.push({
                        amount: parseInt(filtered[0].leftovers),
                        accepted_by_id,
                        employeeid: parseInt(selected_employee.id),
                        rankid: parseInt(currentRank.id),
                        voucherid: parseInt(filtered[0].voucher.id),
                        totalmoney,
                        employeecut: Math.round(totalmoney * (currentRank["employee_cut"] * 0.01)),

                        misc: {
                            voucher_name: filtered[0].voucher.name,
                            rank_name: currentRank.name
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

                table.innerHTML += post.map((v,i)=>{
                    const string = `<tr><td>#${i+1}</td><td>${v.amount}</td><td>${v.misc.voucher_name}</td><td>${v.misc.rank_name}</td><td>$${Number(v.employeecut).toLocaleString("us")}</td></tr>`;
                    delete(v.misc);
                    return string;
                }).join("");


                final.innerHTML += `<hr>current_total_vouchers => ${current_total_vouchers}<br>`;

                const acceptButton = document.createElement("input");
                acceptButton.type = "button";
                acceptButton.value = "Accept";
                final.appendChild(acceptButton);

                
                acceptButton.addEventListener("click",(e)=>{
                    // updateEmployeeSelectList();
                    // infobox.innerHTML = "Select employee";

                    employee_names.style.disabled = "true";
                    // console.log("clicked")

                    // acceptButton.disabled = true;

                    fetch("turnin_api.php",{
                        method: 'POST',
                        credentials: 'include',
                        body: JSON.stringify(post)
                        }).then(res=>res.text()).then(res=>{
                            response.innerHTML = res;
                    })
                })

            }

        }

            

        // }



        // function finalTurnin(){
        //     const foundRank = data.ranks.find(rank => rank.id === selected_employee["custom_rank"]);
        //     if(foundRank && foundRank["employee_cut"]){
        //         // console.log(inputsList);
        //         let turnin_vouchers_sum = 0;
        //         let turnin_vouchers = 0;

        //         for (const rankId in inputsList) {
        //             turnin_vouchers_sum += +inputsList[rankId].input.value *  +inputsList[rankId].voucher.price;
        //             turnin_vouchers += +inputsList[rankId].input.value;
        //         }

        //         final.innerHTML = `
        //         total_vouchers_sum: ${turnin_vouchers_sum}<br>
        //         employee_cut: ${(parseInt(foundRank["employee_cut"]) * 0.01) * turnin_vouchers_sum}<br>
        //         company_cut: ${(1 - (parseInt(foundRank["employee_cut"]) * 0.01)).toFixed(2) * turnin_vouchers_sum}
        //         `;
        //     }else{
        //         final.innerHTML = "err 32";
        //     }
        // }
        

        function getCurrentRank(vouchers){
            let lastRank;
            for (let i = 0; i < filtered_auto_ranks.length; i++) {
                if(filtered_auto_ranks[i]["vouchers_required"] <= vouchers){
                    lastRank = filtered_auto_ranks[i];
                }
            }
            return lastRank;
        }

        function getNextRank(vouchers){
            const lastRank = filtered_auto_ranks.find(el=>el["vouchers_required"] > vouchers);
            return lastRank === undefined ? {
                id:"-1", name: "N/A"
            } : {
                ...lastRank, 
                vouchers_needed: lastRank["vouchers_required"] - vouchers,
            };
        }


    })
})();