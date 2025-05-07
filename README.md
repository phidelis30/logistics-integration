# Service d'Intégration Logistique

Ce service Node.js/TypeScript automatise l'intégration des commandes et des rapports d'expédition entre plusieurs boutiques Shopify (actuellement Smallable, L'Exception, et Finger) et le fournisseur logistique L4. Il fonctionne en échangeant des fichiers au format CMDCLI (pour les commandes envoyées à L4) et CRPCMD (pour les rapports d'expédition reçus de L4) via SFTP.

Le processus typique inclut :

1. Récupération des commandes en attente depuis Shopify.
2. Conversion des données de commande au format CMDCLI.
3. Envoi des fichiers CMDCLI à L4 via SFTP.
4. Récupération des fichiers CRPCMD (rapports d'expédition) depuis L4 via SFTP.
5. Traitement des fichiers CRPCMD pour extraire les informations d'expédition.
6. Mise à jour des statuts de commande correspondants dans Shopify.

## Fonctionnalités

- **Récupérer les commandes en attente des boutiques Shopify**: Interroge l'API Shopify pour obtenir les commandes qui nécessitent un traitement logistique.
- **Générer les fichiers CMDCLI selon les spécifications L4**: Transforme les données de commande Shopify en un format structuré (probablement XML, voir la section Formats de Fichiers) attendu par L4.
- **Envoyer les fichiers CMDCLI à L4 via SFTP**: Transfère sécuritairement les fichiers de commande générés vers le serveur SFTP de L4.
- **Récupérer les rapports d'expédition CRPCMD de L4**: Télécharge les fichiers de rapport d'expédition depuis le serveur SFTP de L4.
- **Mettre à jour les statuts de commande dans Shopify en fonction des rapports d'expédition**: Utilise les informations des rapports CRPCMD pour marquer les commandes comme expédiées ou ajuster leur statut dans Shopify.
- **API REST pour opération manuelle**: Fournit des points d'accès HTTP pour déclencher manuellement certaines opérations (par exemple, le traitement des commandes ou des rapports).
- **Tâches planifiées (cron jobs) pour le traitement automatisé**: Configure des tâches récurrentes pour exécuter automatiquement les processus d'envoi de commandes et de traitement de rapports à intervalles réguliers.

## Structure du Projet

```
logistics-integration/
├── src/
│   ├── api/            # Composants de l'API REST
│   ├── cron/           # Tâches planifiées
│   ├── services/       # Logique métier principale
│   ├── models/         # Modèles de données
│   ├── utils/          # Utilitaires
│   ├── config/         # Configuration
│   ├── types/          # Définitions de types TypeScript
│   └── app.ts          # Point d'entrée principal de l'application
```

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/phidelis30/logistics-integration.git
cd logistics-integration

# Installer les dépendances
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```
# Serveur
PORT=3000
NODE_ENV=development

# Configuration SFTP L4
L4_SFTP_HOST=sftp.l4logistics.com
L4_SFTP_PORT=22
L4_SFTP_USERNAME=username
L4_SFTP_PASSWORD=password
L4_CMDCLI_REMOTE_PATH=/IN
L4_CRPCMD_REMOTE_PATH=/OUT
L4_CRPCMD_ARCHIVE_PATH=/OUT/ARCHIVES

# Sécurité API
API_SECRET=your-api-secret-key

# Shopify - Finger
FINGER_API_KEY=your-api-key
FINGER_API_SECRET_KEY=your-api-secret
FINGER_SHOP_NAME=finger.myshopify.com

# Shopify - Smallable
SMALLABLE_API_KEY=your-api-key
SMALLABLE_API_SECRET_KEY=your-api-secret
SMALLABLE_SHOP_NAME=smallable.myshopify.com

# Shopify - L'Exception
LEXCEPTION_API_KEY=your-api-key
LEXCEPTION_API_SECRET_KEY=your-api-secret
LEXCEPTION_SHOP_NAME=lexception.myshopify.com

# Planifications Cron
CRON_SEND_ORDERS=0 */1 * * *
CRON_PROCESS_REPORTS=*/30 * * * *
```

## API REST

Le service expose plusieurs points d'accès API pour déclencher manuellement des opérations ou pour être utilisés comme webhooks.

- **`POST /api/orders/process-pending`**: Déclenche le traitement des commandes en attente pour toutes les boutiques configurées.
  - Corps de la requête (optionnel) : `{ "storeId": "nom_de_la_boutique" }` pour traiter uniquement les commandes d'une boutique spécifique.
- **`POST /api/orders/process-shipping-reports`**: Déclenche le traitement des rapports d'expédition CRPCMD téléchargés.
- **`POST /api/orders/webhook/process-pending`**: Point d'accès webhook pour déclencher le traitement d'une commande spécifique lors de sa création ou mise à jour dans Shopify.
  - Corps de la requête : Les données de la commande envoyées par Shopify.

**Authentification**: Les points d'accès API sont protégés par un middleware d'authentification. Assurez-vous d'inclure un en-tête `Authorization: Bearer YOUR_API_SECRET` avec la clé secrète configurée dans le fichier `.env`.

## Formats de Fichiers

Le service échange des fichiers avec L4 en utilisant deux formats principaux :

- **CMDCLI (Commandes)**: Fichiers envoyés à L4 contenant les détails des commandes à expédier. Le format est basé sur XML. Les définitions de type TypeScript correspondantes se trouvent dans [`src/types/cmdcli.types.ts`](src/types/cmdcli.types.ts).
- **CRPCMD (Rapports d'Expédition)**: Fichiers reçus de L4 contenant les informations sur les expéditions traitées. Le format est également basé sur XML. Les définitions de type TypeScript correspondantes se trouvent dans [`src/types/crpcmd.types.ts`](src/types/crpcmd.types.ts).

Ces fichiers sont échangés via SFTP en utilisant les chemins configurés dans le fichier `.env`.

## Structure du Projet

## Comment Exécuter

Pour exécuter l'application, vous pouvez utiliser les scripts suivants :

```bash
# Exécuter en mode développement avec rechargement à chaud
npm run dev

# Compiler et exécuter en mode production
npm start
```
