var images_array; // Array to hold fetched images
var numOfMembers; // Counter to track number of team members
var currentlyPressedImg = null;
$(document).ready(function () {
    // Call fetchProjects to load the projects initially
    fetchProjects();

    // Event listener for adding a new project
    $('.add-project-btn').on('click', addProjectClick);

    // Event listener for closing the popup
    $('#close-btn-add-photo').on('click', function () {
        $('#popup-search-page').hide();
        $('#overlay').hide();
    });

    // Event listeners for sorting projects
    $('#sort-select').change(() => fetchProjects());
    $('#sort-direction').change(() => fetchProjects());

    // Custom validation method for checking full year format
    $.validator.addMethod("fullYear", function (value, element) {
        const regex = /\b\d{4}\b/;
        return this.optional(element) || regex.test(value);
    }, "Please enter a valid date in this format: MM.DD.YYYY.");

});


// Convert date string to timestamp
function dateToTimestamp(dateString) {
    const separatorRegex = /[./-]/;  
    var [month, day, year] = dateString.split(separatorRegex);

    let formattedDate = `${year}-${month}-${day}`;
    const dateObject = new Date(formattedDate);
    return (dateObject.getTime()/1000).toString(); // Returns timestamp inseconds 
}

// Convert timestamp to date string
function timestampToDate(timestamp) {
    // Create a Date object from the timestamp
    let date = new Date(Number(timestamp)*1000);

    // Extract the day, month, and year from the Date object
    let day = date.getDate();
    let month = date.getMonth() + 1; // Months are 0-indexed
    let year = date.getFullYear().toString(); 

    // Format day and month to ensure they are in 'dd' and 'mm' format
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;

    // Construct the date string in 'mm.dd.yyyy' format
    let formattedDate = `${month}.${day}.${year}`;

    return formattedDate;
}


