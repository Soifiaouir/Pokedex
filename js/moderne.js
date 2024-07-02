document.addEventListener('DOMContentLoaded', () => {
    let allPokemonData = [];
    const pokedex = document.getElementById('pokedex');
    const typeFilter = document.getElementById('type-filter');

    fetch(`https://pokeapi.co/api/v2/type`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(type => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
                typeFilter.appendChild(option);
            });
        });

    fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`)
        .then(response => response.json())
        .then(data => {
            const pokemonUrls = data.results.map(pokemon => pokemon.url);
            return Promise.all(pokemonUrls.map(url => fetch(url).then(response => response.json())));
        })
        .then(data => {
            allPokemonData = data;
            displayPokemon(allPokemonData);
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des données des Pokémon :', error);
        });

    typeFilter.addEventListener('change', () => {
        const selectedType = typeFilter.value;
        if (selectedType === 'all') {
            displayPokemon(allPokemonData);
        } else {
            const filteredPokemon = allPokemonData.filter(pokemon =>
                pokemon.types.some(type => type.type.name === selectedType)
            );
            displayPokemon(filteredPokemon);
        }
    });

    function displayPokemon(pokemonList) {
        pokedex.innerHTML = '';
        pokemonList.forEach(pokemon => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                <h3>${pokemon.name}</h3>
                <p>ID: ${pokemon.id}</p>
                <p>Type: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
                <p>Poids: ${pokemon.weight / 10} kg</p>
                <p>Taille: ${pokemon.height / 10} m</p>
            `;
            pokedex.appendChild(card);
        });
    }
});
