document.addEventListener('DOMContentLoaded', () => {
    // Sélection des éléments HTML à partir de leur ID
    const searchInput = document.getElementById('search');
    const pikachu = document.getElementById('pikachu');
    const pokedex = document.getElementById('pokedex');
    const loader = document.getElementById('loader');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    // Variables pour la pagination et les données des Pokémon
    let currentPage = 1;
    const cardsPerPage = 25;
    let allPokemon = [];

    // Objets pour les couleurs des types de Pokémon et leurs traductions
    const typeColors = {
        normal: '#A8A878', feu: '#F08030', eau: '#6890F0', électrik: '#F8D030',
        plante: '#78C850', glace: '#98D8D8', combat: '#C03028', poison: '#A040A0',
        sol: '#E0C068', vol: '#A890F0', psy: '#F85888', insecte: '#A8B820',
        roche: '#B8A038', spectre: '#705898', dragon: '#7038F8', ténèbres: '#705848',
        acier: '#B8B8D0', fée: '#EE99AC'
    };

    const typeTranslations = {
        normal: 'normal', fire: 'feu', water: 'eau', electric: 'électrik',
        grass: 'plante', ice: 'glace', fighting: 'combat', poison: 'poison',
        ground: 'sol', flying: 'vol', psychic: 'psy', bug: 'insecte',
        rock: 'roche', ghost: 'spectre', dragon: 'dragon', dark: 'ténèbres',
        steel: 'acier', fairy: 'fée'
    };

    const statTranslations = {
        hp: 'PV', attack: 'Attaque', defense: 'Défense',
        'special-attack': 'Attaque Spé.', 'special-defense': 'Défense Spé.',
        speed: 'Vitesse'
    };

    // Fonction pour afficher le loader
    function showLoader() {
        loader.style.display = 'flex';
    }

    // Fonction pour cacher le loader
    function hideLoader() {
        loader.style.display = 'none';
    }

    // Fonction pour animer Pikachu et lancer la recherche
    function animatePikachuAndSearch() {
        pikachu.src = "./img/pikatchugif.webp"; // Change l'image de Pikachu
        const query = searchInput.value.trim(); // Récupère la valeur de recherche
        searchPokemon(query); // Lance la recherche de Pokémon
    }

    // Fonction asynchrone pour récupérer toutes les données des Pokémon depuis l'API
    async function fetchAllPokemonData() {
        showLoader();
        let allPokemon = [];
        let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';

        // Boucle pour récupérer tous les Pokémon paginés depuis l'API
        while (nextUrl) {
            const response = await fetch(nextUrl);
            const data = await response.json();
            const pokemonPromises = data.results.map(async (pokemon) => {
                const pokemonResponse = await fetch(pokemon.url);
                const pokemonData = await pokemonResponse.json();
                const speciesResponse = await fetch(pokemonData.species.url);
                const speciesData = await speciesResponse.json();
                
                // Récupère le nom français et le texte de description en français du Pokémon
                const frenchName = speciesData.names.find(name => name.language.name === 'fr')?.name || pokemonData.name;
                const frenchFlavorText = speciesData.flavor_text_entries.find(entry => entry.language.name === 'fr')?.flavor_text || '';

                return { ...pokemonData, frenchName, frenchFlavorText };
            });

            const pokemonBatch = await Promise.all(pokemonPromises);
            allPokemon = allPokemon.concat(pokemonBatch);
            nextUrl = data.next; // Met à jour l'URL de pagination

            updateLoadingProgress(allPokemon.length); // Met à jour le progrès du chargement
        }

        hideLoader(); // Cache le loader une fois le chargement terminé
        return allPokemon; // Retourne tous les Pokémon récupérés
    }

    // Fonction pour afficher le progrès du chargement dans la console
    function updateLoadingProgress(count) {
        console.log(`Chargement des Pokémon : ${count} chargés`);
    }

    // Fonction pour créer une carte Pokémon avec ses détails
    function createPokemonCard(pokemon) {
        // Création des éléments HTML pour la carte Pokémon
        const card = document.createElement('div');
        card.classList.add('pokemon-card');

        const cardInner = document.createElement('div');
        cardInner.classList.add('pokemon-card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('pokemon-card-front');

        // Ajout de l'image du Pokémon
        const img = document.createElement('img');
        img.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
        img.alt = pokemon.frenchName;

        // Ajout du nom du Pokémon
        const name = document.createElement('h2');
        name.textContent = pokemon.frenchName;

        // Ajout de l'ID du Pokémon
        const id = document.createElement('p');
        id.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;

        // Ajout du type du Pokémon
        const type = document.createElement('p');
        type.textContent = pokemon.types.map(t => typeTranslations[t.type.name]).join(', ');

        // Ajout des statistiques du Pokémon
        const stats = document.createElement('div');
        stats.classList.add('stats');
        stats.innerHTML = `
            ${pokemon.stats.map(stat => `<p>${statTranslations[stat.stat.name] || stat.stat.name}: ${stat.base_stat}</p>`).join('')}
        `;

        // Construction de la face avant de la carte Pokémon
        cardFront.appendChild(img);
        cardFront.appendChild(name);
        cardFront.appendChild(id);
        cardFront.appendChild(type);
        cardFront.appendChild(stats);

        // Création de la face arrière de la carte Pokémon
        const cardBack = document.createElement('div');
        cardBack.classList.add('pokemon-card-back');

        // Ajout de la taille du Pokémon
        const height = document.createElement('p');
        height.textContent = `Taille: ${pokemon.height / 10} m`;

        // Ajout du poids du Pokémon
        const weight = document.createElement('p');
        weight.textContent = `Poids: ${pokemon.weight / 10} kg`;

        // Ajout des capacités du Pokémon
        const abilities = document.createElement('div');
        abilities.innerHTML = `
            <h3>Capacités</h3>
            <ul>
                ${pokemon.abilities.map(ability => `<li>${ability.ability.name}</li>`).join('')}
            </ul>
        `;

        // Ajout du texte de description en français du Pokémon
        const description = document.createElement('p');
        description.textContent = pokemon.frenchFlavorText;

        // Construction de la face arrière de la carte Pokémon
        cardBack.appendChild(height);
        cardBack.appendChild(weight);
        cardBack.appendChild(abilities);
        cardBack.appendChild(description);

        // Ajout de la face avant et arrière à la carte principale
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        // Définition de la couleur de fond en fonction du type principal du Pokémon
        const pokemonType = pokemon.types[0].type.name;
        const backgroundColor = typeColors[typeTranslations[pokemonType]] || '#A8A878';
        card.style.backgroundColor = backgroundColor;

        // Ajout d'un événement pour retourner la carte au clic
        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });

        return card; // Retourne la carte Pokémon créée
    }

    // Fonction pour afficher les cartes Pokémon sur la page
    function displayPokemonCards(pokemonList) {
        pokedex.innerHTML = ''; // Vide la liste des Pokémon affichés
        const start = (currentPage - 1) * cardsPerPage;
        const end = start + cardsPerPage;
        const pagePokemons = pokemonList.slice(start, end); // Sélectionne les Pokémon pour la page actuelle

        // Création et ajout des cartes Pokémon à la liste
        pagePokemons.forEach(pokemon => {
            const card = createPokemonCard(pokemon);
            pokedex.appendChild(card);
        });

        updatePaginationInfo(pokemonList.length); // Met à jour les informations de pagination
    }

    // Fonction pour mettre à jour les informations de pagination
    function updatePaginationInfo(totalPokemon) {
        const totalPages = Math.ceil(totalPokemon / cardsPerPage);
        pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`; // Affiche le numéro de page actuel
        prevPageBtn.disabled = currentPage === 1; // Désactive le bouton précédent sur la première page
        nextPageBtn.disabled = currentPage === totalPages; // Désactive le bouton suivant sur la dernière page
    }

    // Fonction pour afficher tous les Pokémon après chargement de la page
    async function displayAllPokemon() {
        showLoader(); // Affiche le loader pendant le chargement
        allPokemon = await fetchAllPokemonData(); // Récupère toutes les données des Pokémon
        displayPokemonCards(allPokemon); // Affiche les cartes Pokémon sur la page
        hideLoader(); // Cache le loader une fois le chargement terminé
    }

    // Fonction pour rechercher un Pokémon en fonction du texte saisi
    async function searchPokemon(query) {
        showLoader(); // Affiche le loader pendant la recherche
        const filteredPokemon = allPokemon.filter(pokemon => {
            const nameMatch = pokemon.frenchName.toLowerCase().includes(query.toLowerCase()); // Vérifie le nom
            const idMatch = pokemon.id.toString() === query; // Vérifie l'ID
            const typeMatch = pokemon.types.some(t => typeTranslations[t.type.name].toLowerCase().includes(query.toLowerCase())); // Vérifie le type
            return nameMatch || idMatch || typeMatch; // Retourne vrai si une correspondance est trouvée
        });

        currentPage = 1; // Réinitialise la page actuelle à la première page
        displayPokemonCards(filteredPokemon); // Affiche les cartes Pokémon filtrées
        hideLoader(); // Cache le loader une fois la recherche terminée
    }

    // Écouteur d'événement pour le clic sur Pikachu pour démarrer l'animation et la recherche
    pikachu.addEventListener('click', animatePikachuAndSearch);

    // Écouteur d'événement pour la touche Entrée dans le champ de recherche
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            animatePikachuAndSearch(); // Lance l'animation et la recherche au clic sur Entrée
        }
    });

    // Écouteur d'événement pour le clic sur le bouton précédent
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--; // Décrémente la page actuelle si ce n'est pas la première page
            displayPokemonCards(allPokemon); // Affiche les cartes Pokémon de la page précédente
        }
    });

    // Écouteur d'événement pour le clic sur le bouton suivant
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allPokemon.length / cardsPerPage);
        if (currentPage < totalPages) {
            currentPage++; // Incrémente la page actuelle si ce n'est pas la dernière page
            displayPokemonCards(allPokemon); // Affiche les cartes Pokémon de la page suivante
        }
    });

    // Fonction pour afficher tous les Pokémon au chargement de la page
    displayAllPokemon();
});
