const div = document.getElementById("content");
var data = [];

fetchData();

function fetchData(callback){
    fetch("data.php")
    .then(res=>res.json())
    .then(res=>{
        if(res.error !== null){
            div.innerHTML = res.error;
            return;
        }else if(res.employees.length > 0){
            data = res;
            if(callback === undefined){
                windowAllEmployees()
            }else{
                callback();
            }
        }else{
            div.innerHTML = "error 2";
        };
    }).catch(err=>{
        div.innerHTML = "error 1";
        console.log(err);
    });
}


function windowAllEmployees(){
    div.innerHTML = "";
    const table = document.createElement("table");
    div.appendChild(table);

    const filter = ["leave_date"];
    const keys = Object.keys(data.employees[0]).filter(k => !filter.includes(k) );

    table.appendChild(cel(["tr",   ...keys.map(k => ["th", {innerText: k}]), ["th", {innerText: "action"}]]));

    for (let i = 0; i < data.employees.length; i++) {
        table.appendChild(cel(["tr",   ...keys.map(k => ["td", {innerText: data.employees[i][k]}]), ["td",["input", {type: "button", value: "edit", onclick: ()=>{
            windowEditEmployee(data.employees[i]["id"])
        }}]]]));
    }

    if(data.user.permission_name === "ceo" || data.user.permission_name === "hr"){
        div.appendChild(cel(["input",{type:"button", value: "add new employee", onclick: windowAddNewEmployee}]));
    }
}


function windowAddNewEmployee(){
    div.innerHTML = "";
    const filter = ["id","vouchers","rank","leave_date"];
    const column_names = Object.keys(data.employees[0]);

    const form = document.createElement("form");
    form.autocomplete = "off";
    div.appendChild(form);
    const table = document.createElement("table");
    for (let i = 0; i < column_names.length; i++) {
        const colname = column_names[i];
        if(filter.includes(colname)) continue;
        let string = `<tr><th>${colname}</th><td>`;

        switch(colname){
            case("ingameid"):
            case("discordid"):
                string += `<input type="number" name="${colname}" value="" required></input>`;
                break;

            case("custom_rank"):
                string += generateCustomRank({
                    id: 5,
                    name: "custom_rank",
                    isDisabled: false,
                    isRequired: true
                });
                break;

            case("auto_rank"):
                string += generateTrueFalseField({
                    default: 1,
                    name: "auto_rank",
                    options: ["Automatic Rank","Custom Rank"],
                    isDisabled: false,
                    isRequired: true
                });
                break;

            case("join_date"):
                string += `<input type="text" name="${colname}" value="${new Date().toLocaleString('lt', { timeZone: 'GMT' })}" required></input><br>`;
                break;

            case("note"):
                string += `<input type="text" name="${colname}" value=""></input>`;
                break;

            default:
                string += `<input type="text" name="${colname}" value="" required></input>`;
                break;
        }

        table.innerHTML += string + "</td></tr>";
    }
    form.appendChild(table);

    const responseBox = document.createElement("p");
    div.appendChild(responseBox);

    const input = [...document.querySelectorAll("input:not([type=button]),select")];
    const submitButton = document.createElement("input");
    submitButton.type = "button";
    submitButton.value = "submit";
    submitButton.onclick = () => {
        const errors = [];
        const body = {};
        for (let i = 0; i < input.length; i++) {
            if(!input[i].required){
                if(input[i].value){
                    body[input[i].name] = input[i].value;
                }
            }else{
                if(!input[i].value){
                    errors.push("Missing value on "+input[i].name);
                }else{
                    if(input[i].name === "join_date" && !input[i].value.includes("-")){
                        errors.push("Invalid date on "+input[i].name);

                    }else if(input[i].name === "ingameid" && data.employees.find(el => el.ingameid == input[i].value)){
                        errors.push("User already exits on "+input[i].name);

                    }else{
                        body[input[i].name] = input[i].value;
                    }

                    // if(input[i].name === "join_date"){
                    //     if(!input[i].value.includes("-")){
                    //         errors.push("Invalid date on "+input[i].name);
                    //     }else{
                    //         body[input[i].name] = input[i].value;
                    //     }

                    // }else if(input[i].name === "ingameid"){
                    //     if(data.employees.find(el => el.ingameid == input[i].value)){
                    //         errors.push("User already exits on "+input[i].name);
                    //     }else{
                    //         body[input[i].name] = input[i].value;
                    //     }

                    // }else{
                    //     body[input[i].name] = input[i].value;
                    // }
                }
            }
        }

        if(errors.length > 0){
            responseBox.innerText = `Errors in input fields: \n${errors.join("\n")}`;
            return;
        }
        
        console.log(body);
        // responseBox.innerText = `${JSON.stringify(body)}`;
        fetch("employees_api.php",{
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify(body)
            }).then(res=>res.json()).then(res=>{
                if(res.status && res.status === 201){
                    // responseBox.innerText = res.response;
                    submitButton.value = res.response;
                    responseBox.innerText = "";
                    submitButton.disabled = true;
                }else{
                    if(res.error){
                        responseBox.innerText = res.error;
                    }else{
                        responseBox.innerText = "error 1";
                    }
                }
        }).catch(err=>{
            console.error(err);
            responseBox.innerText = "error 2";
        });
    };
    div.appendChild(submitButton);
    
    backButton();
}




function windowEditEmployee(id){
    const found = data.employees.find(el=>el.id == id);
    if(!found) return;

    div.innerHTML = "";
    const column_names = Object.keys(data.employees[0]);

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
                    string += generateCustomRank({
                        id: found.rankid,
                        name: "custom_rank",
                        isDisabled: true,
                        isRequired: false,

                        table
                    });
                    break;
    
                case("auto_rank"):
                    string += generateTrueFalseField({
                        default: found.auto_rank,
                        name: "auto_rank",
                        options: ["Automatic Rank","Custom Rank"],
                        isDisabled: true,
                        isRequired: false
                    });
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
    div.appendChild(table);

    backButton();

    div.appendChild(cel(["input", {type: "button", value: "refresh", onclick: () => fetchData(()=>{
        windowEditEmployee(id);
        div.appendChild(cel(["p",{innerText: `Refreshed ${new Date().toTimeString()}`}]));
    })}]));
}

function backButton(){
    div.appendChild(cel(["input",{type: "button", value: "back", onclick: windowAllEmployees}]));
}


function generateCustomRank(obj){
    // const aa = cel(["select",{id: "customRankSelect", name: obj.name || "opt", disabled: obj.isDisabled, required: obj.isRequired},
    //     ...data.ranks.map(rank=>["option", {value: rank.id, selected: rank.id == obj.id, innerText: `${rank.id} - ${rank.name}`}])
    // ]])

    // obj.table.appendChild(aa);

    return `<select id="customRankSelect" name="${obj.name || "opt"}" ${obj.isDisabled ? "disabled" : ""} ${obj.isRequired ? "required" : ""}>
    ${data.ranks.map(rank=>`<option value="${rank.id}" ${rank.id == obj.id ? "selected" : ""}>${rank.id} - ${rank.name}</option>`).join("")}
    </select>`;
}

function generateTrueFalseField(obj){
    return `
    <select id="${obj.name || "opt"}" name="${obj.name || "opt"}" ${obj.isDisabled ? "disabled" : ""} ${obj.isRequired ? "required" : ""}>
        <option value="1" ${obj.default === "1" ? "selected" : ""}>1 - ${obj.options[0] || "true"} (default)</option>
        <option value="0" ${obj.default === "0" ? "selected" : ""}>0 - ${obj.options[1] || "false"}</option>
    </select>`;
}