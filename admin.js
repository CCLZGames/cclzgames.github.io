const tablesDiv = document.getElementById("tables");


// Get current bookings

let bookings =
JSON.parse(localStorage.getItem("bookings")) || {};



// Create buttons for tables 01-12

for(let i = 1; i <= 12; i++){


    let number =
    i.toString().padStart(2,"0");


    let button =
    document.createElement("button");


    button.textContent =
    "Table " + number;


    button.className="admin-table";



    if(bookings[number]){


        button.classList.add("booked");


        button.textContent =
        "Table " + number + " (Booked)";


        button.onclick = () => {

            freeTable(number);

        };


    }

    else{


        button.classList.add("available");


        button.textContent =
        "Table " + number + " (Free)";

    }



    tablesDiv.appendChild(button);

}



// Function to remove booking

function freeTable(table){


    let confirmRemove =
    confirm(
    "Make table " + table + " available?"
    );


    if(confirmRemove){


        delete bookings[table];


        localStorage.setItem(
            "bookings",
            JSON.stringify(bookings)
        );


        alert(
        "Table " + table + " is now free"
        );


        location.reload();

    }

}