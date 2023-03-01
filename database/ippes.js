const knexModule = require('knex');
const chaineConnexion = require('../constantes');

const knex = knexModule(chaineConnexion);

// Requete de test
function getIppesAll() {
    return knex('IPPE');
}

// Requete knex qui retourne les informations de connexion
// Fonction qui manie l'affichage de la reponse IPPE
function formatterIPPE(IPPEs) {
    const resultat = [];
    const libelleList = [];

    if (resultat[0] === undefined) {
        resultat.push(
            {
                idIPPE: IPPEs[0].IdIPPE[0],
                noEvenement: IPPEs[0].NoEvenement,
                typeEvenement: IPPEs[0].TypeEvenement,
                mandat: IPPEs[0].Mandat,
                motif: IPPEs[0].Motif,
                nature: IPPEs[0].Nature,
                dossierEnquete: IPPEs[0].DossierEnquete,
                cour: IPPEs[0].Cour,
                noMandat: IPPEs[0].NoMandat,
                noCause: IPPEs[0].NoCause,
                idNatureCrime: IPPEs[0].idNatureCrime,
                lieuDetention: IPPEs[0].LieuDetention,
                finSentence: IPPEs[0].FinSentence,
                vuDerniereFois: IPPEs[0].VuDerniereFois,
                conditions: libelleList,
                agentProbation: IPPEs[0].AgentProbation,
                agentLiberation: IPPEs[0].AgentLiberation,
                telephone: IPPEs[0].Telephone,
                poste: IPPEs[0].Poste,
                conditions: [], // eslint-disable-line
            },
        );
    }

    IPPEs.forEach((ippe) => {
        // Verifie si l'information IPPE se trouve deja dans les datas a envoyer
        if (!resultat.some((element) => element.idIPPE === ippe.IdIPPE[0])) {
            // Nouvel événement IPPE, on ajoute un objet IPPE au résultat
            resultat.push(
                {
                    idIPPE: ippe.IdIPPE[0],
                    noEvenement: ippe.NoEvenement,
                    typeEvenement: ippe.TypeEvenement,
                    mandat: ippe.Mandat,
                    motif: ippe.Motif,
                    nature: ippe.Nature,
                    dossierEnquete: ippe.DossierEnquete,
                    cour: ippe.Cour,
                    noMandat: ippe.NoMandat,
                    noCause: ippe.NoCause,
                    idNatureCrime: ippe.idNatureCrime,
                    lieuDetention: ippe.LieuDetention,
                    finSentence: ippe.FinSentence,
                    vuDerniereFois: ippe.VuDerniereFois,
                    conditions: libelleList,
                    agentProbation: ippe.AgentProbation,
                    agentLiberation: ippe.AgentLiberation,
                    telephone: ippe.Telephone,
                    poste: ippe.Poste,
                    conditions: [], // eslint-disable-line
                },
            );
        } else {
            resultat[resultat.length - 1].conditions.push(
                {
                    idCondition: ippe.IdCondition,
                    libelle: ippe.Libelle,
                    heureDebut: ippe.HeureDebut,
                    heureFin: ippe.HeureFin,
                    victime: ippe.Victime,
                    frequentation: ippe.Frequentation,
                },
            );
        }
    });
    return resultat;
}

async function getIPPE(nomFamille, prenom1, prenom2, masculin, dateNaissance) {
    const resultat = await knex('Personnes')
        .where({
            NomFamille: nomFamille,
            Prenom1: prenom1,
            Prenom2: prenom2,
            Masculin: masculin,
            DateNaissance: dateNaissance,
        });

    if (resultat.length === 0) return resultat;

    // La personne existe: on récupère sa signalisation FPS si elle en a une
    const FPS = await knex('FPS')
        .where('FPS.IdPersonne', resultat[0].IdPersonne);
    // eslint-disable-next-line prefer-destructuring
    resultat[0].FPS = FPS.length === 0 ? null : FPS[0];

    // On récupère les événements IPPE associés si elle en a
    resultat[0].IPPE = await knex('PersonnesIPPE')
        .join('IPPE', 'PersonnesIPPE.IdIPPE', 'IPPE.IdIPPE')
        .leftJoin('Conditions', 'Conditions.IdIPPE', 'IPPE.IdIPPE')
        .where('PersonnesIPPE.IdPersonne', resultat[0].IdPersonne);

    if (resultat[0].IPPE.length === 0) return resultat;

    // La personne a des événements IPPE associés: on les formate
    resultat[0].IPPE = formatterIPPE(resultat[0].IPPE);

    return resultat;
}