// Fetch projects from the server and display them
function fetchProjects() {
    $.ajax({
        type: 'GET',
        url: '/projects',
        contentType: 'application/json',
        success: function (data) {
            $('#projects-table').empty();

            // Define the column names
            const columns = ['ID', 'Project Name', 'Manager Name', 'Start Date', 'Description', 'Actions'];

        
            var projects = Object.values(data);
            var sortBy = $('#sort-select').val();
            var sortDirection = $('#sort-direction').val();

            // Sorting logic based on user selection
            if (sortBy === 'startDate') {
                projects.sort((a, b) => sortDirection === 'asc' ? a.start_date - b.start_date : b.start_date - a.start_date);
            } else if (sortBy === 'projectName') {
                projects.sort((a, b) => sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
            } else if (sortBy === 'managerName') {
                projects.sort((a, b) => sortDirection === 'asc' ? a.manager.name.localeCompare(b.manager.name) : b.manager.name.localeCompare(a.manager.name));
            }


            // Iterate over the projects and create table rows
            Object.values(projects).forEach(project => {

                const row = $('<tr>');
                $('#projects-table').append(row);

                columns.forEach(column => {
                    const td = $('<td>', { class: 'buttons-cell' });
                    row.append(td);
                    var proj_id = project.id;
                    if (column === 'Actions') {
                        // Action buttons for each project
                        $(td).append($('<button>', {
                            text: 'Edit',
                            class: 'table-buttons',
                            id: proj_id + 'edit',
                            click: () => editProject(project.id, project.name, project.summary, project.start_date)
                        }));

                        $(td).append($('<button>', {
                            text: 'Add Picture',
                            class: 'table-buttons',
                            id: proj_id + 'add',
                            click: () => addPictureClick(project.id)
                        }));

                        $(td).append($('<button>', {
                            text: 'Show Pictures List',
                            class: 'table-buttons',
                            id: proj_id + 'show',
                            click: () => showProjectImages(project.id)
                        }));

                        $(td).append($('<button>', {
                            text: 'Delete',
                            class: 'table-buttons',
                            id: proj_id + 'delete',
                            click: () => deleteProject(project.id)
                        }));

                    } else {

                        // Add project data for other columns
                        switch (column) {
                            case 'ID':
                                td.text(project.id);
                                break;
                            case 'Project Name':
                                td.text(project.name);
                                break;
                            case 'Manager Name':
                                td.text(project.manager.name);
                                break;
                            case 'Start Date':
                                td.text(timestampToDate(project.start_date));
                                break;
                            case 'Description':
                                td.text(project.summary).addClass('description-cell');
                                break;
                            default:
                                td.text('');
                        }
                    }
                });
            });
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.error('Error fetching project data:', errorThrown);
        }
    });
}

// Fetch project images from the server
async function getProjectImages(id) {
    var images;
    await $.ajax({
        type: 'GET',
        url: `/projects/${id}`,
        contentType: 'application/json',
        success: function (data) {
            images = data.images;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            images = null;
        }
    });
    return images;
}


// Event listener function for adding a new project
function addProjectClick() {

    numOfMembers = 1; // Reset the number of members to 1

    $('#new-members').empty();
    $('#addProjectForm input').val('');

    // Event listener to close the add project popup
    $('#close-btn-add-proj').on('click', function () {
        $('#popup-add-project').hide();
        $('#overlay').hide();
    });

    AddProjectFormValidation(); // Apply validation rules to the form
    applyValidationToMemberInfo(); // Apply validation rules to the first member inputs

    // Event listener to add a new member input section
    $('#add-member-btn').off('click').on('click', function () {
        numOfMembers++;
        var memberDiv = $('<div>', { class: 'member-info' });
        memberDiv.append(
            $('<small>', { text: 'Member Info:' }),
            $('<input>', {
                type: 'text',
                name: `team-member-name-${numOfMembers}`,
                id: `team-member-name-${numOfMembers}`,
                class: 'input-control',
                placeholder: 'Name'
            }),
            $('<input>', {
                type: 'email',
                name: `team-member-email-${numOfMembers}`,
                id: `team-member-email-${numOfMembers}`,
                class: 'input-control',
                placeholder: 'Email'
            }),
            $('<input>', {
                type: 'text',
                name: `team-member-role-${numOfMembers}`,
                id: `team-member-role-${numOfMembers}`,
                class: 'input-control',
                placeholder: 'Role'
            }),
            $('<button>', {
                type: 'button',
                class: 'btn btn-danger delete-member',
                html: '<i class="fas fa-trash"></i>'
            })
        );
        $('#new-members').append(memberDiv);
        applyValidationToMemberInfo(); // Apply validation rules to the new member inputs
    });

    // Event listener to delete a member input section
    $(document).on('click', '.delete-member', function () {
        $(this).closest('.member-info').remove();
    });

    //show the popup window      
    $('#popup-add-project').show();
    $('#overlay').show();
}

// Add validation rules to the add project form
function AddProjectFormValidation() {

    // Custom validation method for checking valid email format
    $.validator.addMethod("isValidEmail", function(value, element) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return this.optional(element) || emailRegex.test(value);
    }, "Please enter a valid email address.");

    // Apply validation rules to the form
    $("#addProjectForm").validate({
        rules: {
            'project-name': {
                required: true
            },
            'manager-email': {
                isValidEmail: true,
                email: true,
                required: true
            },
            'description': {
                required: true,
                minlength: 20,
                maxlength: 80
            },
            'manager-name': {
                required: true 
            },
            'start-date': {
                required: true,
                date: true,
                fullYear: true
            }
        },
        messages: {
            'project-name': {
                required: "Project name is required."
            },
            'manager-email': {
                email: "Please enter a valid email address.",
                required: "Manager's email is required."
            },
            'description': {
                required: "Project description is required.",
                minlength: "Description must be at least 20 characters long.",
                maxlength: "Description must not exceed 80 characters."
            },
            'manager-name': {
                required: "Manager's name is required."
            },
            'start-date': {
                required: "Start date is required.",
                date: "Please enter a valid date in this format: MM.DD.YYYY."
            }
        }
    });


    // Event listener for adding a new project
    $('#addProjectForm').off('submit').on('submit', function (event) {

        event.preventDefault();

        if (!$(this).valid()) return;

        // Gather form values
        const projectName = $('#addProjectForm #project-name').val();
        const managerName = $('#addProjectForm #manager-name').val();
        const managerEmail = $('#addProjectForm #manager-email').val();
        const startDate = $('#addProjectForm #start-date').val();
        const projectDescription = $('#addProjectForm #description').val();

        const members = [];
        $('#team-members-group .member-info').each(function () {
            const memberName = $(this).find('input[placeholder="Name"]').val();
            const memberEmail = $(this).find('input[placeholder="Email"]').val();
            const memberRole = $(this).find('input[placeholder="Role"]').val();
            members.push({ name: memberName, email: memberEmail, role: memberRole });
        });

        // Create project object
        const project = {
            name: projectName,
            summary: projectDescription,
            manager: { name: managerName, email: managerEmail },
            team: members,
            start_date: dateToTimestamp(startDate),
        };

        // Send the project object to the server
        $.ajax({
            type: 'POST',
            url: '/projects',
            contentType: 'application/json',
            data: JSON.stringify(project),
            success: function (data) {
                fetchProjects();
                $('#popup-add-project').hide();
                $('#overlay').hide();
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.error('Error creating project:', errorThrown);
            }
        });

    });

}

