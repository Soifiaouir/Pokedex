// Attend que le DOM soit entièrement chargé
document.addEventListener("DOMContentLoaded", function() {
  // Sélection des éléments du DOM nécessaires
  const searchBar = document.getElementById('search-bar'); // Input de recherche
  const searchBtn = document.getElementById('search-btn'); // Bouton de recherche (image)
  const pokemonDetails = document.getElementById('pokemon-details'); // Div pour afficher les détails du Pokémon

  // Écouteur d'événement sur le clic du bouton de recherche
  searchBtn.addEventListener('click', function() {
      // Récupération de la valeur saisie dans la barre de recherche
      let searchTerm = searchBar.value.trim().toLowerCase();

      // Vérification si l'entrée est numérique (ID) ou textuelle (nom)
      if (!isNaN(searchTerm) && searchTerm !== '') {
          // Recherche par ID si l'entrée est numérique
          fetchPokemonById(searchTerm);
      } else {
          // Recherche par nom si l'entrée n'est pas numérique
          fetchPokemonByName(searchTerm);
      }
  });

  // Fonction asynchrone pour récupérer les détails d'un Pokémon par ID
  async function fetchPokemonById(id) {
      try {
          // Appel à l'API PokeAPI pour obtenir les détails du Pokémon par ID
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          // Vérification de la réussite de la requête HTTP
          if (!response.ok) {
              throw new Error('Pokemon non trouvé');
          }
          // Conversion de la réponse en format JSON
          const data = await response.json();
          // Affichage des détails du Pokémon récupérés
          displayPokemonDetails(data);
      } catch (error) {
          // En cas d'erreur, affiche un message dans la console et à l'utilisateur
          console.error('Erreur lors de la récupération du Pokémon par ID:', error);
          pokemonDetails.innerHTML = '<p>Pokémon non trouvé.</p>'; // Affichage d'un message d'erreur
      }
  }

  // Fonction asynchrone pour récupérer les détails d'un Pokémon par nom
  async function fetchPokemonByName(name) {
      try {
          // Appel à l'API PokeAPI pour obtenir les détails du Pokémon par nom
          const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
          // Vérification de la réussite de la requête HTTP
          if (!response.ok) {
              throw new Error('Pokemon non trouvé');
          }
          // Conversion de la réponse en format JSON
          const data = await response.json();
          // Affichage des détails du Pokémon récupérés
          displayPokemonDetails(data);
      } catch (error) {
          // En cas d'erreur, affiche un message dans la console et à l'utilisateur
          console.error('Erreur lors de la récupération du Pokémon par nom:', error);
          pokemonDetails.innerHTML = '<p>Pokémon non trouvé.</p>'; // Affichage d'un message d'erreur
      }
  }

  // Fonction pour afficher les détails du Pokémon récupérés
  function displayPokemonDetails(pokemon) {
      // Extraction des informations pertinentes du Pokémon
      const { id, name, sprites } = pokemon;
      const imageUrl = sprites.front_default; // URL de l'image du Pokémon
      // Construction du HTML à afficher dans #pokemon-details
      const html = `
          <h3>${name.toUpperCase()}</h3>
          <img src="${imageUrl}" alt="${name}">
          <p>ID: ${id}</p>
      `;
      // Affichage du HTML dans #pokemon-details
      pokemonDetails.innerHTML = html;
  }
});
