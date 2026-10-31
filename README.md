# Facturation Tunisie — Caisse et gestion de stock (React)

Application web de caisse enregistreuse et gestion de point de vente (POS) pour commerces et épiceries en Tunisie, réécrite en React avec TypeScript et Tailwind CSS.

## Fonctionnalités

- **Caisse & Scanner de codes-barres** : Viseur caméra en direct (Webcam / BarcodeDetector API) avec reticules d'alignement, contrôle du flash, boutons de test direct et panier interactif en temps réel.
- **Validation du panier & Impression de tickets** : Calcul automatique des totaux en Dinars Tunisiens (TND avec 3 décimales), validation des stocks avant enregistrement, et aperçu/impression de ticket thermique format 58mm/80mm (ESC/POS).
- **Gestion épicerie & Statistiques journalières** :
  - Métriques du jour : Total des ventes, Montant encaissé, Crédits en cours et Articles à stock bas (≤ 5).
  - Vente directe : Choix du produit, quantité vendue, mode de paiement (« Espèces » ou « À crédit — el kridi ») avec déduction immédiate des stocks.
  - Gestion du crédit client (« el kridi ») : Suivi des dettes clients avec enregistrement des encaissements partiels ou totaux.
  - Historique des dernières transactions.
- **Catalogue des articles & Stocks** :
  - Recherche instantanée par nom ou code-barres.
  - Réapprovisionnement rapide du stock (dialogue d'ajout de quantité).
  - Ajout, modification et suppression d'articles avec validation d'unicité des codes-barres.
- **Informations du commerce** : Nom, adresse ligne 1 & 2, numéro de téléphone (+216...) et texte de bas de ticket personnalisable.
- **Paramètres & Matériel** : Statut de l'imprimante thermique, synchronisation Bluetooth et raccourcis de gestion.
- **Stockage local** : Persistance automatique dans le navigateur (remplaçant les boîtes Hive de Flutter).

## Démarrage rapide

```bash
npm install
npm run dev
```

Le serveur de développement démarre sur le port 3000 (`http://localhost:3000`).

## Construction pour production

```bash
npm run build
```
