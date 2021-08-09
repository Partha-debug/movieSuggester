// Defining the fetchData function
// pass in your omdb api key as an argument to this function
async function fetchData(searchTerm, searchMode, yourApiKey = "cef3ec8e") {
  const response = await axios.get("https://www.omdbapi.com/", {
    params: { apiKey: yourApiKey , [searchMode]: searchTerm },
  });
  if (response.data.Error) {
    return [];
  }
  if (searchMode === "s") {
    return response.data.Search;
  }
  return response.data;
}

// Defining the movieTemplate function to create a template to render on movie selection
function movieTemplate(movieData) {
  const dollars = parseInt(
    movieData.BoxOffice.replace(/\$/g, "").replace(/\$/g, "").replace(/,/g, "")
  );
  const metaScore = parseInt(movieData.Metascore);
  const imdbRatings = parseFloat(movieData.imdbRating);
  const imdbVotes = parseInt(movieData.imdbVotes.replace(/,/g, ""));
  const awards = movieData.Awards.split(" ").reduce((total, curVal) => {
    curVal = parseInt(curVal);
    if (!isNaN(curVal)) {
      return total + curVal;
    }
    return total;
  }, 0);

  return `
  <article class="media">
  <figure class="media-left">
    <p class="image">
      <img src="${movieData.Poster}" alt="" srcset="">
    </p>
  </figure>
  <div class="media-content">
    <div class="content">
      <h1>${movieData.Title}</h1>
      <h4>${movieData.Genre}</h4>
      <p>${movieData.Plot}</p>
    </div>
  </div>
</article>

<article data-value=${imdbRatings} class="notification is-primary">
  <p class="title">${movieData.imdbRating}</p>
  <p class="subtitle">IMDB ratings</p>
</article>

<article data-value=${dollars} class="notification is-primary">
  <p class="title">${movieData.BoxOffice}</p>
  <p class="subtitle">Box office</p>
</article>

<article data-value=${awards} class="notification is-primary">
  <p class="title">${movieData.Awards}</p>
  <p class="subtitle">Awards</p>
</article>

<article data-value=${metaScore} class="notification is-primary">
  <p class="title">${movieData.Metascore}</p>
  <p class="subtitle">Meta score</p>
</article>

<article data-value=${imdbVotes} class="notification is-primary">
  <p class="title">${movieData.imdbVotes}</p>
  <p class="subtitle">IMDB votes</p>
</article>
  `;
}

// Defining runComparision to compare between the two movies and render out specific styling for each
function runComparision() {
  const leftStats = document.querySelectorAll("#summary-left .notification");
  const rightStats = document.querySelectorAll("#summary-right .notification");

  let lscore = 0;
  let rscore = 0;

  leftStats.forEach((lStatEle, index) => {
    const rStatEle = rightStats[index];

    const lStatVal = parseFloat(lStatEle.dataset.value);
    const rStatVal = parseFloat(rStatEle.dataset.value);

    if (rStatVal > lStatVal) {
      rscore += 1;
      lStatEle.classList.remove("is-primary");
      lStatEle.classList.add("is-danger");
      rStatEle.classList.remove("is-primary");
      rStatEle.classList.add("is-success");
    } else if (lStatVal > rStatVal) {
      lscore += 1;
      rStatEle.classList.remove("is-primary");
      rStatEle.classList.add("is-danger");
      lStatEle.classList.remove("is-primary");
      lStatEle.classList.add("is-success");
    }
  });

  const summLeft = document.querySelector("#summary-left");
  const summRight = document.querySelector("#summary-right");
  if (lscore > rscore) {
    summLeft.style.backgroundColor = "hsl(171, 100%, 96%)";
    summRight.style.backgroundColor = "hsl(347, 90%, 96%)";
  } else if (rscore > lscore) {
    summRight.style.backgroundColor = "hsl(171, 100%, 96%)";
    summLeft.style.backgroundColor = "hsl(347, 90%, 96%)";
  }
}

let leftMovie, rightMovie;

// Defining onMovieSelect function to perform the required operations on the selection of a movie
async function onMovieSelect(movieId, fetchData, opDiv, side) {
  const mdata = await fetchData(movieId, "i");
  opDiv = document.querySelector(`${opDiv}`);
  opDiv.classList.add("box");
  opDiv.innerHTML = movieTemplate(mdata);

  if (side === "left") {
    leftMovie = mdata;
  } else {
    rightMovie = mdata;
  }
  if (leftMovie && rightMovie) {
    runComparision();
  }
}

// Creating the configuration object for our createAutoComplete function
const autoCompleteConfig = {
  renderOption(movie) {
    return `
<img src="${movie.Poster}" alt=''/>
<b>${movie.Title}</b>&nbsp;(${movie.Year})
`;
  },
  inputValue(movie) {
    return movie.Title;
  },
  fetchData,
};

// creating the left part of the auto complete
createAutoComplete({
  root: document.querySelector("#left-auto-complete"),
  onOptionSelect(movie) {
    onMovieSelect(movie, fetchData, "#summary-left", "left");
  },
  ...autoCompleteConfig,
});

// creating the right part of the auto complete
createAutoComplete({
  root: document.querySelector("#right-auto-complete"),
  onOptionSelect(movie) {
    onMovieSelect(movie, fetchData, "#summary-right", "right");
  },
  ...autoCompleteConfig,
});
