//localLoader();
var database = JSON.parse(localStorage.getItem("database"));
if(database == null) {
    localLoader();
    database = JSON.parse(localStorage.getItem("database"));
} 
var userIndex = 0;
$(function() {
    
    renderUsers();
    renderProfile();
    renderingTodolists();

    profileSelection();
    
    todolistSelection();

    projectMembersButton();

    addNewTodolistBTN();
    modalCancelBTN();
    modalCreateBTN();
    modalInputEnterTrigger();

    todolistsDeleteBTN();

    addNewItemBTN();

    itemBTN();


});


function renderUsers() {
    // making sure user profiles section is visible
    $("#members").hasClass("display") ? "" : $("#members").addClass("display");
    $("#todolist")
    for(let user of database) {
        console.log(user);
        $("#profiles").append(`
            <div class="member-profile">
                <img src="${user.image}" alt="">
                <div class="member-info">
                    <p>${user.name}</p>
                    <p>Section: ${user.section}</p>
                    <p>${user.id}</p>
                </div>
            </div>
        `);
    }
}

function renderProfile() {
    $("#top").html("").append(`
    <img src="${database[userIndex].image}" alt="">
    <div>
        <p class="header-title">${database[userIndex].name}</p>
        <p class="header-email">${database[userIndex].email}</p>
    </div>
`);
}

function renderingTodolists() {
    $("#left-section article").html("");
    if(database[userIndex].todolists .length > 0) {
        for (let todolist of database[userIndex].todolists) {
            let title = todolist.title;
            let itemCount = findNotCompletedItemCount(title);
    
            $("#left-section article").append(`
                <div class="category">
                    <div>
                        <div><i class="fa-solid fa-bars fa-sm"></i></div>
                        <div class="todolist-title">${title}</div>
                    </div>
                    <div>
                        <div class="delete hidden"><i class="fa-solid fa-trash"></i></div>
                        <div class="count">${itemCount ? itemCount : ""}</div>
                    </div>
                </div>
            `);
        }
    } else {
        //renderUsers();
        $("#members").removeClass("hidden").addClass("display");
        $("#todolist").removeClass("display").addClass("hidden")
    }

}

function profileSelection() {
    // click event handler for each profile
    // and if the selected user has at least one todolist
    // first one automatically is rendered


    $("#members .member-profile").on("click", function(e) {
        userIndex = $(this).index();
        renderProfile();
        renderingTodolists();

        if(database[userIndex].todolists.length > 0) {
            $("#todolist").removeClass("hidden").addClass("display");
            $("#members").removeClass("display").addClass("hidden");
            let todolist = getTodolist(database[userIndex].todolists[0].title);
            renderTheTodolist(todolist);
            renderingTodolists();

            $(".selected-menu").removeClass("selected-menu");
            $(".category:eq(0)").addClass("selected-menu");
            $("#add-bar input").focus();

        }
    })

}

function todolistSelection() {
    $("body").on("click", ".category", function(e) {
        let todolistName = $(this).find(".todolist-title").text();
        let todolist = getTodolist(todolistName);
        if($("#members").hasClass("display")) {
            $("#members").removeClass("display").addClass("hidden");
            $("#todolist").removeClass("hidden").addClass("display");
        }
        renderTheTodolist(todolist);

        $(".selected-menu").removeClass("selected-menu");
        $(this).addClass("selected-menu");
        $("#add-bar input").focus();

    });
}

function renderTheTodolist(todolist) {
    $("#todolist #items").html("");

    console.log("Inside of " + todolist);
    if(todolist) {
        $("#todolist header div").text(todolist.title);

        for (let item of todolist.items) {
            $("#todolist #items").append(`
                <div class="item" value="${item.itemId}">
                    <input type="checkbox" ${item.completed ? "checked" : ""} name="" id="">
                    <p class="${item.completed ? "completed" : ""}">${item.itemName}</p>
                </div> 
            `);
        }
    }

}


function projectMembersButton () {
    $("#project-members").on("click", function(e) {
        $("#members").removeClass("hidden").addClass("display");
        $("#todolist").removeClass("display").addClass("hidden");
        //renderUsers();

        $(".selected-menu").removeClass("selected-menu");
        $(this).addClass("selected-menu");
    })
}

function addNewTodolistBTN () {
    $("#left-section footer").on("click", function(e) {
        $("#modal").addClass("display");
        $("#overlay").addClass("active"); 

        $("#modal input").focus();
    });
}

