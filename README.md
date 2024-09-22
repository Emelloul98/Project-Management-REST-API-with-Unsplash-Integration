# Distributed Project Management System with REST API and Unsplash Integration

A Node.js-based distributed project management system providing a REST API for managing projects, team members, and images. The system integrates with the Unsplash API for image search, supports CRUD operations, and stores project data in JSON format.

---

**Features:**
1. REST API for creating, updating, and deleting project records.
2. Integration with Unsplash API to search and add images to projects.
3. Manage team members and roles for each project.
4. Persistent JSON-based data storage.

---

**Components:**
1. Node.js server using Express to handle REST API requests.
2. Unsplash API integration for image management.
3. jQuery-based client interface with AJAX calls for CRUD operations.
4. JSON file for storing project and image data.

---

**How to Run:**
1. Clone the repository and navigate to the project directory.
2. Run `npm install` to install necessary dependencies (Express, axios, Unsplash API).
3. Start the server by running `npm start`. The server will run on port 3001.
4. Access the client-side interface via `http://localhost:3001` to manage projects.

---

**API Endpoints:**
1. `POST /projects` - Create a new project.
2. `PUT /projects/:id` - Update project details.
3. `DELETE /projects/:id` - Delete a project.
4. `GET /projects/:id` - Retrieve project details.
5. `GET /projects` - List all projects.
6. `POST /projects/:id/images` - Add an image to a project from Unsplash.
7. `DELETE /projects/:id/images/:imageId` - Remove an image from a project.

---

**Example Usage:**

- Create a new project with a unique ID, project name, and team members.
- Use Unsplash API to search and attach images to a project.
- Update project details and manage team roles through the REST API.
- Delete projects or remove attached images.

---

**Screenshots:**

![Projects table](https://github.com/Emelloul98/Project-Management-REST-API-with-Unsplash-Integration/blob/main/table.png)
![new project form](https://github.com/Emelloul98/Project-Management-REST-API-with-Unsplash-Integration/blob/main/project-form.png)
![Unsplash Image Search](https://github.com/Emelloul98/Project-Management-REST-API-with-Unsplash-Integration/blob/main/image-search.png)
![show project images](https://github.com/Emelloul98/Project-Management-REST-API-with-Unsplash-Integration/blob/main/project-images.png)
