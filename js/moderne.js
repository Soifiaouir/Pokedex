document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search');
    const pikachu = document.getElementById('pikachu');
    const pokedex = document.getElementById('pokedex');
    const loader = document.getElementById('loader');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    let currentPage = 1;
    const cardsPerPage = 25;
    let allPokemon = [];

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

    function showLoader() {
        loader.style.display = 'flex';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    function animatePikachuAndSearch() {
        pikachu.src = "./img/pikatchugif.webp";
        const query = searchInput.value.trim();
        searchPokemon(query);
    }

    async function fetchAllPokemonData() {
        showLoader();
        let allPokemon = [];
        let nextUrl = 'https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0';

        while (nextUrl) {
            const response = await fetch(nextUrl);
            const data = await response.json();
            const pokemonPromises = data.results.map(async (pokemon) => {
                const pokemonResponse = await fetch(pokemon.url);
                const pokemonData = await pokemonResponse.json();
                const speciesResponse = await fetch(pokemonData.species.url);
                const speciesData = await speciesResponse.json();
                
                const frenchName = speciesData.names.find(name => name.language.name === 'fr')?.name || pokemonData.name;
                const frenchFlavorText = speciesData.flavor_text_entries.find(entry => entry.language.name === 'fr')?.flavor_text || '';

                return { ...pokemonData, frenchName, frenchFlavorText };
            });

            const pokemonBatch = await Promise.all(pokemonPromises);
            allPokemon = allPokemon.concat(pokemonBatch);
            nextUrl = data.next;

            updateLoadingProgress(allPokemon.length);
        }

        hideLoader();
        return allPokemon;
    }

    function updateLoadingProgress(count) {
        console.log(`Chargement des Pokémon : ${count} chargés`);
    }

    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.classList.add('pokemon-card');

        const cardInner = document.createElement('div');
        cardInner.classList.add('pokemon-card-inner');

        const cardFront = document.createElement('div');
        cardFront.classList.add('pokemon-card-front');

        const img = document.createElement('img');
        img.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
        img.alt = pokemon.frenchName;

        const name = document.createElement('h2');
        name.textContent = pokemon.frenchName;

        const id = document.createElement('p');
        id.textContent = `#${pokemon.id.toString().padStart(3, '0')}`;

        const type = document.createElement('p');
        type.textContent = pokemon.types.map(t => typeTranslations[t.type.name]).join(', ');

        const stats = document.createElement('div');
        stats.classList.add('stats');
        stats.innerHTML = `
            ${pokemon.stats.map(stat => `<p>${statTranslations[stat.stat.name] || stat.stat.name}: ${stat.base_stat}</p>`).join('')}
        `;

        cardFront.appendChild(img);
        cardFront.appendChild(name);
        cardFront.appendChild(id);
        cardFront.appendChild(type);
        cardFront.appendChild(stats);

        const cardBack = document.createElement('div');
        cardBack.classList.add('pokemon-card-back');

        const height = document.createElement('p');
        height.textContent = `Taille: ${pokemon.height / 10} m`;

        const weight = document.createElement('p');
        weight.textContent = `Poids: ${pokemon.weight / 10} kg`;

        const abilities = document.createElement('div');
        abilities.innerHTML = `
            <h3>Capacités</h3>
            <ul>
                ${pokemon.abilities.map(ability => `<li>${ability.ability.name}</li>`).join('')}
            </ul>
        `;

        const description = document.createElement('p');
        description.textContent = pokemon.frenchFlavorText;

        cardBack.appendChild(height);
        cardBack.appendChild(weight);
        cardBack.appendChild(abilities);
        cardBack.appendChild(description);

        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);

        const pokemonType = pokemon.types[0].type.name;
        const backgroundColor = typeColors[typeTranslations[pokemonType]] || '#A8A878';
        card.style.backgroundColor = backgroundColor;

        card.addEventListener('click', () => {
            card.classList.toggle('flipped');
        });

        return card;
    }

    function displayPokemonCards(pokemonList) {
        pokedex.innerHTML = '';
        const start = (currentPage - 1) * cardsPerPage;
        const end = start + cardsPerPage;
        const pagePokemons = pokemonList.slice(start, end);

        pagePokemons.forEach(pokemon => {
            const card = createPokemonCard(pokemon);
            pokedex.appendChild(card);
        });

        updatePaginationInfo(pokemonList.length);
    }

    function updatePaginationInfo(totalPokemon) {
        const totalPages = Math.ceil(totalPokemon / cardsPerPage);
        pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
    }

    async function displayAllPokemon() {
        showLoader();
        allPokemon = await fetchAllPokemonData();
        displayPokemonCards(allPokemon);
        hideLoader();
    }

    async function searchPokemon(query) {
        showLoader();
        const filteredPokemon = allPokemon.filter(pokemon => {
            const nameMatch = pokemon.frenchName.toLowerCase().includes(query.toLowerCase());
            const idMatch = pokemon.id.toString() === query;
            const typeMatch = pokemon.types.some(t => typeTranslations[t.type.name].toLowerCase().includes(query.toLowerCase()));
            return nameMatch || idMatch || typeMatch;
        });

        currentPage = 1;
        displayPokemonCards(filteredPokemon);
        hideLoader();
    }

    pikachu.addEventListener('click', animatePikachuAndSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            animatePikachuAndSearch();
        }
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPokemonCards(allPokemon);
        }
    });

    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allPokemon.length / cardsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayPokemonCards(allPokemon);
        }
    });

    displayAllPokemon();
});