function modalCancelBTN () {
    $("#close-btn").on("click", function(e) {
        $("#modal").removeClass("display");
        $("#overlay").removeClass("active");
        e.stopPropagation();
        $("#add-bar input").focus();
        $("#modal input").val("");
    }); 
}
function modalCreateBTN() {
    $("#create-btn").on("click", function(e) {
        e.stopPropagation();

        let todolistTitle = $("input").val();
        if(todolistTitle.length) {
            $("input").val("");
        
            let newTDL = {title: todolistTitle, items: []}
            if(findTodolistCount() == 0 || $("#members").hasClass("display")) {
                $("#members").removeClass("display").addClass("hidden");
                $("#todolist").removeClass("hidden").addClass("display");
            }
            addNewTodolist(newTDL)
            
            renderingTodolists();
            renderTheTodolist(getTodolist(todolistTitle));
    
            localStorage.setItem("database", JSON.stringify(database));
    
            $("#left-section article .category:last-of-type").addClass("selected-menu");
            $("#project-members").removeClass("selected-menu");
    
            $("#modal").removeClass("display");
            $("#overlay").removeClass("active");
            $("#add-bar input").focus();

        }

    });
}

function modalInputEnterTrigger() {
    $("#modal input").on("keydown", function(e) {
        console.log(e.key);
        if(e.key == "Enter") {
            e.stopPropagation();

            let todolistTitle = $(this).val();
            if(todolistTitle.length) {
                $(this).val("");
            
                let newTDL = {title: todolistTitle, items: []}
                if(findTodolistCount() == 0 || $("#members").hasClass("display")) {
                    $("#members").removeClass("display").addClass("hidden");
                    $("#todolist").removeClass("hidden").addClass("display");
                }
                addNewTodolist(newTDL)
                
                renderingTodolists();
                renderTheTodolist(getTodolist(todolistTitle));
        
                localStorage.setItem("database", JSON.stringify(database));
        
                $("#left-section article .category:last-of-type").addClass("selected-menu");
        
                $("#modal").removeClass("display");
                $("#overlay").removeClass("active");
                $("#add-bar input").focus();
            }

        }
    })
}


function todolistsDeleteBTN() {
    //Visibility of delete button
    $("body").on("mouseenter", ".category", function(e) {
        $(this).find(".delete").removeClass("hidden");
    })
    .on("mouseleave", ".category", function(e) {
        $(this).find(".delete").addClass("hidden");
    });

    
    $("body").on("click", ".delete", function(e) {
        e.stopPropagation();
        let todolistName = $(this).parent().parent().find(".todolist-title").text();
        deleteTodolist(todolistName);
        renderingTodolists();
        
        let defaultTodolist = database[userIndex].todolists[0];
        if(defaultTodolist) {
            $("#todolist header div").text(defaultTodolist.title);
            renderTheTodolist(defaultTodolist);
            

            $("#left-section article .category:eq(0)").addClass("selected-menu");
        }

        localStorage.setItem("database", JSON.stringify(database));


    })
}


function addNewItemBTN() {
    $("#add-bar input").on("keydown", function(e) {
        if(e.key == "Enter") {
            let itemName = $("#add-bar input").val();
            if(itemName.length) {
                let todolistName = $("#todolist header div").text();

                addNewItem(todolistName, {itemName: itemName, itemId: -1, completed : false});
    
                renderTheTodolist(getTodolist(todolistName));
    
                $("#add-bar input").val("").focus();
                localStorage.setItem("database", JSON.stringify(database));

                
                $(".selected-menu").find(".count").text(findNotCompletedItemCount(todolistName) ? findNotCompletedItemCount(todolistName) : "");
            }

        }
    })

    $("#add-bar p").on("click", function() {
        let itemName = $("#add-bar input").val();
        if(itemName.length) {
            let todolistName = $("#todolist header div").text();

            addNewItem(todolistName, {itemName: itemName, itemId: -1, completed : false});

            renderTheTodolist(getTodolist(todolistName));

            $("#add-bar input").val("").focus();
            localStorage.setItem("database", JSON.stringify(database));

            
            $(".selected-menu").find(".count").text(findNotCompletedItemCount(todolistName) ? findNotCompletedItemCount(todolistName) : "");
        }

    })
}

function itemBTN() {
    $("body").on("click", ".item" ,function(e) {
        let itemId = $(this).attr("value");
        let todolistName = $("#todolist header div").text();
        let item = getItem(todolistName, itemId);

        $(this).find("p").toggleClass("completed");
        if($(this).find("input").prop("checked")) {
            $(this).find("input").prop("checked", false);
            item.completed = false;
        } else {
            $(this).find("input").prop("checked", true);
            item.completed = true;
        }
        localStorage.setItem("database", JSON.stringify(database));
        $(".selected-menu").find(".count").text(findNotCompletedItemCount(todolistName) ? findNotCompletedItemCount(todolistName) : "");
    });

    $("body").on("click", ".item input", function(e) {
        e.stopPropagation();

        let itemId = $(this).parent().attr("value");
        let todolistName = $("#todolist header div").text();
        let item = getItem(todolistName, itemId);

        if($(this).prop("checked")) {
            $(this).parent().find("p").addClass("completed");
            item.completed = true;
        }else {
            $(this).parent().find("p").removeClass("completed");
            item.completed = false;
        }

        localStorage.setItem("database", JSON.stringify(database));
        $(".selected-menu").find(".count").text(findNotCompletedItemCount(todolistName) ? findNotCompletedItemCount(todolistName) : "");
    });
}

