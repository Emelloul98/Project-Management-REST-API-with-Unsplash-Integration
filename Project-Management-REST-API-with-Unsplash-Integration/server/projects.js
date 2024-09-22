const fs = require('fs');
const data_page = require('../projects.json');
const schemes = require('./validationSchemes');
const axios = require('axios');
const e = require('cors');
const unsplash_key = "Sy1PggaLY-2DVNMJy6M_G96JtrHNkSGHY55FPSzrfWw";


/* 
    function name: readFile.
    function description: Read data from the json file that simulates a database.
    input: filePath, encoding method.
    output: JSON object that has the file content.
*/
function readFile(filePath = './projects.json', encoding = 'utf8'){ 
    try {
        const data = fs.readFileSync(filePath, encoding);
        return JSON.parse(data);
    } catch (err) {
        throw err;
    }
};
/*
    function name: writeToFile.
    function description: Write data to the json file that simulates a database.
    input: data, filePath, encoding method.
    output: None.
*/ 
function writeToFile(data, filePath = './projects.json', encoding = 'utf8'){ 
    try {
        const jsonData = JSON.stringify(data, null, 2);  // Convert object to JSON string with 2 spaces for indentation
        fs.writeFileSync(filePath, jsonData, encoding);
    } catch (err) {
        throw err;
    }
};
/* 
    function name: generateRandomID.
    function description: Generate a random ID for the project ID.
    input: None.
    output: A 13 digits random ID.
*/
const generateRandomID = () => {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var result = '';
    var charactersLength = characters.length;
    for (var i = 0; i < 13; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
/*
    function name: generateUniqueID.
    function description: Generate a unique ID for the project ID by calling generateRandomID.
    input: all existing projects in the json Data file.
    output: A unique 13 digits random ID.
*/
function generateUniqueID(projects) {
    let newID;
    do {
        newID = generateRandomID();
    } while (projects.hasOwnProperty(newID));
    return newID;
}
/*
    function name: isValidDate.
    function description: Check if the date is valid.
    input: timestamp.
    output: True if the date is valid, False otherwise.
*/
function isValidDate(timestamp) {
    let timeAsNumber = Number(timestamp);
    if(timeAsNumber < 0) return false;

    let date = new Date(timeAsNumber*1000);
    if (date.getDate() === 1 && date.getMonth() === 0 && date.getFullYear() === 1970) {
        return false;
    }
    return true;
}

module.exports = {
    /*
        function name: CreateProject.
        function description: A server function that Creates a new project and adding him to the json Data file. 
        input: A request from the user with projects details.
        output: A response to the user with the new project ID, or an error massage.
    */
    CreateProject: async function(req, res){
        try{
            await schemes['createProjectsSchema'].validate({
                body: req.body,
            });
            // Check if the start date is valid
            if(!isValidDate(req.body.start_date)){
                res.status(400).json({ message: 'Invalid start date' });
                return;
            }
            // Read the projects from the file
            let projects = readFile();

            let new_id = generateUniqueID(projects);
            // building a new project object.
            const newProject = {
                name: req.body.name,
                summary: req.body.summary,
                manager: req.body.manager,
                team: req.body.team,
                start_date: req.body.start_date,
                id: new_id
            };
            // Add the new project to the projects object
            projects[new_id] = newProject;
            // Save the updated projects back to the file
            writeToFile(projects);
            res.status(200).json({id: new_id});
        }catch (error) {
            if (error.name === 'ValidationError') {
                // Send a 400 status code for validation errors
                res.status(400).json({ message: 'Failed to create project', error: error.message });
            } else {
                // Send a 500 status code for all other errors
                res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        }

    },
    /*
        function name: updateProject.
        function description: A server function that updates an existing project in the json Data file.
        input: A request from the user with the project ID and the new project details.
        output: A response to the user with a success message (200), or an error massage. 
    */
    updateProject: async function(req, res){
        try{
            await schemes['updateProjectsSchema'].validate({
                params: req.params,
                body: req.body,
            });
            // exports the project_id from the request parameters
            const project_id = req.params.project_id;
            // Read the projects from the file
            const projects = readFile();
            // Check if the project exists
            if (!projects.hasOwnProperty(project_id)){
                res.status(404).json({ message: 'Project not found' });
                return;
            }
            // Update the project details
            for (let key in projects[project_id]) {
                if ((key === "name" || key === "summary" || key === "start_date") && req.body.hasOwnProperty(key)) {
                    if (key === "start_date" && !isValidDate(req.body[key])) { 
                        res.status(400).json({ message: 'Invalid start date' });
                        return;
                    }
                    projects[project_id][key] = req.body[key];
                }
            }
            // Save the updated projects back to the file
            writeToFile(projects);
            res.status(200).json({ message: 'Project updated successfully'}); 
        }catch (error) {
            if (error.name === 'ValidationError') {
                // Send a 400 status code for validation errors
                res.status(400).json({ message: 'Failed to update project', error: error.message });
            } else {
                // Send a 500 status code for all other errors
                res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        }
        
    },
    /*
        function name: addImagesToProject.
        function description: A server function that adds an image to an existing project in the json Data file.
        input: A request from the user with the project ID and the image details.
        output: A response to the user with a success message (200), or an error massage. 
    */
    addImagesToProject: async function(req, res){
        try{
            await schemes['addImagesToProjectSchema'].validate({
                params: req.params,
                body: req.body,
            });
            // exports the project_id from the request parameters
            const project_id =  req.params.project_id;
            // Read the projects from the file
            const projects = readFile();
            // Check if the project exists
            if (!projects.hasOwnProperty(project_id)){
                res.status(404).json({ message: 'Project not found' });
                return;
            }
            // building a new image object.
            const image = {
                id: req.body.id,
                thumb: req.body.thumb,
                description: req.body.description
            }

            // Check if the image already exists in the project
            if (!projects[project_id].hasOwnProperty("images")){ 
                projects[project_id]["images"] =  [image];
            }else{
                const imageExists = projects[project_id].images.some(proj_image => proj_image.id === image.id);
                if (!imageExists) {
                    projects[project_id].images.push(image);
                }else{  
                    res.status(400).json({ message: 'Image already exist in the project' });
                    return;
                }
            }
            // Save the updated projects back to the file
            writeToFile(projects);
            res.status(200).json({ message: 'Project updated successfully'});
        }catch (error) {
            if (error.name === 'ValidationError') {
                // Send a 400 status code for validation errors
                res.status(400).json({ message: 'Failed to add image to project', error: error.message });
            } else {
                // Send a 500 status code for all other errors
                res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        }
        
        
    },
    /*
        function name: getProject.
        function description: A server function that returns a project from the json Data file.
        input: A request from the user with the project ID.
        output: A response to the user with the project details, or an error massage if the project is not found.
    */
    getProject: async function(req, res){
        try{
            await schemes['getProjectSchema'].validate({
                params: req.params,
            });
            // exports the project_id from the request parameters
            const project_id =  req.params.project_id;
            // Read the projects from the file
            const projects = readFile();
            // Check if the project exists
            if (!projects.hasOwnProperty(project_id)){
                res.status(404).json({ message: 'Project not found' });
                return;
            }
            // send the project details to the user
            res.status(200).json(projects[project_id]);
        }catch (error) {
            if (error.name === 'ValidationError') {
                // Send a 400 status code for validation errors
                res.status(400).json({ message: 'Failed to get project', error: error.message });
            } else {
                // Send a 500 status code for all other errors
                res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        }
        
    },
    /*
        function name: getProjects.
        function description: A server function that returns all the projects from the json Data file.
        input: None.
        output: A response to the user with all the projects details. 
    */
    getProjects: function(req, res){
        try{
            const projects = readFile();
            res.status(200).json(projects);
        }catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
    /*
        function name: getImagesFromProject.
        function description: A server function that returns all the images from an existing project in the json Data file.
        input: A request from the user with the project ID.
        output: A response to the user with all the images details, or an error massage if the project is not found.
    */
    deleteImageFromProject: async function(req, res){
        try {
            await schemes['deleteImageFromProjectSchema'].validate({
                params: req.params,
            });
            // exports the project_id and the image_id from the request parameters
            const project_id = req.params.project_id;
            const img_id = req.params.img_id;
            // Read the projects from the file
            const projects = readFile();
            // Check if the project exists
            if (!projects.hasOwnProperty(project_id)) {
                res.status(404).json({ message: 'Project not found' });
                return;
            }
            // Check if the project has images
            if (!projects[project_id].hasOwnProperty("images")) {
                res.status(404).json({ message: 'No images found for this project' });
                return;
            }
            // Check if the image exists in the project
            var is_img_exist = false;
            projects[project_id].images = projects[project_id].images.filter(image => {
                if (image['id'] === img_id) {
                    is_img_exist = true;
                    return false; // Remove this image
                }
                return true; // Keep this image
            });
    
            if (!is_img_exist) {
                res.status(404).json({ message: 'Image not found' });
                return;
            }
            // Save the updated projects back to the file (assuming writeFile is a function that does this)
            writeToFile(projects);
            res.status(200).json({ message: 'Image deleted successfully' });
        } catch (error) {
            if (error.name === 'ValidationError') {
                // Send a 400 status code for validation errors
                res.status(400).json({ message: 'Failed to delete image', error: error.message });
            } else {
                // Send a 500 status code for all other errors
                res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        }
    },
    /*
        function name: deleteProject.
        function description: A server function that deletes an existing project from the json Data file.
        input: A request from the user with the project ID.
        output: A response to the user with a success message (200), or an error massage if the project is not found. 
    */
    deleteProject: async function(req, res){
        try {
            await schemes['deleteProjectSchema'].validate({
                params: req.params,
            });
            // exports the project_id from the request parameters
            const project_id = req.params.project_id;
            // Read the projects from the file
            const projects = readFile();
            // Check if the project exists
            if (!projects.hasOwnProperty(project_id)) {
                res.status(404).json({ message: 'Project not found' });
                return;
            }
            // Delete the project
            delete projects[project_id];
            // Save the updated projects back to the file
            writeToFile(projects);
            res.status(200).json({ message: 'Project deleted successfully' });
        } catch (error) {
            if (error.name === 'ValidationError') {
                // Send a 400 status code for validation errors
                res.status(400).json({ message: 'Failed to delete project', error: error.message });
            } else {
                // Send a 500 status code for all other errors
                res.status(500).json({ message: 'Internal Server Error', error: error.message });
            }
        }
    },
    /*
        function name: searchImages.
        function description: A server function that searches for images in the Unsplash API.
        input: A request from the user with the search word.
        output: A response to the user with the 10 images details, or an error massage if the search failed. 
    */
    searchImages : async (req, res) => {
        // exports the search word from the request parameters
        const search_word = req.params.search_name;
        //builing the url for the unsplash API
        const url = `https://api.unsplash.com/search/photos?query=${search_word}&client_id=${unsplash_key}&per_page=10&page=1`;
        try {
            // Get the images from the Unsplash API using axios
            const response = await axios.get(url);
            const results = response.data.results;
            // Format the results to only include the id, thumb, and description
            const formattedResults = results.map(result => ({
                id: result.id,
                thumb: result.urls.thumb,
                description: result.description
            }));
            // Send the formatted results to the user
            res.status(200).json(formattedResults);
        } catch (error) {
            res.status(500).json({ message: 'Internal Server Error', error: error.message });
        }
    },
};