// Permet d'avoir un évènement d'une personne particulièrement celle qu'on a prévu de modifié
async function InfoPersonneIppe(IdPersonne, IdIPPE) {
    const data = await knex('personnes').first()
        .select(
            'Personnes.IdPersonne',
            'IPPE.IdIPPE',
            'NomFamille',
            'Prenom1',
            'Prenom2',
            'Masculin',
            'DateNaissance',
            'Personnes.Telephone',
            'NoPermis',
            'Adresse1',
            'Adresse2',
            'Ville',
            'Province',
            'CodePostal',
            'Race',
            'Taille',
            'Yeux',
            'Cheveux',
            'Marques',
            'Poids',
            'Toxicomanie',
            'Desorganise',
            'Depressif',
            'Suicidaire',
            'Violent',
            'Gilet',
            'Pantalon',
            'AutreVetement',
            'NoEvenement',
            'Mandat',
            'TypeEvenement',
            'Motif',
            'DossierEnquete',
            'Cour',
            'NoMandat',
            'NoCause',
            'IdNatureCrime',
            'IPPE.Nature as Nature',
            'Crimes.Nature as NatureCrime',
            'LieuDetention',
            'FinSentence',
            'VuDernierefois',
            'AgentProbation',
            'AgentLiberation',
            'IPPE.Telephone',
            'Poste',
        )
        .fullOuterJoin('PersonnesIPPE', 'PersonnesIPPE.IdPersonne', 'Personnes.IdPersonne')
        .fullOuterJoin('IPPE', 'IPPE.IdIPPE', 'PersonnesIPPE.IdIPPE')
        .leftOuterJoin('Conditions', 'Conditions.IdPersonne', 'PersonnesIPPE.IdPersonne')
        .leftOuterJoin('Crimes', 'Crimes.IdCrime', 'IPPE.IdNatureCrime')
        .where('Personnes.IdPersonne', IdPersonne)
        .andWhere('IPPE.IdIPPE', IdIPPE);

    const conditions = await knex('Conditions').where('Conditions.IdIPPE', IdIPPE);
    let libelleList = [];
    conditions.forEach((element) => {
        if (element.Libelle !== null) {
            if (element.Libelle.includes('entrer en contact')) libelleList.push(`${element.Libelle} ${element.Victime}`);
            else if (element.Libelle.includes('fréquenter')) libelleList.push(`${element.Libelle} ${element.Frequentation}`);
            else if (element.Libelle.includes('Avoir comme adresse')) libelleList.push(`${element.Libelle} ${data.Adresse1} ${data.Ville} ${data.Province} ${data.CodePostal}`);
            else libelleList.push(element.Libelle);
        } else {
            // si aucunes conditions n'est presente rien est envoyer dans le tableau de conditions
            libelleList = null;
        }
    });
    const dataTosend = {
        data,
        libelleList,
    };

    return dataTosend;
}

// Requete knex pour ajouter un évènement  IPPE à  personne
async function AjoutReponse(IdPersonne, data, response) {
    const verifyPersonne = await knex('Personnes').where('Personnes.IdPersonne', IdPersonne).first();
    if (!verifyPersonne) {
        return response.status(404).send('Personne not found');
    }
    try {
        await knex('IPPE').insert(data.tableIPPE);
    } catch {
        return response.status(400).json({
            success: false,
            message: 'Insertion impossible',
        });
    }
    const lastIdIppe = await knex('IPPE').max('IdIPPE as IdIPPE').first();
    try {
        await knex('PersonnesIPPE').insert({ IdPersonne, IdIPPE: lastIdIppe.IdIPPE });
    } catch {
        return response.status(400).json({
            success: false,
            message: 'Insertion impossible',
        });
    }
    response.status(201).json({ success: true, message: 'Évènement IPPE Ajouté' });
}

// Requete knex pour modifier la table IPPE
async function modifiertableIppe(IdIPPE, element) {
    const resultat = await knex('IPPE')
        .update(element)
        .where('IdIPPE', IdIPPE);
    return resultat;
}

// Requete knex pour Supprimer les réponses IPPE d'une personne
async function deleteResponse(IdPersonne, IdIPPE, response) {
    const verifyPersonne = await knex('Personnes').where('IdPersonne', IdPersonne);
    if (!verifyPersonne) {
        return response.status(404).json({ success: false, message: 'Personne not found' });
    }
    const verify = await knex('IPPE').where('IdIPPE', IdIPPE);

    if (!verify) {
        return response.status(404).json({ success: false, message: 'IPPE not found' });
    }
    const verifyCondition = await knex('Conditions').where('Conditions.IdIPPE', IdIPPE)
        .andWhere('Conditions.IdPersonne', IdPersonne);

    if (!verifyCondition) {
        return response.status(404).json({ success: false, message: 'Condition not found ' });
    }
    await knex('Conditions').del().where('Conditions.IdIPPE', IdIPPE);
    await knex('PersonnesIPPE').del().where('PersonnesIPPE.IdIPPE', IdIPPE)
        .andWhere('PersonnesIPPE.IdPersonne', IdPersonne);
    const delIPPE = await knex('IPPE').del().where('IdIPPE', IdIPPE);

    if (delIPPE) {
        return response.status(200).json({ success: true, message: 'Évènement IPPE Supprimé' });
    }
    return response.status(500).json({ success: false, message: 'Erreur serveur !!!' });
}

module.exports = {
    getIppesAll,
    getIPPE,
    AjoutReponse,
    InfoPersonneIppe,
    modifiertableIppe,
    deleteResponse,
};
