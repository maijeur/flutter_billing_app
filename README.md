# Épicerie Tunisie — Caisse et gestion de stock

Application Android hors ligne destinée aux petites épiceries et commerces de proximité en Tunisie.

## Fonctions disponibles

- Caisse avec lecture de codes-barres et panier.
- Catalogue des articles, prix et gestion du stock.
- Prix affichés en dinars tunisiens (TND), avec trois décimales.
- Impression de tickets sur imprimante thermique Bluetooth compatible.
- Écran « Caisse épicerie » pour enregistrer des ventes, suivre les recettes du jour, repérer le stock faible et gérer le crédit client (« el kridi »).
- Données enregistrées localement sur l'appareil ; l'application de base peut fonctionner sans connexion Internet.

## Point important sur les ventes

L'écran « Caisse épicerie » et le panier de caisse d'origine sont encore deux parcours distincts. Les ventes du panier d'origine ne sont pas encore automatiquement reprises dans les statistiques de l'écran « Caisse épicerie ». Vérifiez les résultats avec des données de test avant de vous en servir en situation réelle.

## Technologies

- Flutter / Dart
- flutter_bloc pour l'état de l'application
- Hive pour le stockage local
- mobile_scanner pour la lecture des codes-barres
- Impression thermique Bluetooth

## Compiler l'application

Prérequis : Flutter SDK et Android SDK installés.

```bash
flutter pub get
dart run build_runner build --delete-conflicting-outputs
flutter build apk --release
```

L'APK est généré dans build/app/outputs/flutter-apk/app-release.apk.

## Personnalisation du commerce

Ouvrez « Paramètres » puis « Informations du commerce » pour saisir le nom, l'adresse, le téléphone et le texte de bas de ticket de votre épicerie.