// Apply validation rules to the new member inputs that are added dynamically (also to the first member inputs)
function applyValidationToMemberInfo() {
    $("#team-members-group").find(`input[name="team-member-name-${numOfMembers}"]`).rules("add", {
        required: true,
        messages: {
            required: "Team member's name is required.",
        }
    });
    $("#team-members-group").find(`input[name="team-member-email-${numOfMembers}"]`).rules("add", {
        isValidEmail: true,
        email: true,
        required: true,
        messages: {
            email: "Please enter a valid email address.",
            required: "Team member's email is required."
        }
    });
    $("#team-members-group").find(`input[name="team-member-role-${numOfMembers}"]`).rules("add", {
        required: true,
        messages: {
            required: "Team member role is required."
        }
    });
}

// Event listener function for editing a project
function editProject(id, name, summary, start_date) {
    // Populate the form with the project data
    $('#updateProjectForm #project-name').val(name);
    $('#updateProjectForm #description').val(summary);
    $('#updateProjectForm #start-date').val(timestampToDate(start_date));

    initBeforeSentUpdateProjectForm(id);

    $("#project-name-error").remove();
    $("#start-date-error").remove();
    $("#description-error").remove();

    //show the popup window   
    $('#popup-update-project').show();
    $('#overlay').show();
}


// Initialize the update project form before sending 
function initBeforeSentUpdateProjectForm(id) {
    // Event listener for closing the popup
    $('#close-btn-update-proj').on('click', function () {

        $('#popup-update-project').hide();
        $('#overlay').hide();
    });

    // Apply validation rules to the form
    $("#updateProjectForm").validate({
        rules: {
            'project-name': {
                required: true
            },
            'description': {
                required: true,
                minlength: 20,
                maxlength: 80
            },
            'start-date': {
                required: true,
                date: true,
                fullYear: true
            }
        },
        messages: {
            'project-name': {
                required: "Project name is required."
            },
            'description': {
                required: "Project description is required.",
                minlength: "Description must be at least 20 characters long.",
                maxlength: "Description must not exceed 80 characters."
            },
            'start-date': {
                required: "Start date is required.",
                date: "Please enter a valid date in this format: MM.DD.YYYY."
            }
        }
    });

    // Event listener for updating the project
    $('#updateProjectForm').off('submit').on('submit', function (event) {

        event.preventDefault();

        if (!$(this).valid()) return;

        // Gather form values
        const projectName = $('#updateProjectForm #project-name').val();
        const startDate = $('#updateProjectForm #start-date').val();
        const projectDescription = $('#updateProjectForm #description').val();

        // Create project object
        const project = {
            name: projectName,
            summary: projectDescription,
            start_date: dateToTimestamp(startDate),
        };


        // Send the project object to the server
        $.ajax({
            type: 'PUT',
            url: `/projects/${id}`,
            contentType: 'application/json',
            data: JSON.stringify(project),
            success: function (data) {
                fetchProjects();
                $('#popup-update-project').hide();
                $('#overlay').hide();
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.error('Error creating project:', errorThrown);
            }
        });

    });

}

