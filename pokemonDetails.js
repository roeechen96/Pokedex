const MAX_POKEMONS = 151;
let currentPokemonId = null;

document.addEventListener("DOMContentLoaded", () => {
    const pokemonId = getPokemonIdFromURL();

    if (isValidPokemonId(pokemonId)) {
        currentPokemonId = pokemonId;
        loadPokemonDetails(pokemonId);
    } else {
        redirectToHome();
    }
});

/** Get Pokemon ID from the query string */
function getPokemonIdFromURL() {
    return parseInt(new URLSearchParams(window.location.search).get("id"), 10);
}

/** Validate if the ID is within the valid range */
function isValidPokemonId(id) {
    return id >= 1 && id <= MAX_POKEMONS;
}

/** Redirect to the home page */
function redirectToHome() {
    window.location.href = "./index.html";
}

/** Load Pokemon data and render details */
async function loadPokemonDetails(id) {
    try {
        const [pokemon, species] = await fetchPokemonData(id);
        if (currentPokemonId === id) {
            renderPokemonDetails(pokemon, species);
            configureNavigation(id);
            updateURL(id);
        }
    } catch (error) {
        console.error("Failed to load Pokemon data:", error);
    }
}

/** Fetch Pokemon and species data concurrently */
function fetchPokemonData(id) {
    const pokemonEndpoint = `https://pokeapi.co/api/v2/pokemon/${id}`;
    const speciesEndpoint = `https://pokeapi.co/api/v2/pokemon-species/${id}`;
    return Promise.all([fetchJSON(pokemonEndpoint), fetchJSON(speciesEndpoint)]);
}

/** Utility for fetching JSON data */
function fetchJSON(url) {
    return fetch(url).then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
    });
}

/** Configure navigation for adjacent Pokemon */
function configureNavigation(id) {
    setNavigation("#leftArrow", id > 1 ? () => navigateToPokemon(id - 1) : null);
    setNavigation("#rightArrow", id < MAX_POKEMONS ? () => navigateToPokemon(id + 1) : null);
}

/** Set navigation event listeners */
function setNavigation(selector, callback) {
    const button = document.querySelector(selector);
    button.onclick = callback;
}

/** Navigate to a different Pokemon */
function navigateToPokemon(id) {
    currentPokemonId = id;
    loadPokemonDetails(id);
}

/** Update the URL without reloading */
function updateURL(id) {
    window.history.pushState({}, "", `./detail.html?id=${id}`);
}

/** Render Pokemon details on the page */
function renderPokemonDetails(pokemon, species) {
    updatePageTitle(pokemon.name);
    updateMainBackgroundColor(pokemon.types[0].type.name);
    renderHeader(pokemon);
    renderImage(pokemon.id, pokemon.name);
    renderTypes(pokemon.types);
    renderBasicStats(pokemon);
    renderAbilities(pokemon.abilities);
    renderStatBars(pokemon.stats);
    renderFlavorText(species);
}

/** Update the page title */
function updatePageTitle(name) {
    document.title = capitalize(name);
}

/** Update the background color based on the main type */
function updateMainBackgroundColor(type) {
    const color = typeColors[type] || "#A8A8A8";
    setStyles(".detail-main", { backgroundColor: color, borderColor: color });
    setStyles(".power-wrapper > p", { backgroundColor: color });
    setStyles(".stats-wrap p.stats", { color });
}

/** Render the header with name and ID */
function renderHeader({ name, id }) {
    setTextContent(".name", capitalize(name));
    setTextContent(".pokemon-id", `#${String(id).padStart(3, "0")}`);
}

/** Render the main image */
function renderImage(id, name) {
    const img = document.querySelector(".detail-img-wrapper img");
    img.src = `https://raw.githubusercontent.com/pokeapi/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
    img.alt = `${capitalize(name)} Image`;
}

/** Render the Pokemon's types */
function renderTypes(types) {
    const typeWrapper = document.querySelector(".power-wrapper");
    typeWrapper.innerHTML = types
        .map(({ type }) => `<p class="body3-fonts type ${type.name}">${capitalize(type.name)}</p>`)
        .join("");
}

/** Render basic stats like weight and height */
function renderBasicStats({ weight, height }) {
    setTextContent(".weight", `${weight / 10}kg`);
    setTextContent(".height", `${height / 10}m`);
}

/** Render abilities */
function renderAbilities(abilities) {
    const moveWrapper = document.querySelector(".move");
    moveWrapper.innerHTML = abilities
        .map(({ ability }) => `<p>${capitalize(ability.name)}</p>`)
        .join("");
}

/** Render the stats with progress bars */
function renderStatBars(stats) {
    const statsWrapper = document.querySelector(".stats-wrapper");
    statsWrapper.innerHTML = stats
        .map(({ stat, base_stat }) => `
            <div class="stats-wrap">
                <p class="body3-fonts stats">${statNameMapping[stat.name]}</p>
                <p class="body3-fonts">${String(base_stat).padStart(3, "0")}</p>
                <progress class="progress-bar" value="${base_stat}" max="100"></progress>
            </div>
        `)
        .join("");
}

/** Render flavor text description */
function renderFlavorText(species) {
    const description = getFlavorText(species);
    setTextContent(".pokemon-description", description);
}

/** Utility: Get the English flavor text */
function getFlavorText(species) {
    const entry = species.flavor_text_entries.find((e) => e.language.name === "en");
    return entry ? entry.flavor_text.replace(/\f/g, " ") : "No description available.";
}

/** Utility: Capitalize a string */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/** Utility: Set text content for a selector */
function setTextContent(selector, content) {
    document.querySelector(selector).textContent = content;
}

/** Utility: Apply multiple styles to elements */
function setStyles(selector, styles) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
        Object.assign(el.style, styles);
    });
}

/** Type-to-color mapping */
const typeColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
};

/** Stat name mappings */
const statNameMapping = {
    hp: "HP",
    attack: "ATK",
    defense: "DEF",
    "special-attack": "SATK",
    "special-defense": "SDEF",
    speed: "SPD",
};
