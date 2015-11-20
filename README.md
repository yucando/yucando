# Yucando Documentation

## API endpoints 
required for Dr. Villafane's class

- [x] `GET /task/id/:id`

Return task with Mongo ID

- [x] `GET /task/points/:points`

Return all tasks with given number of points

- [x] `GET /task/project/:project`

Return all tasks in a given project name, where project name is a string

- [x] `GET /task/time_min/:seconds`

Return all tasks with durations longer than time_min in seconds

- [x] `GET /task/time_max/:seconds`

Return all tasks with durations shorter than time_max in seconds
 
- [x] `DELETE /task/:id`

Delete all tasks with Mongo ID

### Deferred methods

- [x] ~~`PUT /task/:id`~~ `PUT /task/:name`

Create a task with ~~Mongo ID~~ task name

- [x] `GET /task`

Return all tasks ~~URIs~~ as JSON array

- [x] `POST /task`

Create a new task, return ~~URI of~~ created record in JSON array

### Authentication

- [x] JWT authentication

- [x] Hashing passwords with salt

### UI Access to all methods

- [ ] Include project pane

- [ ] Show points
