document.addEventListener('DOMContentLoaded', () => {
    const pokemonDetails = document.getElementById('pokemon-details');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const searchBtn = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');

    let currentPokemonId = 1;
    const maxPokemonId = 151; // Nombre de Pokémon de la première génération

    function fetchPokemon(id) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(response => response.json())
            .then(data => displayPokemon(data))
            .catch(error => {
                console.error("Erreur lors de la récupération des données:", error);
                pokemonDetails.innerHTML = "<p>Erreur lors du chargement du Pokémon.</p>";
            });
    }

    function displayPokemon(pokemon) {
        pokemonDetails.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <h3>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
            <p>ID: ${pokemon.id}</p>
            <p>Type: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
            <p>Poids: ${pokemon.weight / 10} kg</p>
            <p>Taille: ${pokemon.height / 10} m</p>
        `;
        updateNavigationButtons();
    }

    function updateNavigationButtons() {
        prevBtn.disabled = currentPokemonId === 1;
        nextBtn.disabled = currentPokemonId === maxPokemonId;
    }

    prevBtn.addEventListener('click', () => {
        if (currentPokemonId > 1) {
            currentPokemonId--;
            fetchPokemon(currentPokemonId);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPokemonId < maxPokemonId) {
            currentPokemonId++;
            fetchPokemon(currentPokemonId);
        }
    });

    searchBtn.addEventListener('click', searchPokemon);
    searchBar.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            searchPokemon();
        }
    });

    function searchPokemon() {
        const searchTerm = searchBar.value.toLowerCase();
        if (searchTerm === '') return;

        if (!isNaN(searchTerm) && parseInt(searchTerm) >= 1 && parseInt(searchTerm) <= maxPokemonId) {
            currentPokemonId = parseInt(searchTerm);
            fetchPokemon(currentPokemonId);
        } else {
            fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm}`)
                .then(response => response.json())
                .then(data => {
                    if (data.id <= maxPokemonId) {
                        currentPokemonId = data.id;
                        displayPokemon(data);
                    } else {
                        pokemonDetails.innerHTML = "<p>Ce Pokémon n'est pas de la première génération.</p>";
                    }
                })
                .catch(() => {
                    pokemonDetails.innerHTML = "<p>Pokémon non trouvé.</p>";
                });
        }
    }

    // Afficher le premier Pokémon au chargement
    fetchPokemon(currentPokemonId);
});