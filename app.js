const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

let db = null;
let dbPath = path.join(__dirname, "moviesData.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertPascalToCamel = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//1) Get all movies names API
app.get("/movies/", async (request, response) => {
  const getAllMoviesNamesQuery = `SELECT movie_name FROM movie`;
  const moviesArray = await db.all(getAllMoviesNamesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertPascalToCamel(eachMovie))
  );
});

//2) post movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const createMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES('${directorId}','${movieName}','${leadActor}')`;
  await db.run(createMovieQuery);
  response.send("Movie Successfully Added");
});

//3) Get movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id=${movieId}`;
  const movie = await db.get(getMovieQuery);
  response.send(convertPascalToCamel(movie));
});

//4) Put movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { movieName, leadActor, directorId } = movieDetails;
  const updateMovieQuery = `UPDATE movie SET movie_name='${movieName}',
    lead_actor='${leadActor}',director_id='${directorId}' 
    WHERE movie_id=${movieId}`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//5) Delete movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id=${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//6) Get directors API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachDirector) => convertPascalToCamel(eachDirector))
  );
});

//7) Get director movies API
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieNamesQuery = `SELECT movie_name FROM movie 
  WHERE director_id=${directorId}`;
  const moviesArray = await db.all(directorMovieNamesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertPascalToCamel(eachMovie))
  );
});

module.exports = app;
