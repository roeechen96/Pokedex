const MAX_POKEMON = 151;
const POKEMON_BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const POKEMON_SPECIES_BASE_URL = "https://pokeapi.co/api/v2/pokemon-species";

const listWrapper = document.querySelector(".list-wrapper");
const searchInput = document.querySelector("#search-input");
const numberFilter = document.querySelector("#number");
const nameFilter = document.querySelector("#name");
const notFoundMessage = document.querySelector("#not-found-message");
const closeButton = document.querySelector(".search-close-icon");

let allPokemons = [];

const fetchPokemons = async () => {
  try {
    const response = await fetch(`${POKEMON_BASE_URL}?limit=${MAX_POKEMON}`);
    const data = await response.json();
    allPokemons = data.results;
    displayPokemons(allPokemons);
  } catch (error) {
    console.error("Failed to fetch Pokémon data:", error);
    notFoundMessage.textContent = "Error fetching Pokémon data.";
    notFoundMessage.style.display = "block";
  }
};

const fetchPokemonDetails = async (id) => {
  try {
    const [pokemon, species] = await Promise.all([
      fetch(`${POKEMON_BASE_URL}/${id}`).then((res) => res.json()),
      fetch(`${POKEMON_SPECIES_BASE_URL}/${id}`).then((res) => res.json()),
    ]);
    return true;
  } catch (error) {
    console.error(`Failed to fetch details for Pokémon ID: ${id}`, error);
    return false;
  }
};

const displayPokemons = (pokemons) => {
  listWrapper.innerHTML = ""; // Clear current list
  if (!pokemons || pokemons.length === 0) {
    notFoundMessage.style.display = "block";
    return;
  }
  notFoundMessage.style.display = "none";

  const fragment = document.createDocumentFragment();

  pokemons.forEach((pokemon) => {
    const pokemonId = pokemon.url.split("/")[6];
    const listItem = document.createElement("div");
    listItem.className = "list-item";

    listItem.innerHTML = `
      <div class="number-wrap">
        <p class="caption-fonts">#${pokemonId}</p>
      </div>
      <div class="img-wrap">
        <img src="https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png" 
          alt="${pokemon.name}" />
      </div>
      <div class="name-wrap">
        <p class="body3-fonts">${pokemon.name}</p>
      </div>
    `;

    listItem.addEventListener("click", async () => {
      const success = await fetchPokemonDetails(pokemonId);
      if (success) {
        window.location.href = `./detail.html?id=${pokemonId}`;
      }
    });

    fragment.appendChild(listItem);
  });

  listWrapper.appendChild(fragment); // Batch DOM update
};

const handleSearch = () => {
  const searchTerm = searchInput.value.toLowerCase();
  let filteredPokemons;

  if (numberFilter.checked) {
    filteredPokemons = allPokemons.filter((pokemon) => {
      const pokemonID = pokemon.url.split("/")[6];
      return pokemonID.startsWith(searchTerm);
    });
  } else if (nameFilter.checked) {
    filteredPokemons = allPokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().startsWith(searchTerm)
    );
  } else {
    filteredPokemons = allPokemons;
  }

  displayPokemons(filteredPokemons);
};

const clearSearch = () => {
  searchInput.value = "";
  displayPokemons(allPokemons);
  notFoundMessage.style.display = "none";
};

searchInput.addEventListener("keyup", handleSearch);
closeButton.addEventListener("click", clearSearch);

fetchPokemons();
