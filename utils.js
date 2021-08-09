// Creating the debounce function for debouncing the api calls
function debounce(func, dely = 700) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, dely);
  };
}

// Defining the function to create our autocomplete
function createAutoComplete({
  root,
  renderOption,
  onOptionSelect,
  inputValue,
  fetchData,
}) {
  root.innerHTML = `
<label><b>Search</b></label>
<input class="input" />
<div class="dropdown">
  <div class="dropdown-menu">
    <div class="dropdown-content result"></div>
  </div>
</div>
`;

  const input = root.querySelector(".input");

  const dropDown = root.querySelector(".dropdown");

  const resultWrapper = root.querySelector(".result");
  const closeDropdown = () => {
    resultWrapper.innerHTML = "";
    dropDown.classList.remove("is-active");
  };

  const onInput = debounce(async (event) => {
    let items = await fetchData(event.target.value, "s");

    closeDropdown();

    if (items.length) {
      dropDown.classList.add("is-active");
    }

    for (let item of items) {
      const option = document.createElement("a");
      option.classList.add("dropdown-item");
      option.innerHTML = renderOption(item);
      resultWrapper.appendChild(option);
      option.addEventListener("click", () => {
        closeDropdown();
        input.value = inputValue(item);
        onOptionSelect(item.imdbID, fetchData);
      });
    }
  });

  input.addEventListener("input", function (e) {
    if (this.value.length > 2) {
      onInput(e);
    }
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) {
      closeDropdown();
    }
  });
}
