// Fonction asynchrone pour charger les NFTs
async function loadNFTs() {
    // Vérifie si l'objet ethereum est disponible dans la fenêtre
    if (window.ethereum) {
        // Crée une nouvelle instance de Web3 avec le fournisseur ethereum
        const web3 = new Web3(window.ethereum);
        // Demande à l'utilisateur d'autoriser l'accès à ses comptes Ethereum
        await window.ethereum.enable();
        // Crée une nouvelle instance de contrat avec l'ABI et l'adresse du contrat
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Appelle la méthode _tokenIds du contrat pour obtenir le nombre total de tokens
        const totalSupply = await contract.methods._tokenIds().call();
        // Obtient la référence à l'élément de la galerie dans le DOM
        const gallery = document.getElementById('nft-gallery');

        // Boucle sur chaque token
        for (let i = 1; i <= totalSupply && i <= 18; i++) {
            // Appelle la méthode tokenURI du contrat pour obtenir l'URI du token
            const tokenURI = await contract.methods.tokenURI(i).call();
            // Crée une nouvelle image et la configure
            const img = document.createElement('img');
            img.src = tokenURI;
            img.alt = `NFT ${i}`;
            img.className = 'nft-item';
            // Ajoute un gestionnaire d'événements click pour ouvrir le token sur Etherscan
            img.onclick = () => {
                window.open(`https://sepolia.etherscan.io/token/${contractAddress}?a=${i}`, '_blank');
            };
            // Ajoute l'image à la galerie
            gallery.appendChild(img);
        }
    } else {
        // Si l'objet ethereum n'est pas disponible, demande à l'utilisateur d'installer MetaMask
        alert('Please install MetaMask!');
    }
}

// Ajoute un gestionnaire d'événements pour exécuter la fonction loadNFTs lorsque le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    loadNFTs();

    // Enveloppe chaque lettre dans une balise span pour les textes défilants
    document.querySelectorAll('.scrolling-text').forEach(textWrapper => {
        textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letter'>$&</span>");
    });

    // Fonction pour animer le texte
    const animateText = (element) => {
        anime.timeline()
            .add({
                targets: `${element} .letter`,
                scale: [0, 1],
                duration: 1500,
                elasticity: 600,
                delay: (el, i) => 45 * (i + 1)
            });
    };

    // Options pour l'observateur d'intersection
    const observerOptions = {
        root: null,
        rootMargin: "0px",
        threshold: 0.1
    };

    // Fonction de rappel pour l'observateur d'intersection
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            // Si l'élément est visible dans le viewport, déclenche l'animation du texte
            if (entry.isIntersecting) {
                const target = entry.target;
                animateText(`#${target.id} .scrolling-text`);
                // Arrête d'observer l'élément
                observer.unobserve(target);
            }
        });
    };

    // Crée un nouvel observateur d'intersection
    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe chaque section
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });

    // Observe explicitement le pied de page
    const footer = document.querySelector('footer');
    observer.observe(footer);

    // Animation pour le texte "Token Gallery"
    anime.timeline()
        .add({
            targets: '.ml5 .line',
            opacity: [0.5, 2],
            scaleX: [0, 1],
            easing: "easeInOutExpo",
            duration: 700
        }).add({
            targets: '.ml5 .line',
            duration: 600,
            easing: "easeOutExpo",
            translateY: (el, i) => (-0.625 + 0.625 * 2 * i) + "em"
        }).add({
            targets: '.ml5 .letters-left',
            opacity: [0, 1],
            translateX: ["0.5em", 0],
            easing: "easeOutExpo",
            duration: 600,
            offset: '-=300'
        }).add({
            targets: '.ml5 .letters-right',
            opacity: [0, 1],
            translateX: ["-0.5em", 0],
            easing: "easeOutExpo",
            duration: 600,
            offset: '-=600'
        });

    // Script d'effet de défilement original
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', function() {
        lastScrollY = window.scrollY;
    });

    // Script de la lightbox
    let currentIndex = 0;
    const images = document.querySelectorAll('.gallery .image');
    const totalImages = images.length;

    // Ouvre la lightbox
    window.openLightbox = function(event) {
        if (event.target.tagName === 'IMG') {
            const clickedIndex = Array.from(images).indexOf(event.target);
            currentIndex = clickedIndex;
            updateLightboxImage();
            document.getElementById('lightbox').style.display = 'flex';
        }
    }

    // Ferme la lightbox
    window.closeLightbox = function() {
        document.getElementById('lightbox').style.display = 'none';
    }

    // Change l'image de la lightbox en fonction de la direction (1 pour suivant, -1 pour précédent)
    window.changeImage = function(direction) {
        currentIndex += direction;
        if (currentIndex >= totalImages) {
            currentIndex = 0;
        } else if (currentIndex < 0) {
            currentIndex = totalImages - 1;
        }
        updateLightboxImage();
    }

    // Met à jour l'image de la lightbox et les vignettes
    function updateLightboxImage() {
        const lightboxImg = document.getElementById('lightbox-img');
        const thumbnailContainer = document.getElementById('thumbnail-container');

        // Met à jour l'image principale de la lightbox
        lightboxImg.src = images[currentIndex].src;

        // Efface les vignettes existantes
        thumbnailContainer.innerHTML = '';

        // Ajoute de nouvelles vignettes
        images.forEach((image, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = image.src;
            thumbnail.alt = `Thumbnail ${index + 1}`;
            thumbnail.classList.add('thumbnail');
            thumbnail.addEventListener('click', () => updateMainImage(index));
            thumbnailContainer.appendChild(thumbnail);
        });

        // Met en évidence la vignette actuelle
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails[currentIndex].classList.add('active-thumbnail');
    }

    // Met à jour l'image principale de la lightbox lorsqu'une vignette est cliquée
    function updateMainImage(index) {
        currentIndex = index;
        updateLightboxImage();
    }

    // Ajoute les vignettes initiales
    updateLightboxImage();

    // Pour ajouter la navigation au clavier (touches fléchées gauche/droite)
    document.addEventListener('keydown', function (e) {
        if (document.getElementById('lightbox').style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                changeImage(-1);
            } else if (e.key === 'ArrowRight') {
                changeImage(1);
            }
        }
    });
});
