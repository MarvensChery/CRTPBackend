const knexModule = require('knex');
const chaineConnexion = require('../constantes');

const knex = knexModule(chaineConnexion);

// Requete de test
function getUtilisateursAll() {
    return knex('Utilisateurs');
}

function getUtilisateurByIdentifiant(Identifiant) {
    return knex('Utilisateurs')
        .where('Identifiant', Identifiant);
}

function postUtilisateur(data) {
    return knex('Utilisateurs')
        .insert(data);
}

// Requete knex qui retourne les informations de connexion
function connexion(Courriel) {
    return knex('Utilisateurs')
        .where('Courriel', Courriel);
}

module.exports = {
    getUtilisateursAll,
    getUtilisateurByIdentifiant,
    postUtilisateur,
    connexion,
};
