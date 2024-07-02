document.addEventListener('DOMContentLoaded', () => {
  const generation = 1;
  let currentIndex = 0;
  let pokemonData = [];
  let filteredPokemonData = [];

  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pokemonDetails = document.getElementById('pokemon-details');
  const searchBar = document.getElementById('search-bar');
  const searchBtn = document.getElementById('search-btn');

  searchBtn.addEventListener('click', () => {
    const query = searchBar.value.trim().toLowerCase();
    filteredPokemonData = pokemonData.filter(pokemon => {
      const nameMatch = pokemon.names.some(nameEntry => nameEntry.language.name === 'fr' && nameEntry.name.toLowerCase().includes(query));
      const idMatch = pokemon.id.toString().includes(query);
      return nameMatch || idMatch;
    });
    currentIndex = 0;
    if (filteredPokemonData.length > 0) {
      displayPokemon(filteredPokemonData[currentIndex]);
    } else {
      pokemonDetails.innerHTML = '<p>Aucun Pokémon trouvé</p>';
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      displayPokemon(filteredPokemonData.length > 0 ? filteredPokemonData[currentIndex] : pokemonData[currentIndex]);
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < (filteredPokemonData.length > 0 ? filteredPokemonData.length - 1 : pokemonData.length - 1)) {
      currentIndex++;
      displayPokemon(filteredPokemonData.length > 0 ? filteredPokemonData[currentIndex] : pokemonData[currentIndex]);
    }
  });

  fetch(`https://pokeapi.co/api/v2/generation/${generation}`)
    .then(response => response.json())
    .then(data => {
      const pokemonUrls = data.pokemon_species.slice(0, 150).map(pokemon => pokemon.url);

      Promise.all(pokemonUrls.map(url =>
        fetch(url).then(response => response.json())
      ))
      .then(data => {
        pokemonData = data.map(pokemon => ({
          id: pokemon.id,
          names: pokemon.names,
          sprites: pokemon.sprites,
          types: pokemon.types,
          weight: pokemon.weight,
          height: pokemon.height
        }));
        displayPokemon(pokemonData[currentIndex]);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des données des Pokémon :', error);
      });
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des données de la génération Pokémon :', error);
    });

  function displayPokemon(pokemon) {
    const nameEntry = pokemon.names.find(nameEntry => nameEntry.language.name === 'fr');
    const frenchName = nameEntry ? nameEntry.name : pokemon.name;
    pokemonDetails.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${frenchName}" >
      <h3>${frenchName}</h3>
      <p>ID: ${pokemon.id}</p>
      <p>Type: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
      <p>Poids: ${pokemon.weight / 10} kg</p>
      <p>Taille: ${pokemon.height / 10} m</p>
    `;
  }
});
