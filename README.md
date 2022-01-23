# timmy-timer
A lightweight app for scheduling timers with a callback

## Local installation
* Clone the repository
* Run `npm install` in the project's root directory.
* You need to install the mysql and redis (on macos, recommended to use brew)
* Run `npm run serve` to start the server using `nodemon`.

## Deployment with Docker
The full app with dependecies can be deployed using Docker and Docker Compose:
* Download docker (https://www.docker.com/products/docker-desktop)
* Clone the repository.
* Run `docker-compose up -d` - this will do the following:
  * Build the app and create an image.
  * Spawn three containers - app (nodejs), mysql and redis.
* The app will be available on `localhost:3000` (default port; can be changed in the `.env` file).

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
* MySQL - persisting timers.
* Redis - queue management

## DB Persisting and Queue Management
* The app is using **MySQL** as the persistence layer. All created timers will be saved to the `timmy.timer` table.
* Queue management is done using redis:
  * Using a `ZSET` (sorted set) to add newly created timers, sorted by the future execution time.
  * A worker is querying the queue every x milliseconds (defined by the `QUEUE_PROCESS_EVERY_MS` env variable).
  * If there are jobs to be executed, they will be removed from the queue and processed.
