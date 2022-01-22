# timmy-timer
A lightweight app for scheduling timers with a callback

## Assumptions
* The app is currently running on a single nodejs instance + single Sqlite instance.
* The app can be scaled up by deploying multiple instances of the app, and replacing the DB layer to a more performant one.

## Installation
* Clone the repository
* Run `npm install` in the project's root directory.

## Running the server
* Run `npm run start`

## APIs
### ```POST /timers```
Provide the time (hours, minutes, seconds) for the webhook and url.
Request body:
```
{
  "hours": int,
  "minutes": int,
  "seconds": int, 
  "url": string
}
```
The response is the id of the created timer:
```
{ "id": int }
```

### ```GET /timers/:id```
Returns the remaining seconds of the given timer `id`:
```
{
  "id": int,
  "time_left": int
}
```

## Stack
* NodeJS - backend runtime env
* ExpressJS - web application framework
* Sqlite3 - DB

## DB Persisting
The app is using **sqlite3** as the persistence layer for the following reasons:
* Doesn't require additional installation on the running machine (macos).
* Very fast and performant - using indices and no need for joins.
* Uses standard SQL - can be easily replaces by a more performant RDBMS DB if needed (MySQL, PostgreSQL).
