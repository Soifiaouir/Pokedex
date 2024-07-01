document.addEventListener('DOMContentLoaded', () => {
  const generation = 1;
  let currentIndex = 0;
  let pokemonData = [];

  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pokemonDetails = document.getElementById('pokemon-details');

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
