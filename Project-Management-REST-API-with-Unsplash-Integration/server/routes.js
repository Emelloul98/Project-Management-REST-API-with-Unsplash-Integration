// Description: This file contains the routes for the project.
const express = require('express');
// Import the project.js file that has all the server functionalities.
const projectRoutes = require('./projects.js');
var router = express.Router();
/* A route that calls the CreateProject function */
router.post('/projects', projectRoutes.CreateProject);
/* A route that calls the UpdateProject function */
router.put('/projects/:project_id', projectRoutes.updateProject);
/* A route that calls the AddImagesToProject function */
router.post('/projects/:project_id/images', projectRoutes.addImagesToProject);
/* A route that calls the GetProject function */
router.get('/projects/:project_id', projectRoutes.getProject);
/* A route that calls the GetProjects (full list) function */
router.get('/projects', projectRoutes.getProjects);
/* A route that calls the deleteImageFromProject function */
router.delete('/projects/:project_id/images/:img_id', projectRoutes.deleteImageFromProject);
/* A route that calls the deleteProject function */
router.delete('/projects/:project_id', projectRoutes.deleteProject);
/* A route that calls the searchImages function */
router.get('/imagesearch/:search_name',projectRoutes.searchImages);

// Export the router.
module.exports = router;