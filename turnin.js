(async ()=>{
    const data = await fetch("data.php").then(res=>res.json());
    const employee_names = document.getElementById("employee_names");
    const info_table = document.getElementById("info_table");
    const inputFields = document.getElementById("inputFields");
    const calculate = document.getElementById("calculate");
    const final = document.getElementById("final");

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


    info_table.innerHTML = "Select employee";

    employee_names.addEventListener("click",(e)=>{
        if(e.target.localName !== "option" || e.target.value === "-1") return;

        nameClicked(e.target.value);
    });

    function nameClicked(id){
        const found = data.employees.find(el=>el.id === id);
        if(!found) return;
        selected_employee = found;
        info_table.innerHTML = "<table>"+Object.entries(found).map(el => `<tr><th>${el[0]}</th><td>${el[1]}</td></tr>`).join("")+"</table>";
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
        const nextRank = getNextRank(parseInt(selected_employee["vouchers"]));

        if(selected_employee["auto_rank"] === "0" || nextRank.id === "-1"){
            finalTurnin();
        }else{

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

            loop();

            function loop(){
                const filtered = Object.values(inputsList).filter(el=>el.leftovers > 0);

                if(filtered.length > 0){

                    const currentRank = getCurrentRank(current_total_vouchers);
                    const newNextRank = getNextRank(current_total_vouchers);

                    //if more than needed
                    if(newNextRank.id !== "-1" && 
                        (current_total_vouchers + filtered[0].leftovers) - newNextRank.vouchers_needed > newNextRank.vouchers_needed){

                        final.innerHTML += `${newNextRank.vouchers_needed} as ${filtered[0].voucher.name} - RANK: ${currentRank.name} <br>(RANKUP)<hr>`;
                        current_total_vouchers += newNextRank.vouchers_needed;
                        filtered[0].leftovers -= newNextRank.vouchers_needed;

                    //if less than needed
                    }else{
                        console.log("final")
                        final.innerHTML += `${filtered[0].leftovers} as ${filtered[0].voucher.name} - RANK: ${currentRank.name}<br>`;

                        current_total_vouchers += filtered[0].leftovers;
                        filtered[0].leftovers = 0;
                    }

                    loop();

                }else{
                    final.innerHTML += `<hr>current_total_vouchers => ${current_total_vouchers}<br>`;

                    const acceptButton = document.createElement("input");
                    acceptButton.type = "button";
                    acceptButton.value = "Accept";
                    final.appendChild(acceptButton);

                    
                    acceptButton.addEventListener("click",(e)=>{
                        updateEmployeeSelectList();
                        info_table.innerHTML = "Select employee";
                        selected_employee = {};

                        console.log("clicked")

                        fetch("secured.php",{
                            method: 'GET',
                            credentials: 'include'
                          }).then(res=>res.text()).then(res=>{
                            console.log(res);
                        })
                    })

                }

            }

            

        }



        function finalTurnin(){
            const foundRank = data.ranks.find(rank => rank.id === selected_employee["custom_rank"]);
            if(foundRank && foundRank["employee_cut"]){
                // console.log(inputsList);
                let turnin_vouchers_sum = 0;
                let turnin_vouchers = 0;

                for (const rankId in inputsList) {
                    turnin_vouchers_sum += +inputsList[rankId].input.value *  +inputsList[rankId].voucher.price;
                    turnin_vouchers += +inputsList[rankId].input.value;
                }

                final.innerHTML = `
                total_vouchers_sum: ${turnin_vouchers_sum}<br>
                employee_cut: ${(parseInt(foundRank["employee_cut"]) * 0.01) * turnin_vouchers_sum}<br>
                company_cut: ${(1 - (parseInt(foundRank["employee_cut"]) * 0.01)).toFixed(2) * turnin_vouchers_sum}
                `;
            }else{
                final.innerHTML = "err 32";
            }
        }
        

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
                id:"-1", name: "N/A x"
            } : {
                ...lastRank, 
                vouchers_needed: lastRank["vouchers_required"] - vouchers,
            };
        }


    })
})();