function localLoader() {
    let db = [
        {name: "Erdem Atila",
        section: "01",
        id: 22002777,
        image:"./img/erdem.jpeg",
        email:"erdem.atila@ug.bilkent.edu.tr",
        todolists : [{
            title : "Shopping List",
            items: [
                {
                itemName: "Grocery Shopping",
                itemId: 1,
                completed: false
                },
                {
                itemName: "Milk",
                itemId: 2,
                completed: false
                },
                {
                itemName: "Apple",
                itemId: 3,
                completed: false
                },
                {
                itemName: "Milka",
                itemId: 4,
                completed: false
                }
        ]
        },
        {
            title : "Mourning Routine",
            items: [
                {
                itemName: "Get up at 6.00 am",
                itemId: 1,
                completed: false
                },
                {
                itemName: "Walking",
                itemId: 2,
                completed: false
                }
        ]
        }
    ]
        },
        {name: "Kerem Demirel",
        section: "03",
        id: 2134643234,
        image:"./img/kerem.jpeg",
        email:"kerem.demirel@ug.bilkent.edu.tr",
        todolists : [{
            title : "Exams",
            items: [
                {
                itemName: "Law",
                itemId: 1,
                completed: false
                },
                {
                itemName: "Eng",
                itemId: 2,
                completed: false
                }
        ]
        }
    ]
        },
        {name: "Barış Cihanoğlu",
        section: "08",
        id: 124523,
        image:"./img/baris.jpeg",
        email:"baris.cihanoglu@ug.bilkent.edu.tr",
        todolists : [{
            title : "Book",
            items: [
                {
                itemName: "Chpter1",
                itemId: 1,
                completed: false
                },
                {
                itemName: "Introduction",
                itemId: 2,
                completed: false
                }
        ]
        },
        {
            title : "Life",
            items: [
                {
                itemName: "live",
                itemId: 1,
                completed: false
                },
                {
                itemName: "Eat",
                itemId: 2,
                completed: false
                },
                {
                itemName: "Love",
                itemId: 2,
                completed: false
                }
        ]
        }
    ]
        }
    ];
    
    localStorage.setItem("database", JSON.stringify(db));
    return db;
}


function addNewTodolist(newTDL) {
    database[userIndex].todolists.push(newTDL);
}

function addNewItem(todolistName, item) {
    for (let i =0; i<database[userIndex].todolists.length; i++) {
        if(database[userIndex].todolists[i].title == todolistName) {
            let itemCount = database[userIndex].todolists[i].items.length;
            let itemId = 1;
            if(itemCount > 0) {
                let lastItemId = database[userIndex].todolists[i].items[itemCount -1].itemId;
                itemId = lastItemId + 1;
            }
            item.itemId = itemId;
            console.log(item);
            database[userIndex].todolists[i].items.push(item);
        }
    }
}

function deleteItem(todolistName, itId, userIndex) {
    for (let i =0; i<database[userIndex].todolists.length; i++) {
        if(database[userIndex].todolists[i].title == todolistName) {
            let itemCount = database[userIndex].todolists[i].items.length;
            if(itemCount > 0) {
                let itemIndex = -1;
                for(let a = 0; a< itemCount; a++) {
                    if(database[userIndex].todolists[i].items[a].itemId == itId) {
                        itemIndex = a;
                    }
                }
                if(itemIndex >= 0) {
                    database[userIndex].todolists[i].items.splice(itemIndex, 1);
                }
            }
        }
    }
}

function deleteTodolist(todolistName) {
    let index = -1;
    for (let i =0; i<database[userIndex].todolists.length; i++) {
        if(database[userIndex].todolists[i].title == todolistName) {
            index = i;
        }
    }

    database[userIndex].todolists.splice(index,1);

}

function findNotCompletedItemCount(todolistName) {
    let count = 0;
    for (let i =0; i<database[userIndex].todolists.length; i++) {
        if(database[userIndex].todolists[i].title == todolistName) {
            for (let item of database[userIndex].todolists[i].items) {
                if(!item.completed) {
                    count ++;
                }
            }
        }
    }

    return count;
}

function findTodolistCount() {
    return database[userIndex].todolists.length;
}

function getItem(todolistName, itId) {
    for (let i =0; i<database[userIndex].todolists.length; i++) {
        if(database[userIndex].todolists[i].title == todolistName) {
            for (let a =0; a < database[userIndex].todolists[i].items.length ; a++) {
                if(database[userIndex].todolists[i].items[a].itemId == itId) {
                    return database[userIndex].todolists[i].items[a];
                }
            }
        }
    }
}

function getTodolist(todolistName) {
    for (let i =0; i<database[userIndex].todolists.length; i++) {
        if(database[userIndex].todolists[i].title == todolistName) {
            return database[userIndex].todolists[i];
        }
    }
}
