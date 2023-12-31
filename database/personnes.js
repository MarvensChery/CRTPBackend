const knexModule = require('knex');
const chaineConnexion = require('../constantes');

const knex = knexModule(chaineConnexion);

// Permet d'aller chercher une personne dans personne ainsi que son ippe pour l'afficher
function getPersonnes() {
    return knex('Personnes');
}

function getPersonneById(IdPersonne) {
    return knex('Personnes')
        .where('Personnes.IdPersonne', IdPersonne)
        .select('*');
}

async function getPersonne(nomFamille, prenom1, prenom2, masculin, dateNaissance) {
    const resultat = await knex('Personnes')
        .where({
            NomFamille: nomFamille,
            Prenom1: prenom1,
            Prenom2: prenom2,
            Masculin: masculin,
            DateNaissance: dateNaissance,
        });

    return resultat;
}

async function InfoPersonneIppebyId(IdPersonne) {
    const data = await knex('Personnes').first()
        .where('IdPersonne', IdPersonne);

    const dataTosend = {
        data,
    };
    return dataTosend;
}

// Permet d'ajouter une personne à la base de données
function insertPersonne(data) {
    return knex('Personnes')
        .insert(data, ['IdPersonne'])
        .returning('IdPersonne');
}

// Permet d'ajouter la description d'une personne à la base de données
function insertDescriptionPersonne(data, idPersonne) {
    return knex('Personnes')
        .where('IdPersonne', idPersonne)
        .update(data)
        .returning('*')
        .then((rows) => rows.length);
}

// Info necessaire pour le tableau de la page personne
async function getIppePersonne(IdPersonne) {
    const resultat = await knex('IPPE')
        .select('IPPE.*')
        .where('PersonnesIPPE.IdPersonne', IdPersonne)
        .join('PersonnesIPPE', 'IPPE.IdIPPE', 'PersonnesIPPE.IdIPPE')
        .join('Personnes', 'PersonnesIPPE.IdPersonne', 'Personnes.IdPersonne');

    return resultat;
}

// Permet de modifier une personne et/ou sa description
async function updatePersonne(data, idPersonne) {
    await knex('Personnes')
        .where('IdPersonne', idPersonne)
        .update(data)
        .returning('*')
        .then((rows) => rows.length);
}

// Supprime une personne ainsi que son IPPE et ses Conditions
async function deletePersonne(IdPersonne) {
    const reponseIPPE = await knex('PersonnesIPPE')
        .where('IdPersonne', IdPersonne)
        .select('IdIPPE');
    reponseIPPE.forEach(async (element) => {
        await knex('PersonnesIPPE')
            .where('IdIPPE', element.IdIPPE)
            .del();
        await knex('Conditions')
            .where('IdIPPE', element.IdIPPE)
            .del();
        await knex('IPPE')
            .where('IdIPPE', element.IdIPPE)
            .del();
    });
    await knex('FPS')
        .where('IdPersonne', IdPersonne)
        .del();
    return knex('Personnes')
        .where('IdPersonne', IdPersonne)
        .del()
        .returning('*')
        .then((rows) => rows.length);
}

function getPersonnesAll() {
    return knex('Personnes')
        .select('*');
}

module.exports = {
    updatePersonne,
    insertPersonne,
    insertDescriptionPersonne,
    getPersonneById,
    getPersonne,
    deletePersonne,
    getIppePersonne,
    getPersonnesAll,
    getPersonnes,
    InfoPersonneIppebyId,
};
