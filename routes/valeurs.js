/* eslint-disable max-len */
const express = require('express');

const request = require('../database/valeurs');

const router = express.Router();
// Requete pour obtenir idValeur et retourn valeur.
router.get('/:idValeur', async (req, res) => {
    try {
        let data;
        if (req.params.idValeur !== undefined) data = await request.getValeurById(req.params.idValeur);
        else return res.status(400).json({ message: 'paramètre manquant', success: false });
        if (data.length === 0) {
            // retourne la valeur negative
            return res.status(404).json({ message: 'aucune donnée trouvé', success: false });
        }
        // retourne que les valeurs au client;
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
});

router.get('/', async (req, res) => {
    try {
        const data = await request.getValeursAll();
        if (data.length === 0) {
            // retourne la valeur negative
            return res.status(404).json({ message: 'aucune donnée trouvé', success: false });
        }
        // retourne que les valeurs au client;
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
});

router.post('/', async (req, res) => {
    // choix des infos a envoyer selon la banque de données choisi
    try {
        if (req.body.NoSerie === undefined || req.body.auteur === undefined || req.body.typeVa === undefined
            || req.body.resIBVA === undefined || req.body.NoEvenement === undefined) return res.status(400).json({ message: 'paramètre manquant', success: false });

        // verifie si l'entite a ajouter existe deja dans la base de donnees
        const DataAdd = await request.getValeurByNoEvenement(req.body.NoEvenement);
        // si oui renvoyer une erreur
        if (DataAdd.length !== 0) return res.status(404).json({ message: 'l\'entité se trouve déja dans la base de donnée', success: false });

        const DataToSend = {
            Identifiant: req.body.NoSerie,
            Auteur: req.body.auteur,
            TypeValeur: req.body.typeVa,
            TypeEvenement: req.body.resIBVA,
            NoEvenement: req.body.NoEvenement,
        };
            // ajout de données
        await request.postValeur(DataToSend);
        // avoir le id de la nouvelle entité
        const Data = await request.getValeurByNoEvenement(req.body.NoEvenement);
        if (Data.length === 0) return res.status(404).json({ message: 'aucune donnée trouvé', success: false });
        return res.status(200).json({ message: `L’entité a été ajoutée avec succès Id: ${Data[0].IdIBVA}`, success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
});

// route pour modifier les donnees dans la base
router.put('/:idValeur', async (req, res) => {
    const { idValeur } = req.params;
    if (Number.isNaN(Number.parseInt(idValeur, 10))) {
        return res.status(400).send({ message: 'La requête est mal formée.', success: false });
    }
    if (req.body.identifiant === '' || req.body.auteur === '' || req.body.typeValeur === '') {
        return res.status(400).json({
            message: 'Paramètre(s) manquant.',
            details: 'L\'identifiant, l\'auteur, le type de valeur ne peuvent être vide.',
            success: false,
        });
    }

    try {
        // verifier si l'entite est deja dans la base de donnees
        const verificationEntite = await request.getValeurById(req.params.idValeur);
        // si non renvoye une erreur
        if (verificationEntite.length === 0) return res.status(404).json({ message: 'L\'entité n\'existe pas dans la base de donnée', success: false });

        const DataToSend = {
            Identifiant: req.body.identifiant,
            Auteur: req.body.auteur,
            TypeValeur: req.body.typeValeur,
            TypeEvenement: req.body.typeEvenement,
            NoEvenement: req.body.noEvenement,
        };
        // donner en parametre le type de la table/ les donnees a update/ et le id de l'entite a update
        const resultat = await request.updateValeur(DataToSend, req.params.idValeur);
        return res.status(200).json({ message: 'L\'entité a été modifiée avec succès', success: true, 'ligne(s) modifiée(s)': resultat });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
});

// route pour delete l'entité
router.delete('/:idValeur', async (req, res) => {
    let data;
    try {
        data = await request.getValeurById(req.params.idValeur);
        if (data.length === 0) {
            // retourne message d'erreur
            return res.status(404).json({ message: 'aucune donnée trouvé', success: false });
        }

        await request.deleteValeur(req.params.idValeur);
        // retourne une confirmation
        return res.status(200).json({ message: 'l\'objet a bien été supprimé', success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message, success: false });
    }
});

module.exports = router;
