# Yucando Documentation

## API endpoints (required for Dr. Villafane's class)

[ ] `GET /task/id/:id`

Return task with Mongo ID

[ ] `GET /task/points/:points`

Return all tasks with given number of points

[ ] `GET /task/project/:project`

Return all tasks in a given project name, where project name is a string

[ ] `GET /task/time_min/:seconds`

Return all tasks with durations longer than time_min in seconds

[ ] `GET /task/time_max/:seconds`

Return all tasks with durations shorter than time_max in seconds
 
[ ] `DELETE /task/:id`

Delete all tasks with Mongo ID

### Deferred methods

[ ] `PUT /task/:id`

Create a task with Mongo ID

[ ] `GET /task`

Return all tasks URIs as JSON array

[ ] `POST /task`

Create a new task, return URI of created record in JSON array