// Event listener function for adding a picture to a project
function addPictureClick(id) {

    $('#search-input').val('');
    $('.images_div').remove();
    $('.add_img_button_div').remove();

    $('#popup-search-page').show();
    $('#overlay').show();
    
    const search_button = $('#search-button');
    search_button.on('click', function () {
        const search_word = $('#search-input').val();
        // Fetch images from the server based on the search word
        $.ajax({
            type: 'GET',
            url: `/imagesearch/${search_word}`,
            contentType: 'application/json',
            success: function (data) {
                images_array = data;
                const existingContainer = document.querySelector(`.images_div`);
                if (existingContainer) {
                    existingContainer.parentNode.removeChild(existingContainer);
                }
                const existingButton = document.querySelector('.add_img_button');
                if (existingButton) {
                    // Remove the existing button
                    existingButton.remove();
                }
                const imagesPerGroup = 5;
                const numGroups = Math.ceil(images_array.length / imagesPerGroup); // 5 images per group, each group in a row
                $('#popup-search-page').append(
                    $('<div>', { class: 'images_div' })
                );
                currentlyPressedImg = null;
                var index = 0;
                
                // iterate over the number of groups and add images to each group
                for (let i = 0; i < numGroups; i++) {
                    $('.images_div').append(
                        $('<div>', {
                            class: `group${i + 1}`
                        })
                    );
                    // Add 5 images to each group
                    for (let j = 0; j < imagesPerGroup; j++) {
                        if (index < images_array.length) {
                            $(`.group${i + 1}`).append(
                                $('<img>', {
                                    id: images_array[index].id,
                                    src: images_array[index].thumb,
                                }).on('click', function () {
                                    if (currentlyPressedImg && currentlyPressedImg !== this) {
                                        currentlyPressedImg.classList.remove('img-press-effect');
                                    }
                                    if (currentlyPressedImg === this) {
                                        currentlyPressedImg.classList.remove('img-press-effect');
                                        currentlyPressedImg = null;
                                    } else {
                                        this.classList.toggle('img-press-effect');
                                        currentlyPressedImg = this;
                                    }
                                })
                            );
                            index++;
                        }
                    }
                }
                // Add button to add image to project
                var add_img_button_div = $('<div>', { class: 'add_img_button_div' });
                add_img_button_div.append(
                    $('<button>', {
                        text: 'add image to project',
                        class: 'add_img_button',
                    }).on('click', () => add_img_to_project(id)) // Add the selected image to the project
                );
                
                $('#popup-search-page').append(add_img_button_div);
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.error('Error:', errorThrown);
            }
        });
    });
}

