document.addEventListener('DOMContentLoaded', () => {
  const generation = 1;
  let currentIndex = 0;
  let pokemonData = [];
  let filteredPokemonData = []; /* tableau fitltr*/

  const prevBtn = document.getElementById('prev-btn');/* appel les différents éléments dans le html*/
  const nextBtn = document.getElementById('next-btn');
  const pokemonDetails = document.getElementById('pokemon-details');
  const searchBar = document.getElementById('search-bar');
  const searchBtn = document.getElementById('search-btn');

  searchBtn.addEventListener('click', () => {
    const query = searchBar.value.trim().toLowerCase();
    filteredPokemonData = pokemonData.filter(pokemon => { /* Filtrage par nom*/
      const nameMatch = pokemon.name.toLowerCase().includes(query); /* Filtrage par ID (conversion de l'ID en string pour comparaison)*/
      const idMatch = pokemon.id.toString().includes(query);
      return nameMatch || idMatch;
    });
    currentIndex = 0; /*met la valeur au pokémon id 1 (le plue proche de 0)*/ 
    if (filteredPokemonData.length > 0) { /*met en place la condition du retout de pokémon  ou non */
      displayPokemon(filteredPokemonData[currentIndex]);
    } else {
      pokemonDetails.innerHTML = '<p>Aucun Pokémon trouvé</p>';
    }
  });

  prevBtn.addEventListener('click', () => {/*permet de changer de pokémon de un en un vers la droite*/
    if (currentIndex > 0) {
      currentIndex--;
      displayPokemon(pokemonData[currentIndex]);
    }
  });

  nextBtn.addEventListener('click', () => {/*permet de changer de pokémon de un en un vers la gauche*/
    if (currentIndex < pokemonData.length - 1) {
      currentIndex++;
      displayPokemon(pokemonData[currentIndex]);
    }
  });

  fetch(`https://pokeapi.co/api/v2/generation/${generation}`)/* permet de récuper l'API pokémon le version voulue */
    .then(response => response.json())
    .then(data => {
      const pokemonUrls = data.pokemon_species.slice(0, 150).map(pokemon => `https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);

      Promise.all(pokemonUrls.map(url =>
        fetch(url).then(response => response.json())
      ))
      .then(data => {
        pokemonData = data;
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
    pokemonDetails.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" >
      <h3>${pokemon.name}</h3>
      <p>ID: ${pokemon.id}</p>
      <p>Type: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
      <p>Poids: ${pokemon.weight / 10} kg</p>
      <p>Taille: ${pokemon.height / 10} m</p>
    `;
  }
});
