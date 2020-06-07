const employeediv = document.getElementById("content");

var data = [];

fetchData();

function fetchData(callback){
    fetch("data.php")
    .then(res=>res.json())
    .then(res=>{
        if(res.error !== null){
            return employeediv.innerHTML = res.error;
        }else if(res.employees.length > 0){
            data = res;
            if(callback === undefined){
                displayAllEmployees()
            }else{
                callback();
            }
        }else{employeediv.innerHTML = "error 2";};
    }).catch(err=>{employeediv.innerHTML = "error 1";console.log(err);});
}




function displayAllEmployees(){
    employeediv.innerHTML = "";
    const table = document.createElement("table");
    employeediv.appendChild(table);

    const keys = Object.keys(data.employees[0]);

    table.innerHTML += `<tr>${keys.map(k=>`<th>${k}</th>`).join("")}<th>action</th></tr>`;

    for (let i = 0; i < data.employees.length; i++) {
        table.innerHTML += `<tr>${keys.map(k=>`<td>${data.employees[i][k]}</td>`).join("")}<td><input type="button" value="edit" onclick="editEmployee(${data.employees[i]["id"]})"></d></tr>`;
    }
}


function editEmployee(id){
    const column_names = Object.keys(data.employees[0]);
    const found = data.employees.find(el=>el.id == id);
    if(!found) return;
    employeediv.innerHTML = "";

    const table = document.createElement("table");
    for (let i = 0; i < column_names.length; i++) {
        const colname = column_names[i];
        let string = "";
        
        string += `<tr><th>${colname}</th><td>`;
        if(data.user.permissions[colname] === undefined || data.user.permissions[colname] === false){
            string += found[colname];
        }else{
            string += `<input type="checkbox" onclick="this.nextElementSibling.disabled = !this.nextElementSibling.disabled"></input>`;

            switch(colname){
                case("ingameid"):
                case("discordid"):
                    string += `<input type="number" name="${colname}" value="${found[colname]}" disabled></input>`;
                    break;

                case("custom_rank"):
                    string += generateCustomRank(found.rankid)
                    break;

                case("auto_rank"):
                    string += generateTrueFalseField(found.auto_rank,"isAutoRank",["Automatic Vouchers","Custom Vouchers"])
                    break;

                case("leave_date"):
                    string += `<input type="text" name="${colname}" value="${found[colname]}" disabled></input><br>
                    Today is: ${new Date().toLocaleString('lt', { timeZone: 'GMT' })}`;
                    break;

                default:
                    string += `<input type="text" name="${colname}" value="${found[colname]}" disabled></input>`;
                    break;
            }
        }
        table.innerHTML += string + "</td><tr/>";
    }
    employeediv.appendChild(table);

    const backButton = document.createElement("input");
    backButton.type = "button";
    backButton.value = "back";
    backButton.onclick = displayAllEmployees;
    employeediv.appendChild(backButton)

    const refreshButton = document.createElement("input");
    refreshButton.type = "button";
    refreshButton.value = "refresh";
    refreshButton.onclick = () => fetchData(()=>{
        editEmployee(id);
        const p = document.createElement("p");
        p.innerText = `Refreshed ${new Date().toTimeString()}`;
        employeediv.appendChild(p);
    });
    employeediv.appendChild(refreshButton);
}


function generateCustomRank(currentRankId){
    return `<select id="customRankSelect" disabled>
    ${data.ranks.map(rank=>`<option value="${rank.id}" ${rank.id == currentRankId ? "selected" : ""}>${rank.id} - ${rank.name}</option>`).join("")}
    </select>`;
}

function generateTrueFalseField(bool,name="customBool",options = ["True","False"]){
    return `
    <select id="${name}" disabled>
        <option value="1" ${bool === "1" ? "selected" : ""}>1 - ${options[0]} (default)</option>
        <option value="0" ${bool === "0" ? "selected" : ""}>0 - ${options[1]}</option>
    </select>`;
}