// Add image to project
async function add_img_to_project(id) {
    // Check if an image is selected
    if (currentlyPressedImg === null) {
        showNotificationMessage('Please select an image.', "red");
        return;
    }
    currentlyPressedImg.classList.remove('img-press-effect');
    const images = await getProjectImages(id);

    if(images !== null && images !== undefined && images.length > 0){
        // Check if the img.id already exists in the images array
        const exists = images.some(image => image.id === currentlyPressedImg.id);
        if (exists) {
            showNotificationMessage('Image already exists in the project.', "red");
            return;
        }
    }

    // Find the image in the images_array
    let i = 0
    for (; i < images_array.length; i++) {
        if (images_array[i].id === currentlyPressedImg.id) {
            break;
        }
    }

    // check if the image has a description and set it to "no description" if it is null
    images_array[i].description = images_array[i].description === null ? "no description" : images_array[i].description;
    const image = images_array[i];
    // Send the image object to the server to add it to the project
    $.ajax({
        type: 'POST',
        url: `/projects/${id}/images`,
        contentType: 'application/json',
        data: JSON.stringify(image),
        success: function (data) {
            showNotificationMessage('Image added successfully.', "green");
            currentlyPressedImg = null;
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.error('Error deleting project:', errorThrown);
        }
    });
}


// Fetch project images from the server and display them in a popup window
async function showProjectImages(id) {
    const images = await getProjectImages(id);
    if (images === undefined || images.length === 0) { //no images or empty array
        showNotificationMessage('No images found for this project.', "red");
        return;
    }
    showPicturesList(id, images);
    $('#popup-project-images').show();
    $('#overlay').show();
}

// Display project images in a popup window
function showPicturesList(id, images) {

    // Event listener for closing the popup
    $('#close-btn-project-images').on('click', function () {
        $('#popup-project-images').hide();
        $('#overlay').hide();
    });

    $('.images-container').empty();

    if (images !== null) {
        if (images === undefined || images.length === 0) {
            showNotificationMessage('No images found for this project.', "red");
            return;
        }
        // Display images in rows of 6
        let row;
        for (let i = 0; i < images.length; i++) {
            if (i % 6 === 0) {
                row = $('<div>', { class: 'image-row' });
                $('.images-container').append(row);
            }
            const imgContainer = $('<div>', { class: 'img-container' });
            const imgElement = $('<img>', {
                src: images[i].thumb,
                class: 'project-images',
                id: images[i].id,
            });
            // Add delete button for each image
            const deleteButton = $('<button>', {
                text: 'Delete',
                class: 'delete-img-button',
            }).on('click', function () {
                delete_img_from_proj(id, imgElement[0], images); //on click delete the image from the project
            });

            imgContainer.append(imgElement);
            imgContainer.append(deleteButton);
            row.append(imgContainer);
        }

    } else {
        console.error('Error fetching project images:', errorThrown);
    }
}

// Delete image from project
function delete_img_from_proj(id, img, images) {
    // Send the image object to the server to delete it from the project
    $.ajax({
        type: 'DELETE',
        url: `/projects/${id}/images/${img.id}`,
        contentType: 'application/json',
        success: function (data) {
            // Remove the image from the images array, and show the updated list
            images = images.filter(image => image.id !== img.id);
            if (images.length === 0) {
                $('.images-container').empty();
            }else{
                showPicturesList(id, images);
            }
            showNotificationMessage('Image deleted successfully.', "green");
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.error('Error deleting project:', errorThrown);
        }
    });
}

// Delete project 
function deleteProject(id) {
    // Send the project id to the server to delete it
    $.ajax({
        type: 'DELETE',
        url: `/projects/${id}`,
        contentType: 'application/json',
        success: function (data) {
            fetchProjects();
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.error('Error deleting project:', errorThrown);
        }
    });
}

// Show notification message on the screen
function showNotificationMessage(message, color) {
    var notification;
    // Create a notification div based on the color, green for success, red for error.
    if (color === "green") {
        notification = $('<div>', { class: 'green_notification' });
    }
    else if (color === "red") {
        notification = $('<div>', { class: 'red_notification' });
    }
    else return;
    notification.text(message);
    $('body').append(notification);
    setTimeout(() => {
        notification.fadeOut(500, () => {
            notification.remove();
        });
    }, 1500); // Show notification for 1.5seconds
}
