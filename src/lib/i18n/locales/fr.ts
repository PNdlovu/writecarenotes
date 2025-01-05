export default {
  common: {
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    close: 'Fermer',
    confirm: 'Confirmer',
    back: 'Retour',
    next: 'Suivant',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    clear: 'Effacer',
    yes: 'Oui',
    no: 'Non',
    online: 'En ligne',
    offline: 'Hors ligne',
    onlineDescription: 'La connexion a été rétablie',
    offlineDescription: 'Pas de connexion Internet',
    updateAvailable: 'Mise à jour disponible',
    updateDescription: 'Une nouvelle version est disponible',
    update: 'Mettre à jour',
    checkUpdates: 'Vérifier les mises à jour',
  },
  offline: {
    pendingChanges: '{{count}} changements en attente',
    syncing: 'Synchronisation des changements',
    sync: 'Synchroniser',
  },
  errors: {
    serviceWorker: 'Erreur lors de l\'enregistrement du service worker',
    required: 'Ce champ est obligatoire',
    invalid: 'Valeur invalide',
    minLength: 'Doit contenir au moins {{min}} caractères',
    maxLength: 'Doit contenir au maximum {{max}} caractères',
    email: 'Email invalide',
    password: 'Le mot de passe doit contenir au moins 8 caractères',
    passwordMatch: 'Les mots de passe ne correspondent pas',
    dateFormat: 'Format de date invalide',
    numeric: 'Doit être un nombre',
    unique: 'Doit être unique',
    server: 'Une erreur serveur est survenue',
    network: 'Erreur réseau',
    unauthorized: 'Accès non autorisé',
    forbidden: 'Accès interdit',
    notFound: 'Non trouvé',
  },
  auth: {
    signIn: 'Se connecter',
    signOut: 'Se déconnecter',
    signUp: 'S\'inscrire',
    email: 'Email',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    resetPassword: 'Réinitialiser le mot de passe',
    rememberMe: 'Se souvenir de moi',
  },
  navigation: {
    dashboard: 'Tableau de bord',
    residents: 'Résidents',
    medications: 'Médicaments',
    staff: 'Personnel',
    settings: 'Paramètres',
    reports: 'Rapports',
    help: 'Aide',
  },
  medications: {
    addMedication: 'Ajouter un médicament',
    editMedication: 'Modifier un médicament',
    deleteMedication: 'Supprimer un médicament',
    name: 'Nom du médicament',
    dosage: 'Dosage',
    frequency: 'Fréquence',
    route: 'Voie d\'administration',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    instructions: 'Instructions',
    sideEffects: 'Effets secondaires',
    interactions: 'Interactions',
    barcode: 'Code-barres',
    scan: 'Scanner',
    verify: 'Vérifier',
    administration: {
      record: 'Enregistrer l\'administration',
      witness: 'Témoin requis',
      enterPin: 'Entrer le PIN',
      confirmPin: 'Confirmer le PIN',
      success: 'Administration enregistrée avec succès',
      error: 'Erreur lors de l\'enregistrement de l\'administration',
    },
    alerts: {
      lowStock: 'Alerte de stock bas',
      expiringSoon: 'Expiration proche',
      interaction: 'Alerte d\'interaction',
      missedDose: 'Dose manquée',
    },
  },
};


