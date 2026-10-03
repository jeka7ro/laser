// Internationalization dictionary for Laser Magic (Vilvoorde / Brussels)
// Strictly: French (FR), Dutch (NL), English (EN)

export const translations = {
  fr: {
    // Brand & General
    brandName: "Laser Magic",
    locationTag: "Vilvoorde · 15 min de Bruxelles",
    currency: "€",
    perChild: "/enfant",
    perPerson: "/personne",
    save: "Enregistrer",
    cancel: "Annuler",
    close: "Fermer",
    confirm: "Confirmer",
    selectService: "Choisir cette formule",
    delete: "Supprimer",
    edit: "Modifier",
    search: "Rechercher...",
    filter: "Filtrer",
    all: "Tous",
    today: "Aujourd'hui",
    tomorrow: "Demain",
    thisWeekend: "Ce week-end",
    status: "Statut",
    actions: "Actions",
    print: "Imprimer la fiche",
    export: "Exporter CSV",

    // Statuses
    statusPending: "En attente",
    statusConfirmed: "Confirmé",
    statusInProgress: "En cours",
    statusCompleted: "Terminé",
    statusCancelled: "Annulé",

    // Back-office Navigation & Sidebar
    sidebarNavMain: "NAVIGATION PRINCIPALE",
    sidebarNavIntegrations: "INTÉGRATIONS & API",
    sidebarLocationTag: "Laser Magic · Vilvoorde (Bruxelles)",
    navDashboard: "Tableau de Bord",
    navTimeline: "Planning Arènes & Tables",
    navBookings: "Réservations",
    navReports: "Rapports & Stats",
    navClients: "Fichier Clients (CRM)",
    navKitchen: "Fiche Accueil & Cuisine",
    navCapacity: "Capacité & Arènes",
    navEmbed: "Intégrations & API",
    newBookingBtn: "Nouvelle Réservation",
    exportExcel: "Exporter Excel",
    liveArenas: "2 Arènes Actives",
    themeModeLight: "Mode Lumineux",
    themeModeDark: "Mode Sombre",
    capacityBadge: "Capacité Max: 44 Joueurs",

    // Topbar Dynamic Titles & Subtitles
    topbarReportsTitle: "Tableau de Bord",
    topbarReportsSub: "Indicateurs en temps réel, fréquentation des arènes et répartition du chiffre d'affaires",
    topbarClientsTitle: "Fichier & BDD Clients",
    topbarClientsSub: "Base de données complète de vos clients particuliers et entreprises (B2B)",
    topbarTimelineTitle: "Planning Arènes & Tables",
    topbarTimelineSub: "Supervision en temps réel des créneaux de jeu et des tables d'anniversaire",
    topbarBookingsTitle: "Gestion des Réservations",
    topbarBookingsSub: "Toutes les commandes en temps réel, tickets de caisse, règlements et validation",
    topbarKitchenTitle: "Fiche Accueil & Cuisine",
    topbarKitchenSub: "Préparation des goûters, gâteaux d'anniversaire et fiches de table",
    topbarEmbedTitle: "Intégrations & API Webhooks",
    topbarEmbedSub: "Hub de synchronisation avec les caisses POS, Webhooks temps réel et widget Webflow",

    // Stats / KPI Cards
    statTodayBookings: "Réservations du Jour",
    statTotalBookings: "Total Réservations",
    statWeekendBookings: "Réservations Week-end",
    statMonthBookings: "Réservations du Mois",
    statTotalPlayers: "Joueurs Attendus",
    statRevenueToday: "Chiffre d'Affaires",
    statPendingApprovals: "À Valider Immédiatement",
    statArenasJunglePrison: "Arènes Jungle & Prison",
    allArenasVilvoorde: "Toutes arènes · Vilvoorde",
    todayArenasSub: "Aujourd'hui · 2 Arènes",
    weekendArenasSub: "Samedi & Dimanche · 2 Arènes",
    monthArenasSub: "Mois en cours · 2 Arènes",
    allValidated: "Tous les dossiers sont validés",
    avgPlayersPerBooking: "{avg} joueurs / dossier (moy.)",
    kpiDepositsLabel: "Acomptes",
    kpiBalanceLabel: "Solde",
    kpiPendingSub: "En attente validation mail",

    // Bookings Table & Filters
    searchBookingsPlaceholder: "Rechercher par nom, téléphone, réf...",
    colSelect: "Sélection",
    colOrder: "N° Cde",
    colDateTime: "Date & Heure",
    colPackage: "Formule & Fêté",
    colClient: "Client Organisateur",
    colStatus: "Statut",
    colTotal: "Total & Solde",
    colActions: "Actions",

    // Bulk actions
    selectedCountSingular: "sélectionnée",
    selectedCountPlural: "sélectionnées",
    deselectAll: "Désélectionner tout",
    bulkConfirm: "Valider / Confirmer",
    exportSelection: "Exporter sélection",
    deleteSelection: "Supprimer la sélection",

    // Table rows & badges
    validated: "Validé",
    pendingValidation: "Attente",
    paidInFull: "Soldé",
    balanceDuePrefix: "Solde :",
    emptyBookings: "Aucune réservation trouvée pour ces critères.",
    tooltipCoupon: "Campagne Anniversaire : Bon -15%",
    tooltipWhatsApp: "Contacter par WhatsApp",
    tooltipEmail: "Aperçu & Renvoyer Email",
    tooltipCopyLink: "Copier le lien magique client",
    tooltipPayBalance: "Encaisser le solde restant",
    tooltipViewBooking: "Voir les détails complets du dossier",

    // Pagination Footer
    rowsPerPage: "Lignes par page :",
    showingRange: "Affichage de {start} à {end} sur {total}",
    totalRecords: "Total enreg. :",
    totalRevenue: "Total CA :",
    totalBalances: "Total Soldes :",
    pagePrev: "Page précédente",
    pageNext: "Page suivante",

    // Reports View
    reportsTitle: "Tableau de Bord & Rapports Analytiques",
    reportsSub: "Indicateurs en temps réel, fréquentation des arènes et répartition des formules de Laser Magic",
    periodAll: "Tous",
    periodToday: "Aujourd'hui",
    periodWeekend: "Ce Week-end",
    periodMonth: "Ce Mois",
    exportReport: "Exporter Rapport",
    bookingStatusTitle: "Statut des Réservations",
    bookingStatusRate: "Taux :",
    centerReservationsLabel: "RÉSERVATIONS",
    packageBreakdownTitle: "Répartition par Formule",
    extrasSalesTitle: "Ventes d'Extras & Add-ons",
    financialSummaryTitle: "Synthèse Financière & Règlements",
    depositsCollected: "Acomptes encaissés",
    balancesRemaining: "Soldes restants sur place",
    avgPerBooking: "Panier moyen / commande",
    avgPerPlayer: "Dépense moyenne / joueur",

    // Quick Booking Modal
    qbModalTitle: "Nouvelle Réservation Téléphonique",
    qbModalSub: "Prise rapide d'une réservation au téléphone ou au comptoir d'accueil",
    qbSectionContact: "Contact & Organisateur",
    qbLabelClientName: "Nom du client",
    qbLabelPhone: "Téléphone portable",
    qbLabelEmail: "Email (pour confirmation & coupon)",
    qbLabelLang: "Langue client",
    qbLabelChildName: "Prénom de l'enfant fêté",
    qbLabelChildDob: "Date de naissance",
    qbCouponTag: "Coupon -15% dans 1 an",
    qbSectionDateTime: "Date, Créneau & Participants",
    qbLabelDate: "Date",
    qbLabelSlot: "Créneau horaire",
    qbLabelPlayers: "Joueurs",
    qbSectionPackage: "Formule & Préférences",
    qbLabelPackage: "Formule choisie",
    qbLabelNotes: "Remarques & Préférences",
    qbPriceEstimate: "Estimation du Dossier",
    qbPriceOnsiteNote: "Règlement sur place le jour J",
    qbSubmitBtn: "Valider la réservation téléphonique",

    // Corporate & B2B Team Building
    bookingType: "Type de réservation",
    typeIndividual: "Particulier / Anniversaire",
    typeCorporate: "Entreprise / Team Building (B2B)",
    companyName: "Nom de l'entreprise",
    companySearchPlaceholder: "Tapez le nom d'entreprise ou TVA (ex: Deloitte, Solvay, ASML...)",
    vatNumber: "N° de TVA intracommunautaire (BE / NL / UE)",
    vatLookupBtn: "Vérifier VIES",
    vatValid: "TVA Validée VIES UE",
    vatChecking: "Vérification VIES en cours...",
    vatInvalid: "Format ou TVA non valide",
    billingAddress: "Adresse de facturation (Google Maps)",
    addressPlaceholder: "Rue, N°, Code Postal, Ville, Pays...",
    contactRole: "Rôle / Fonction du contact",
    poNumber: "N° Bon de commande (PO / Ref interne)",
    corporateNotice: "Facturation B2B conforme aux normes belges (BCE / KBO) et européennes (VIES).",

    // Bar POS & Consommations
    barPosTitle: "Fiche Consommations & Caisse Bar",
    barPosSub: "Sélectionnez les boissons et snacks sur l'ardoise de la table",
    openBarPosBtn: "Ardoise / Consommations Bar",
    barTabOrdersTitle: "Ardoise Bar & Consommations",
    barTotalLabel: "Total Ardoise Bar",
    allCategories: "Tous les produits",
    drinksSoft: "Softs & Eaux",
    drinksAlcohol: "Bières & Cidres",
    foodSnacks: "Petite Restauration",
    foodSweets: "Douceurs & Glaces",
    extrasGames: "Extras & Jeux",
    addToTabBtn: "Ajouter sur l'ardoise (Paiement final)",
    payDirectBtn: "Encaisser immédiatement",
    settleTabBtn: "Solder l'ardoise de la table",
    orderAddedToTab: "Consommations ajoutées à l'ardoise !",
    orderSettled: "Ardoise soldée avec succès !",

    checklistTitle: "Check-list Opérations",
    checklistJungle: "Vérification des gilets et blasters (Arène Jungle)",
    checklistPrison: "Vérification des gilets et blasters (Arène Prison)",
    checklistDrinks: "Préparation des pichets d'eau et softs à température",
    checklistSmoke: "Allumage machine à fumée et sono briefing",
    checklistTeams: "Distribution des fiches d'équipes aux parents",
    topbarClientPortal: "Page Client (Portail)",
    sidebarClientPortal: "Page Client (Live)",
    kpiSubRevenue: "Avances + Soldes sur place",
    kitchenBarPosBtn: "Caisse Bar & Pizzas (Simulateur Ardoise)",
    noGroupsToday: "Aucun groupe prévu ce jour.",
    colResource: "Ressource / Salle",
    snack: "Goûter",
    rowClickDetails: "Cliquer pour ouvrir les détails du dossier #{id}",
    dailyOrderNumber: "Numéro journalier",
    emptyKitchenDay: "Aucun groupe prévu ce jour.",
    birthdayOf: "Anniversaire",
    yearsOld: "ans",
    printTableSheet: "Imprimer la fiche de table",
    menuLabel: "Menu",
    snackLabel: "Goûter",
    cakeLabel: "Gâteau",
    arcadeTokensLabel: "Jetons Arcade",
    allergiesNotesLabel: "Allergies / Notes",
    notIncluded: "Non inclus",
    chocolateCake: "Gâteau chocolat",
    tokensUnit: "jetons",
    kidsCount: "enfants",
    clientsPageTitle: "Fichier & Base de Données Clients (CRM)",
    clientsPageSub: "Répertoire complet des organisateurs, historique des réservations, fidélité et contacts directs",
    crmUniqueClients: "Clients Uniques Enregistrés",
    crmCorporateAccounts: "Comptes Entreprises (B2B)",
    crmTotalRevenue: "Chiffre d'Affaires Cumulé (LTV)",
    crmRepeatClients: "Clients Fidèles (2+ Visites)",
    crmAvgBasket: "Panier Moyen par Client",
    crmSearchPlaceholder: "Rechercher par nom, téléphone, e-mail, entreprise ou TVA...",
    crmIndividuals: "Particuliers",
    crmCorporate: "Entreprises B2B",
    crmVip: "Fidèles VIP",
    crmColClient: "Client / Contact",
    crmColContact: "Téléphone & E-mail",
    crmColTax: "Type & Filiation / TVA",
    crmColVisits: "Visites",
    crmColLastDate: "Dernière Date",
    crmColLtv: "Total Dépensé (LTV)",
    crmColActions: "Actions CRM",
    crmNoChildren: "Pas d'enfant rattaché",
    crmNotSpecified: "Non renseigné",
    crmBookingsCount: "{count} dossier(s)",
    viewOrder: "Voir la commande en détail",
    importAmeliaBtn: "Importer CSV Amelia",
    ameliaModalTitle: "Importation Clients Amelia (WordPress)",
    ameliaModalSub: "Glissez-déposez l'export CSV d'Amelia ou collez les données brutes",
    ameliaDropTitle: "Glissez-déposez le fichier CSV Amelia ici",
    ameliaDropSub: "Compatible avec l'export natif WordPress (WordPress -> Amelia -> Customers -> Export)",
    orderTicketLabel: "COMMANDE",
    presenceConfirmedByParent: "Présence & Équipes confirmées par le parent",
    awaitingClientValidation: "En attente de validation client (Espace en ligne)",
    copyClientLink: "Copier le lien client",
    openClientPortal: "Ouvrir l'espace client",
    clientLinkCopied: "Lien client copié !",
    detailsOrderPhotos: "Détail de la Commande & Extras (Photos)",
    servicesCount: "prestations",

    embedHubTitle: "Hub d'Intégration : API REST & Webhooks",
    embedHubSub: "Connectez Laser Magic en temps réel avec vos logiciels de caisse (POS), vos bornes tactiles, Zapier, Make ou votre site Webflow",
    subtabWebhooks: "Webhooks Sortants (POS & Apps)",
    subtabApi: "API REST & Clés",
    subtabWidget: "Widget Iframe Webflow",
    subtabCommunications: "Passerelles E-mail & WhatsApp",
    commHubTitle: "Passerelles de Communication : E-mail & WhatsApp",
    commHubSub: "Configurez vos prestataires d'envoi en direct (Resend, SendGrid, Meta WhatsApp Cloud API, Twilio, Webhooks) et suivez le journal des délivrabilités",
    commEmailTitle: "Configuration Passerelle E-mail",
    commWaTitle: "Configuration Passerelle WhatsApp",
    commLogsTitle: "Journal Global des Envois & Notifications",
    btnTestEmail: "Tester Envoi E-mail",
    btnTestWa: "Tester Envoi WhatsApp",
    btnSaveComm: "Enregistrer les Paramètres",

    // Timeline
    timelineTitle: "Planning Opérationnel des Salles & Arènes",
    timelineSubtitle: "Vue en temps réel des créneaux dans les arènes Jungle, Prison, Minigolf et Tables d'anniversaire",
    arenaJungle: "Arène 1 · Jungle (Max 22)",
    arenaPrison: "Arène 2 · Prison (Max 22)",
    arenaCombined: "Mode Fusion (44 joueurs)",
    facilityMinigolf: "Minigolf Extérieur (12 trous)",
    facilityKaraoke: "Salon Karaoké",
    tablesArea: "Espace Tables & Goûter (T1 - T8)",

    // Group Sheet / Kitchen
    kitchenTitle: "Fiche d'Accueil & Préparation Cuisine",
    kitchenSubtitle: "Détail des collations, commandes de gâteaux, allergies et composition des équipes",
    foodDonuts: "Mini Donuts (Lots)",
    foodFriesFricadelle: "Portions Frites & Fricadelle",
    foodVipMeals: "Menus VIP (Tenders + Frites + Glace)",
    foodCakes: "Gâteaux au chocolat commandés",
    foodArcadeTokens: "Jetons d'arcade à remettre",
    foodChampagne: "Bouteilles Kid Champagne (VIP)",
    dietaryNotes: "Allergies / Régimes particuliers",
    teamComposition: "Feuille des équipes",
    teamRed: "Équipe Rouge",
    teamBlue: "Équipe Bleue",

    // Widget Steps
    step1Title: "Formule",
    step1Desc: "Choisissez votre activité",
    step2Title: "Date & Heure",
    step2Desc: "Créneaux disponibles en direct",
    step3Title: "Options & Extras",
    step3Desc: "Personnalisez la fête",
    step4Title: "Coordonnées",
    step4Desc: "Validation & Acompte",

    // Package types
    categoryBirthdays: "Anniversaires Enfants (7-15 ans)",
    categoryStandard: "Parties Laser Game Standard",
    categoryCorporate: "Team Building & Groupes",

    // Packages
    sweetTitle: "Formule Sweet",
    sweetPrice: "24",
    sweetTag: "L'essentiel sucré",
    sweetDuration: "2 heures",
    sweetFeatures: [
      "2 parties de Laser Game (ou 1 Laser + 1 Minigolf)",
      "Mix gourmand de mini donuts",
      "1 soft au choix par enfant",
      "Animation anniversaire : musique & feu de Bengale",
      "1 jeton d'arcade par enfant",
      "1 bon cadeau pour chaque enfant"
    ],

    funTitle: "Formule Fun",
    funPrice: "26",
    funTag: "Le goûter salé chaud",
    funDuration: "2 heures",
    funFeatures: [
      "2 parties de Laser Game (ou 1 Laser + 1 Minigolf)",
      "Portion de frites & fricadelle avec ketchup",
      "1 soft au choix par enfant",
      "Animation anniversaire : musique & feu de Bengale",
      "1 jeton d'arcade par enfant",
      "1 bon cadeau pour chaque enfant"
    ],

    vipTitle: "Formule VIP",
    vipPrice: "28",
    vipTag: "Repas complet + 1h en plus",
    vipDuration: "3 heures",
    vipBadge: "Le Plus Populaire",
    vipFeatures: [
      "Accueil VIP : champagne sans alcool, chips & popcorn",
      "Repas chaud : frites + tenders de poulet croustillants + 1 glace",
      "2 parties de Laser Game (ou 1 Laser + 1 Minigolf)",
      "Animation anniversaire : musique & feu de Bengale",
      "1 jeton d'arcade par enfant",
      "1 bon cadeau par enfant"
    ],

    standard1Title: "1 Partie Découverte",
    standard1Price: "12",
    standard1Duration: "30 min (15 min de jeu)",
    standard1Features: ["1 session dans l'arène", "Briefing tactique & équipement", "Feuille de scores individuelle"],

    standard2Title: "2 Parties Choc",
    standard2Price: "22",
    standard2Duration: "1 heure",
    standard2Badge: "Recommandé",
    standard2Features: ["2 sessions intenses", "Changement d'arène (Jungle & Prison)", "Feuille de scores"],

    standard3Title: "3 Parties Marathon",
    standard3Price: "30",
    standard3Duration: "1h30",
    standard3Features: ["3 sessions complètes", "Stratégies avancées", "Pause tactique entre les matchs"],

    // Addons
    addonsTitle: "Personnalisez votre événement :",
    addonsSubtitle: "Options et activités complémentaires avec calcul en temps réel",
    addonLaserGame: "Partie de Laser Game supplémentaire",
    addonLaserGameSub: "Session extra de 15/20 min dans l'arène fluo Jungle / Prison",
    addonLaserGamePrice: "+7 € / pers.",
    addonMiniGolf: "Partie de Mini-Golf supplémentaire",
    addonMiniGolfSub: "Parcours 12 trous paysager extérieur (par beau temps)",
    addonMiniGolfPrice: "+7 € / pers.",
    addonCake: "Gâteau au chocolat maison avec bougies",
    addonCakeSub: "Gâteau artisanal avec fontaine scintillante et bougies",
    addonCakePrice: "+6 € / pers.",
    addonCastle: "Château gonflable & Parcours commando",
    addonCastleSub: "Structure gonflable géante et parcours aventure extérieur (par beau temps)",
    addonCastlePrice: "+2 € / pers.",
    addonArcade: "Jetons d'arcade rétro",
    addonArcadeSub: "Pour les flippers, bornes rétro et simulateurs de pilotage",
    addonArcadePrice: "2 € / jeton",
    addonDrinks: "Boissons supplémentaires / Softs",
    addonDrinksSub: "1 boisson fraîche au choix ou pichet rafraîchissant pour le groupe",
    addonDrinksPrice: "+3,20 € / pers.",
    tagLaserArena: "Arène Fluo",
    tagOutdoor: "Plein Air",
    tagGourmet: "Gourmand",
    tagFun: "Aventure",
    tagArcade: "Salle Arcade",
    tagBar: "Bar & Lounge",
    totalForPlayers: "pour {count} joueurs",
    tokensSelected: "{count} jeton(s) sélectionné(s)",
    categoryGames: "Parties Laser (min. 10 pers.)",
    categoryQuick: "Formule Flash EVG / Amis",
    categoryDinner: "Dîner Laser & Soirée",

    // Step 2 Calendar
    selectDate: "1. Choisissez votre date",
    selectTime: "2. Choisissez votre créneau",
    minPlayersNotice: "Minimum requis : 8 enfants (tolérance de facturation appliquée)",
    slotsAvailable: "places restantes",
    slotFull: "Complet",
    calendarDaysHeader: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],

    // Step 3 Customization
    playersCountLabel: "Nombre de participants :",
    childrenAgeLabel: "Âge fêté (ou tranche d'âge) :",
    childCelebratedName: "Prénom de l'enfant qui fête son anniversaire :",
    guestNotice: "Indiquez l'estimation la plus précise. Ajustable jusqu'au jour J selon les conditions du centre.",

    // Step 4 Form & Checkout
    organizerName: "Nom et Prénom de l'organisateur",
    organizerEmail: "Adresse e-mail (pour confirmation immédiate)",
    organizerPhone: "Numéro de téléphone portable (format belge ou intl)",
    specialNotes: "Remarques spéciales, allergies alimentaires, régimes",
    playersUnit: "pers.",
    orderSummary: "Récapitulatif de la réservation",
    depositToPayNow: "Acompte en ligne à régler (30%)",
    balanceDueOnSite: "Solde restant à régler sur place le jour J",
    totalAmount: "Montant Total Estimé",
    payDepositCard: "Payer l'acompte par Carte Sécurisée (Stripe)",
    payOnSiteOption: "Confirmer sans acompte (Règlement total sur place)",
    payBancontact: "Bancontact (App Payconiq / Carte)",
    payPayconiq: "Payconiq by Bancontact (QR Code mobile)",
    payStripeCard: "Carte Bancaire (Visa / Mastercard)",
    depositChoice30: "Acompte de 30% maintenant (Recommandé)",
    depositChoice100: "Paiement 100% intégral",
    depositChoiceOnsite: "Règlement 100% sur place le jour J",
    termsAgree: "J'accepte les conditions de réservation (annulation sans frais jusqu'à 72h avant l'événement).",
    completeBookingBtn: "Confirmer ma réservation instantanée",

    // Success Screen
    bookingSuccessTitle: "Réservation confirmée avec succès !",
    bookingRef: "Numéro de dossier :",
    successMsg: "Votre créneau est immédiatement bloqué dans notre planning. Un e-mail de confirmation détaillé vous a été envoyé.",
    btnWhatsAppRecap: "Ouvrir mon récapitulatif WhatsApp",
    btnClientPortal: "Accéder à mon espace de confirmation client",
    btnPreviewEmail: "Aperçu de mon e-mail de confirmation",
    btnAddToCalendar: "Ajouter à mon agenda (.ics)",
    btnDownloadInvitations: "Télécharger les cartons d'invitation",
    btnNewBooking: "Effectuer une autre réservation",

    // Iframe Embed instructions
    embedTitle: "Intégration Iframe sur Webflow (lasermagic.be)",
    embedSubtitle: "Copiez-collez simplement ce bloc HTML dans votre page Webflow pour remplacer l'ancien widget Amelia.",
    copyCodeBtn: "Copier le code d'intégration",
    codeCopied: "Code copié dans le presse-papier !"
  },

  nl: {
    // Brand & General
    brandName: "Laser Magic",
    locationTag: "Vilvoorde · 15 min van Brussel",
    currency: "€",
    perChild: "/kind",
    perPerson: "/persoon",
    save: "Opslaan",
    cancel: "Annuleren",
    close: "Sluiten",
    confirm: "Bevestigen",
    selectService: "Kies deze formule",
    delete: "Verwijderen",
    edit: "Bewerken",
    search: "Zoeken...",
    filter: "Filteren",
    all: "Alles",
    today: "Vandaag",
    tomorrow: "Morgen",
    thisWeekend: "Dit weekend",
    status: "Status",
    actions: "Acties",
    print: "Groepsfiche printen",
    export: "Exporteren naar CSV",

    // Statuses
    statusPending: "In afwachting",
    statusConfirmed: "Bevestigd",
    statusInProgress: "Bezig",
    statusCompleted: "Voltooid",
    statusCancelled: "Geannuleerd",

    // Back-office Navigation & Sidebar
    sidebarNavMain: "HOOFDNAVIGATIE",
    sidebarNavIntegrations: "INTEGRATIES & API",
    sidebarLocationTag: "Laser Magic · Vilvoorde (Brussel)",
    navDashboard: "Dashboard",
    navTimeline: "Planning Arena's & Tafels",
    navBookings: "Boekingen",
    navReports: "Rapporten & Stats",
    navClients: "Klantenbestand (CRM)",
    navKitchen: "Keuken & Onthaalfiche",
    navCapacity: "Capaciteit & Arena's",
    navEmbed: "Integraties & API",
    newBookingBtn: "Nieuwe Boeking",
    exportExcel: "Excel Exporteren",
    liveArenas: "2 Arena's Actief",
    themeModeLight: "Lichte modus",
    themeModeDark: "Donkere modus",
    capacityBadge: "Max Capaciteit: 44 Spelers",

    // Topbar Dynamic Titles & Subtitles
    topbarReportsTitle: "Dashboard",
    topbarReportsSub: "Realtime indicatoren, arenabezetting en omzetverdeling",
    topbarClientsTitle: "Klantenbestand & CRM",
    topbarClientsSub: "Volledige database van particuliere en zakelijke (B2B) klanten",
    topbarTimelineTitle: "Planning Arena's & Tafels",
    topbarTimelineSub: "Realtime toezicht op spelslots en verjaardagstafels",
    topbarBookingsTitle: "Boekingenbeheer",
    topbarBookingsSub: "Alle realtime bestellingen, kassaoverzicht, betalingen en validatie",
    topbarKitchenTitle: "Keuken & Onthaalfiche",
    topbarKitchenSub: "Voorbereiding van snacks, verjaardagstaarten en tafelfiches",
    topbarEmbedTitle: "Integraties & API Webhooks",
    topbarEmbedSub: "Synchronisatiehub met kassasystemen (POS), realtime Webhooks en Webflow widget",

    // Stats / KPI Cards
    statTodayBookings: "Boekingen Vandaag",
    statTotalBookings: "Totaal Boekingen",
    statWeekendBookings: "Weekend Boekingen",
    statMonthBookings: "Maandelijkse Boekingen",
    statTotalPlayers: "Verwachte Spelers",
    statRevenueToday: "Totale Omzet",
    statPendingApprovals: "Te Valideren",
    statArenasJunglePrison: "Arena's Jungle & Prison",
    allArenasVilvoorde: "Alle arena's · Vilvoorde",
    todayArenasSub: "Vandaag · 2 Arena's",
    weekendArenasSub: "Zaterdag & Zondag · 2 Arena's",
    monthArenasSub: "Lopende maand · 2 Arena's",
    allValidated: "Alle dossiers zijn gevalideerd",
    avgPlayersPerBooking: "{avg} spelers / boeking (gem.)",
    kpiDepositsLabel: "Voorschot",
    kpiBalanceLabel: "Saldo",
    kpiPendingSub: "In afwachting e-mailvalidatie",

    // Bookings Table & Filters
    searchBookingsPlaceholder: "Zoeken op naam, telefoon, ref...",
    colSelect: "Selectie",
    colOrder: "Bestelnr.",
    colDateTime: "Datum & Uur",
    colPackage: "Formule & Jarige",
    colClient: "Organisator",
    colStatus: "Status",
    colTotal: "Totaal & Saldo",
    colActions: "Acties",

    // Bulk actions
    selectedCountSingular: "geselecteerd",
    selectedCountPlural: "geselecteerd",
    deselectAll: "Alles deselecteren",
    bulkConfirm: "Bevestigen / Goedkeuren",
    exportSelection: "Selectie exporteren",
    deleteSelection: "Selectie verwijderen",

    // Table rows & badges
    validated: "Bevestigd",
    pendingValidation: "In afwachting",
    paidInFull: "Betaald",
    balanceDuePrefix: "Saldo:",
    emptyBookings: "Geen boekingen gevonden voor deze criteria.",
    tooltipCoupon: "Verjaardagscampagne: Bon -15%",
    tooltipWhatsApp: "Contact via WhatsApp",
    tooltipEmail: "Voorbeeld & E-mail Opnieuw Verzenden",
    tooltipCopyLink: "Kopieer magische klantenlink",
    tooltipPayBalance: "Resterend saldo ontvangen",
    tooltipViewBooking: "Volledige dossierdetails bekijken",

    // Pagination Footer
    rowsPerPage: "Rijen per pagina:",
    showingRange: "Weergave van {start} tot {end} van {total}",
    totalRecords: "Totaal records:",
    totalRevenue: "Totale omzet:",
    totalBalances: "Totaal saldo:",
    pagePrev: "Vorige pagina",
    pageNext: "Volgende pagina",

    // Reports View
    reportsTitle: "Dashboard & Analytische Rapporten",
    reportsSub: "Realtime indicatoren, arenabezetting en formuleverdeling van Laser Magic",
    periodAll: "Alles",
    periodToday: "Vandaag",
    periodWeekend: "Dit weekend",
    periodMonth: "Deze maand",
    exportReport: "Rapport Exporteren",
    bookingStatusTitle: "Status van de Boekingen",
    bookingStatusRate: "Percentage:",
    centerReservationsLabel: "BOEKINGEN",
    packageBreakdownTitle: "Verdeling per Formule",
    extrasSalesTitle: "Verkoop van Extra's & Add-ons",
    financialSummaryTitle: "Financieel Overzicht & Betalingen",
    depositsCollected: "Ontvangen voorschotten",
    balancesRemaining: "Resterend saldo ter plaatse",
    avgPerBooking: "Gemiddelde bestelwaarde",
    avgPerPlayer: "Gemiddelde uitgave / speler",

    // Quick Booking Modal
    qbModalTitle: "Nieuwe Telefonische Boeking",
    qbModalSub: "Snelle boeking via telefoon of aan de balie",
    qbSectionContact: "Contact & Organisator",
    qbLabelClientName: "Klantnaam",
    qbLabelPhone: "Mobiel telefoonnummer",
    qbLabelEmail: "E-mail (voor bevestiging & bon)",
    qbLabelLang: "Taal klant",
    qbLabelChildName: "Voornaam van de jarige",
    qbLabelChildDob: "Geboortedatum",
    qbCouponTag: "Kortingsbon -15% over 1 jaar",
    qbSectionDateTime: "Datum, Tijdslot & Deelnemers",
    qbLabelDate: "Datum",
    qbLabelSlot: "Tijdslot",
    qbLabelPlayers: "Spelers",
    qbSectionPackage: "Formule & Voorkeuren",
    qbLabelPackage: "Gekozen formule",
    qbLabelNotes: "Opmerkingen & Wensen",
    qbPriceEstimate: "Schatting van het Dossier",
    qbPriceOnsiteNote: "Betaling ter plaatse op de dag zelf",
    qbSubmitBtn: "Telefonische boeking bevestigen",

    // Corporate & B2B Team Building
    bookingType: "Type boeking",
    typeIndividual: "Particulier / Verjaardag",
    typeCorporate: "Bedrijf / Teambuilding (B2B)",
    companyName: "Bedrijfsnaam",
    companySearchPlaceholder: "Typ bedrijfsnaam of BTW (bv. Deloitte, Solvay, ASML...)",
    vatNumber: "Intracommunautair BTW-nummer (BE / NL / EU)",
    vatLookupBtn: "VIES Controleren",
    vatValid: "Geldig EU VIES BTW-nummer",
    vatChecking: "VIES verificatie bezig...",
    vatInvalid: "Ongeldig BTW-formaat",
    billingAddress: "Factuuradres (Google Maps)",
    addressPlaceholder: "Straat, Nr, Postcode, Stad, Land...",
    contactRole: "Functie / Rol van contactpersoon",
    poNumber: "Bestelbonnummer (PO / Intern ref)",
    corporateNotice: "B2B-facturatie conform Belgische (KBO / BCE) en Europese (VIES) standaarden.",

    // Bar POS & Consommations
    barPosTitle: "Barconsumpties & Kassa",
    barPosSub: "Selecteer dranken en snacks op de rekening van de tafel",
    openBarPosBtn: "Barrekening / Consumpties",
    barTabOrdersTitle: "Barrekening & Consumpties",
    barTotalLabel: "Totaal Barrekening",
    allCategories: "Alle producten",
    drinksSoft: "Frisdrank & Water",
    drinksAlcohol: "Bieren & Cider",
    foodSnacks: "Snacks & Eten",
    foodSweets: "Zoetigheden & Ijs",
    extrasGames: "Extras & Spellen",
    addToTabBtn: "Op rekening zetten (Achteraf betalen)",
    payDirectBtn: "Direct afrekenen",
    settleTabBtn: "Tafelrekening vereffenen",
    orderAddedToTab: "Consumpties toegevoegd aan rekening!",
    orderSettled: "Barrekening succesvol voldaan!",

    checklistTitle: "Operationele Checklist",
    checklistJungle: "Controle vesten en blasters (Arena Jungle)",
    checklistPrison: "Controle vesten en blasters (Arena Prison)",
    checklistDrinks: "Voorbereiding kannen water en frisdrank op temperatuur",
    checklistSmoke: "Rookmachine en briefing audio inschakelen",
    checklistTeams: "Verdeling van teamlijsten aan ouders",
    topbarClientPortal: "Klantenpagina (Portaal)",
    sidebarClientPortal: "Klantenportaal (Live)",
    kpiSubRevenue: "Voorschotten + Saldo's ter plaatse",
    kitchenBarPosBtn: "Kassa Bar & Pizza's (Rekening Simulator)",
    noGroupsToday: "Geen groepen gepland voor deze dag.",
    colResource: "Resource / Zaal",
    snack: "Vieruurtje",
    rowClickDetails: "Klik om dossierdetails #{id} te openen",
    dailyOrderNumber: "Dagelijks volgnummer",
    emptyKitchenDay: "Geen groepen gepland voor deze dag.",
    birthdayOf: "Verjaardag van",
    yearsOld: "jaar",
    printTableSheet: "Tafelfiche afdrukken",
    menuLabel: "Menu",
    snackLabel: "Vieruurtje",
    cakeLabel: "Taart",
    arcadeTokensLabel: "Arcademunten",
    allergiesNotesLabel: "Allergieën / Notities",
    notIncluded: "Niet inbegrepen",
    chocolateCake: "Chocoladetaart",
    tokensUnit: "munten",
    kidsCount: "kinderen",
    clientsPageTitle: "Klantenbestand & CRM-Database",
    clientsPageSub: "Volledig register van organisatoren, reservatiegeschiedenis, loyaliteit en contacten",
    crmUniqueClients: "Geregistreerde Unieke Klanten",
    crmCorporateAccounts: "Bedrijfsaccounts (B2B)",
    crmTotalRevenue: "Cumulatieve Omzet (LTV)",
    crmRepeatClients: "Vaste Klanten (2+ Bezoeken)",
    crmAvgBasket: "Gemiddelde Besteding per Klant",
    crmSearchPlaceholder: "Zoeken op naam, telefoon, e-mail, bedrijf of btw...",
    crmIndividuals: "Particulieren",
    crmCorporate: "Bedrijven B2B",
    crmVip: "VIP Vaste Klanten",
    crmColClient: "Klant / Contactpersoon",
    crmColContact: "Telefoon & E-mail",
    crmColTax: "Type & Kinderen / BTW",
    crmColVisits: "Bezoeken",
    crmColLastDate: "Laatste Datum",
    crmColLtv: "Totaal Besteed (LTV)",
    crmColActions: "CRM Acties",
    crmNoChildren: "Geen kind gekoppeld",
    crmNotSpecified: "Niet opgegeven",
    crmBookingsCount: "{count} dossier(s)",
    viewOrder: "Bestelling in detail bekijken",
    importAmeliaBtn: "Amelia CSV Importeren",
    ameliaModalTitle: "Amelia Klanten Importeren (WordPress)",
    ameliaModalSub: "Sleep de Amelia CSV-export hierheen of plak de ruwe data",
    ameliaDropTitle: "Sleep het Amelia CSV-bestand hierheen",
    ameliaDropSub: "Compatibel met WordPress Amelia export (WordPress -> Amelia -> Customers -> Export)",
    orderTicketLabel: "BESTELLING",
    presenceConfirmedByParent: "Aanwezigheid & Teams bevestigd door de ouder",
    awaitingClientValidation: "In afwachting van klantbevestiging (Online portaal)",
    copyClientLink: "Klantlink kopiëren",
    openClientPortal: "Klantportaal openen",
    clientLinkCopied: "Klantlink gekopieerd!",
    detailsOrderPhotos: "Besteldetails & Extras (Foto's)",
    servicesCount: "diensten",

    embedHubTitle: "Integratiehub: REST API & Webhooks",
    embedHubSub: "Verbind Laser Magic in realtime met kassasystemen (POS), touchkiosken, Zapier, Make of uw Webflow-site",
    subtabWebhooks: "Uitgaande Webhooks (POS & Apps)",
    subtabApi: "REST API & Sleutels",
    subtabWidget: "Webflow Iframe Widget",
    subtabCommunications: "E-mail & WhatsApp Gateways",
    commHubTitle: "Communicatiegateways: E-mail & WhatsApp",
    commHubSub: "Configureer uw live providers (Resend, SendGrid, Meta WhatsApp Cloud API, Twilio, Webhooks) en volg alle leveringen op",
    commEmailTitle: "Configuratie E-mail Gateway",
    commWaTitle: "Configuratie WhatsApp Gateway",
    commLogsTitle: "Globaal Communicatie- & Leveringslogboek",
    btnTestEmail: "Test E-mail Verzenden",
    btnTestWa: "Test WhatsApp Verzenden",
    btnSaveComm: "Instellingen Opslaan",

    // Timeline
    timelineTitle: "Operationele Planning van Arena's & Zalen",
    timelineSubtitle: "Live tijdslots voor arena Jungle, Prison, Minigolf en verjaardagstafels",
    arenaJungle: "Arena 1 · Jungle (Max 22)",
    arenaPrison: "Arena 2 · Prison (Max 22)",
    arenaCombined: "Gekoppelde Modus (44 spelers)",
    facilityMinigolf: "Outdoor Minigolf (12 holes)",
    facilityKaraoke: "Karaoke Lounge",
    tablesArea: "Verjaardagstafels (T1 - T8)",

    // Group Sheet / Kitchen
    kitchenTitle: "Onthaalfiche & Keukenvoorbereiding",
    kitchenSubtitle: "Overzicht van snacks, taartbestellingen, allergieën en teamsamenstelling",
    foodDonuts: "Mini Donuts (stuks)",
    foodFriesFricadelle: "Porties Friet & Frikandel",
    foodVipMeals: "VIP Menu's (Kip tenders + Friet + IJsje)",
    foodCakes: "Bestelde chocoladetaarten",
    foodArcadeTokens: "Arcade munten uit te delen",
    foodChampagne: "Flessen Kinderchampagne (VIP)",
    dietaryNotes: "Allergieën / Diëten",
    teamComposition: "Teamsamenstelling",
    teamRed: "Rood Team",
    teamBlue: "Blauw Team",

    // Widget Steps
    step1Title: "Formule",
    step1Desc: "Kies uw activiteit",
    step2Title: "Datum & Uur",
    step2Desc: "Beschikbare tijdsloten",
    step3Title: "Opties & Extra's",
    step3Desc: "Personaliseer het feest",
    step4Title: "Gegevens",
    step4Desc: "Bevestiging & Voorschot",

    // Package types
    categoryBirthdays: "Kinderfeestjes (7-15 jaar)",
    categoryStandard: "Standaard Lasergame Partijen",
    categoryCorporate: "Teambuilding & Groepen",

    // Packages
    sweetTitle: "Formule Sweet",
    sweetPrice: "24",
    sweetTag: "Het zoete feest",
    sweetDuration: "2 uur",
    sweetFeatures: [
      "2 lasergame rondes (of 1 Laser + 1 Minigolf)",
      "Assortiment mini donuts",
      "1 frisdrank naar keuze per kind",
      "Feestelijke animatie: muziek & feestvuurwerk",
      "1 arcade munt per kind",
      "1 cadeaubon voor elk kind"
    ],

    funTitle: "Formule Fun",
    funPrice: "26",
    funTag: "Warme hartige snack",
    funDuration: "2 uur",
    funFeatures: [
      "2 lasergame rondes (of 1 Laser + 1 Minigolf)",
      "Portie friet & frikandel met ketchup",
      "1 frisdrank naar keuze per kind",
      "Feestelijke animatie: muziek & feestvuurwerk",
      "1 arcade munt per kind",
      "1 cadeaubon voor elk kind"
    ],

    vipTitle: "Formule VIP",
    vipPrice: "28",
    vipTag: "Volledige maaltijd + 1 uur extra",
    vipDuration: "3 uur",
    vipBadge: "Meest Gekozen",
    vipFeatures: [
      "VIP Onthaal: alcoholvrije kinderchampagne, chips & popcorn",
      "Warm menu: friet + knapperige kip tenders + 1 ijsje",
      "2 lasergame rondes (of 1 Laser + 1 Minigolf)",
      "Feestelijke animatie: muziek & feestvuurwerk",
      "1 arcade munt per kind",
      "1 cadeaubon voor elk kind"
    ],

    standard1Title: "1 Ronde Ontdekking",
    standard1Price: "12",
    standard1Duration: "30 min (15 min spel)",
    standard1Features: ["1 sessie in de arena", "Tactische briefing & uitrusting", "Individueel scoreblad"],

    standard2Title: "2 Rondes Actie",
    standard2Price: "22",
    standard2Duration: "1 uur",
    standard2Badge: "Aanbevolen",
    standard2Features: ["2 intense sessies", "Verandering van arena (Jungle & Prison)", "Scoreblad"],

    standard3Title: "3 Rondes Marathon",
    standard3Price: "30",
    standard3Duration: "1u30",
    standard3Features: ["3 complete sessies", "Geavanceerde tactieken", "Pauze tussen de matchen"],

    // Addons
    addonsTitle: "Personaliseer uw evenement:",
    addonsSubtitle: "Aanvullende opties en activiteiten met realtime berekening",
    addonLaserGame: "Extra lasergame sessie",
    addonLaserGameSub: "Extra sessie van 15/20 min in de fluo arena Jungle / Prison",
    addonLaserGamePrice: "+7 € / pers.",
    addonMiniGolf: "Extra minigolf sessie",
    addonMiniGolfSub: "12-holes outdoor parcours (bij mooi weer)",
    addonMiniGolfPrice: "+7 € / pers.",
    addonCake: "Ambachtelijke chocoladetaart met kaarsjes",
    addonCakeSub: "Ambachtelijke taart met feestelijke vuurwerkfontein en kaarsjes",
    addonCakePrice: "+6 € / pers.",
    addonCastle: "Springkasteel & Avonturenparcours",
    addonCastleSub: "Groot springkasteel en hindernissenparcours (bij mooi weer)",
    addonCastlePrice: "+2 € / pers.",
    addonArcade: "Extra arcade munten",
    addonArcadeSub: "Voor flipperkasten, retro arcades en racesimulators",
    addonArcadePrice: "2 € / munt",
    addonDrinks: "Extra frisdrank / Softs",
    addonDrinksSub: "1 frisdrank naar keuze of verfrissende kan voor de groep",
    addonDrinksPrice: "+3,20 € / pers.",
    tagLaserArena: "Fluo Arena",
    tagOutdoor: "Buitenlucht",
    tagGourmet: "Lekkernij",
    tagFun: "Avontuur",
    tagArcade: "Arcade Zaal",
    tagBar: "Bar & Lounge",
    totalForPlayers: "voor {count} spelers",
    tokensSelected: "{count} munt(en) gekozen",
    categoryGames: "Lasergame Sessies (min. 10 pers.)",
    categoryQuick: "Snelle Formule Vrijgezellen / Vrienden",
    categoryDinner: "Diner Laser & Avond",

    // Step 2 Calendar
    selectDate: "1. Kies uw datum",
    selectTime: "2. Kies uw tijdslot",
    minPlayersNotice: "Minimum vereist: 8 kinderen (facturatietolerantie van toepassing)",
    slotsAvailable: "plaatsen beschikbaar",
    slotFull: "Volzet",
    calendarDaysHeader: ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"],

    // Step 3 Customization
    playersCountLabel: "Aantal deelnemers:",
    childrenAgeLabel: "Gevierde leeftijd (of leeftijdscategorie):",
    childCelebratedName: "Voornaam van de jarige:",
    guestNotice: "Geef een zo nauwkeurig mogelijke schatting. Aanpasbaar tot op de dag zelf volgens de voorwaarden.",

    // Step 4 Form & Checkout
    organizerName: "Naam en Voornaam van de organisator",
    organizerEmail: "E-mailadres (voor onmiddellijke bevestiging)",
    organizerPhone: "Telefoonnummer (Belgisch of internationaal formaat)",
    specialNotes: "Speciale opmerkingen, voedselallergieën, diëten",
    playersUnit: "pers.",
    orderSummary: "Overzicht van de reservering",
    depositToPayNow: "Online voorschot (30%)",
    balanceDueOnSite: "Resterend saldo ter plaatse te betalen",
    totalAmount: "Geschat Totaalbedrag",
    payDepositCard: "Voorschot betalen via Veilige Kaartbetaling (Stripe)",
    payOnSiteOption: "Bevestigen zonder voorschot (Volledig ter plaatse betalen)",
    payBancontact: "Bancontact (Payconiq app / Kaart)",
    payPayconiq: "Payconiq by Bancontact (Mobiele QR-code)",
    payStripeCard: "Kredietkaart (Visa / Mastercard)",
    depositChoice30: "Voorschot van 30% nu (Aanbevolen)",
    depositChoice100: "100% volledige betaling",
    depositChoiceOnsite: "100% betaling ter plaatse op de dag zelf",
    termsAgree: "Ik ga akkoord met de reserveringsvoorwaarden (kosteloos annuleren tot 72u voor het evenement).",
    completeBookingBtn: "Mijn reservering onmiddellijk afronden",

    // Success Screen
    bookingSuccessTitle: "Reservering succesvol bevestigd!",
    bookingRef: "Dossiernummer:",
    successMsg: "Uw tijdslot is onmiddellijk geblokkeerd in onze planning. U ontvangt dadelijk een bevestigingsmail.",
    btnWhatsAppRecap: "Open mijn WhatsApp overzicht",
    btnClientPortal: "Naar mijn klantenpagina & aanwezigheid",
    btnPreviewEmail: "Voorbeeld van mijn bevestigingsmail",
    btnAddToCalendar: "Toevoegen aan agenda (.ics)",
    btnDownloadInvitations: "Uitnodigingskaarten downloaden",
    btnNewBooking: "Nog een reservering maken",

    // Iframe Embed instructions
    embedTitle: "Iframe Integratie op Webflow (lasermagic.be)",
    embedSubtitle: "Kopieer en plak dit HTML-blok eenvoudigweg in uw Webflow-pagina om de oude Amelia widget te vervangen.",
    copyCodeBtn: "Integratiecode kopiëren",
    codeCopied: "Code gekopieerd naar klembord!"
  },

  en: {
    // Brand & General
    brandName: "Laser Magic",
    locationTag: "Vilvoorde · 15 min from Brussels",
    currency: "€",
    perChild: "/child",
    perPerson: "/person",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    confirm: "Confirm",
    selectService: "Select this package",
    delete: "Delete",
    edit: "Edit",
    search: "Search...",
    filter: "Filter",
    all: "All",
    today: "Today",
    tomorrow: "Tomorrow",
    thisWeekend: "This Weekend",
    status: "Status",
    actions: "Actions",
    print: "Print Group Sheet",
    export: "Export CSV",

    // Statuses
    statusPending: "Pending Approval",
    statusConfirmed: "Confirmed",
    statusInProgress: "In Progress",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",

    // Back-office Navigation & Sidebar
    sidebarNavMain: "MAIN NAVIGATION",
    sidebarNavIntegrations: "INTEGRATIONS & API",
    sidebarLocationTag: "Laser Magic · Vilvoorde (Brussels)",
    navDashboard: "Dashboard",
    navTimeline: "Arenas & Tables Timeline",
    navBookings: "Bookings",
    navReports: "Reports & Stats",
    navClients: "Clients Database (CRM)",
    navKitchen: "Kitchen & Reception Sheet",
    navCapacity: "Capacity & Arenas",
    navEmbed: "Integrations & API",
    newBookingBtn: "New Booking",
    exportExcel: "Export Excel",
    liveArenas: "2 Active Arenas",
    themeModeLight: "Light Mode",
    themeModeDark: "Dark Mode",
    capacityBadge: "Max Capacity: 44 Players",

    // Topbar Dynamic Titles & Subtitles
    topbarReportsTitle: "Dashboard",
    topbarReportsSub: "Real-time indicators, arena attendance and revenue distribution",
    topbarClientsTitle: "Clients Database & CRM",
    topbarClientsSub: "Comprehensive database of private and corporate (B2B) clients",
    topbarTimelineTitle: "Arenas & Tables Timeline",
    topbarTimelineSub: "Real-time supervision of game slots and birthday party tables",
    topbarBookingsTitle: "Bookings Management",
    topbarBookingsSub: "All real-time orders, cash register slips, payments and validation",
    topbarKitchenTitle: "Kitchen & Reception Sheet",
    topbarKitchenSub: "Snack preparation, birthday cakes and table sheets",
    topbarEmbedTitle: "Integrations & API Webhooks",
    topbarEmbedSub: "Synchronization hub with POS registers, real-time Webhooks and Webflow widget",

    // Stats / KPI Cards
    statTodayBookings: "Today's Bookings",
    statTotalBookings: "Total Bookings",
    statWeekendBookings: "Weekend Bookings",
    statMonthBookings: "Monthly Bookings",
    statTotalPlayers: "Expected Players",
    statRevenueToday: "Revenue",
    statPendingApprovals: "Pending Approvals",
    statArenasJunglePrison: "Jungle & Prison Arenas",
    allArenasVilvoorde: "All arenas · Vilvoorde",
    todayArenasSub: "Today · 2 Arenas",
    weekendArenasSub: "Saturday & Sunday · 2 Arenas",
    monthArenasSub: "Current month · 2 Arenas",
    allValidated: "All bookings validated",
    avgPlayersPerBooking: "{avg} players / booking (avg)",
    kpiDepositsLabel: "Deposits",
    kpiBalanceLabel: "Balance",
    kpiPendingSub: "Pending email validation",

    // Bookings Table & Filters
    searchBookingsPlaceholder: "Search by name, phone, ref...",
    colSelect: "Select",
    colOrder: "Order #",
    colDateTime: "Date & Time",
    colPackage: "Package & Celebrant",
    colClient: "Client / Organizer",
    colStatus: "Status",
    colTotal: "Total & Balance",
    colActions: "Actions",

    // Bulk actions
    selectedCountSingular: "selected",
    selectedCountPlural: "selected",
    deselectAll: "Deselect all",
    bulkConfirm: "Validate / Confirm",
    exportSelection: "Export selection",
    deleteSelection: "Delete selection",

    // Table rows & badges
    validated: "Confirmed",
    pendingValidation: "Pending",
    paidInFull: "Paid",
    balanceDuePrefix: "Balance:",
    emptyBookings: "No bookings found matching these criteria.",
    tooltipCoupon: "Birthday Campaign: -15% Voucher",
    tooltipWhatsApp: "Contact via WhatsApp",
    tooltipEmail: "Preview & Resend Email",
    tooltipCopyLink: "Copy client magic link",
    tooltipPayBalance: "Collect remaining balance",
    tooltipViewBooking: "View full booking details",

    // Pagination Footer
    rowsPerPage: "Rows per page:",
    showingRange: "Showing {start} to {end} of {total}",
    totalRecords: "Total records:",
    totalRevenue: "Total revenue:",
    totalBalances: "Total balance:",
    pagePrev: "Previous page",
    pageNext: "Next page",

    // Reports View
    reportsTitle: "Dashboard & Analytics Reports",
    reportsSub: "Real-time indicators, arena attendance and package distribution of Laser Magic",
    periodAll: "All",
    periodToday: "Today",
    periodWeekend: "This Weekend",
    periodMonth: "This Month",
    exportReport: "Export Report",
    bookingStatusTitle: "Booking Status Breakdown",
    bookingStatusRate: "Rate:",
    centerReservationsLabel: "BOOKINGS",
    packageBreakdownTitle: "Package Breakdown",
    extrasSalesTitle: "Add-ons & Extras Sales",
    financialSummaryTitle: "Financial Summary & Payments",
    depositsCollected: "Deposits collected",
    balancesRemaining: "Remaining balances on-site",
    avgPerBooking: "Avg basket / booking",
    avgPerPlayer: "Avg spend / player",

    // Quick Booking Modal
    qbModalTitle: "New Phone Booking",
    qbModalSub: "Fast booking capture by phone or at reception desk",
    qbSectionContact: "Contact & Organizer",
    qbLabelClientName: "Client name",
    qbLabelPhone: "Mobile phone",
    qbLabelEmail: "Email (for confirmation & voucher)",
    qbLabelLang: "Client language",
    qbLabelChildName: "Celebrated child's first name",
    qbLabelChildDob: "Date of birth",
    qbCouponTag: "Coupon -15% in 1 year",
    qbSectionDateTime: "Date, Time Slot & Players",
    qbLabelDate: "Date",
    qbLabelSlot: "Time slot",
    qbLabelPlayers: "Players",
    qbSectionPackage: "Package & Preferences",
    qbLabelPackage: "Selected package",
    qbLabelNotes: "Special Notes & Preferences",
    qbPriceEstimate: "Booking Estimate",
    qbPriceOnsiteNote: "Payment on arrival on event day",
    qbSubmitBtn: "Confirm phone booking",

    // Corporate & B2B Team Building
    bookingType: "Booking Type",
    typeIndividual: "Individual / Birthday",
    typeCorporate: "Corporate / Team Building (B2B)",
    companyName: "Company Name",
    companySearchPlaceholder: "Search company name or VAT (e.g. Deloitte, Solvay, ASML...)",
    vatNumber: "Intra-community VAT Number (BE / NL / EU)",
    vatLookupBtn: "Check VIES",
    vatValid: "EU VIES Valid VAT",
    vatChecking: "Checking VIES...",
    vatInvalid: "Invalid VAT number",
    billingAddress: "Billing Address (Google Maps)",
    addressPlaceholder: "Street, Nr, Postal Code, City, Country...",
    contactRole: "Contact Person Role / Title",
    poNumber: "Purchase Order (PO / Ref)",
    corporateNotice: "B2B invoicing compliant with Belgian (BCE / CBE) and EU (VIES) regulations.",

    // Bar POS & Consommations
    barPosTitle: "Bar Consumptions & POS",
    barPosSub: "Select drinks and snacks onto table tab",
    openBarPosBtn: "Bar Tab / Consumptions",
    barTabOrdersTitle: "Bar Tab & Consumptions",
    barTotalLabel: "Total Bar Tab",
    allCategories: "All Products",
    drinksSoft: "Soft Drinks & Water",
    drinksAlcohol: "Beers & Ciders",
    foodSnacks: "Snacks & Food",
    foodSweets: "Sweets & Ice Cream",
    extrasGames: "Extras & Games",
    addToTabBtn: "Add to tab (Pay on departure)",
    payDirectBtn: "Pay immediately",
    settleTabBtn: "Settle table tab",
    orderAddedToTab: "Consumptions added to tab!",
    orderSettled: "Tab settled successfully!",

    checklistTitle: "Operations Checklist",
    checklistJungle: "Check vests and blasters (Jungle Arena)",
    checklistPrison: "Check vests and blasters (Prison Arena)",
    checklistDrinks: "Prepare pitchers of water and soft drinks at temperature",
    checklistSmoke: "Turn on fog machine and briefing sound system",
    checklistTeams: "Distribute team rosters to parents",
    topbarClientPortal: "Client Portal (Live)",
    sidebarClientPortal: "Client Portal (Live)",
    kpiSubRevenue: "Deposits + On-site Balances",
    kitchenBarPosBtn: "Bar POS & Pizzas (Tab Simulator)",
    noGroupsToday: "No groups scheduled for this day.",
    colResource: "Resource / Arena",
    snack: "Snack",
    rowClickDetails: "Click to open booking details #{id}",
    dailyOrderNumber: "Daily order number",
    emptyKitchenDay: "No groups scheduled for this day.",
    birthdayOf: "Birthday of",
    yearsOld: "years old",
    printTableSheet: "Print table sheet",
    menuLabel: "Menu",
    snackLabel: "Snack",
    cakeLabel: "Cake",
    arcadeTokensLabel: "Arcade Tokens",
    allergiesNotesLabel: "Allergies / Notes",
    notIncluded: "Not included",
    chocolateCake: "Chocolate cake",
    tokensUnit: "tokens",
    kidsCount: "kids",
    clientsPageTitle: "Client Directory & CRM Database",
    clientsPageSub: "Complete directory of organizers, booking history, customer loyalty and direct contacts",
    crmUniqueClients: "Registered Unique Clients",
    crmCorporateAccounts: "Corporate Accounts (B2B)",
    crmTotalRevenue: "Lifetime Revenue (LTV)",
    crmRepeatClients: "Repeat Clients (2+ Visits)",
    crmAvgBasket: "Average Spend per Client",
    crmSearchPlaceholder: "Search by name, phone, email, company or VAT...",
    crmIndividuals: "Private Organizers",
    crmCorporate: "Corporate B2B",
    crmVip: "VIP Loyal",
    crmColClient: "Client / Contact",
    crmColContact: "Phone & Email",
    crmColTax: "Type & Children / VAT",
    crmColVisits: "Visits",
    crmColLastDate: "Last Date",
    crmColLtv: "Total Spent (LTV)",
    crmColActions: "CRM Actions",
    crmNoChildren: "No children linked",
    crmNotSpecified: "Not specified",
    crmBookingsCount: "{count} booking(s)",
    viewOrder: "View order in details",
    importAmeliaBtn: "Import Amelia CSV",
    ameliaModalTitle: "Import Amelia Customers (WordPress)",
    ameliaModalSub: "Drag and drop Amelia CSV export or paste raw CSV data",
    ameliaDropTitle: "Drag and drop Amelia CSV file here",
    ameliaDropSub: "Compatible with native WordPress Amelia export (WordPress -> Amelia -> Customers -> Export)",
    orderTicketLabel: "ORDER",
    presenceConfirmedByParent: "Attendance & Teams confirmed by parent",
    awaitingClientValidation: "Awaiting customer confirmation (Online portal)",
    copyClientLink: "Copy customer link",
    openClientPortal: "Open customer portal",
    clientLinkCopied: "Customer link copied!",
    detailsOrderPhotos: "Order Details & Extras (Photos)",
    servicesCount: "items",

    embedHubTitle: "Integration Hub: REST API & Webhooks",
    embedHubSub: "Connect Laser Magic in real-time with POS systems, touch kiosks, Zapier, Make or your Webflow site",
    subtabWebhooks: "Outgoing Webhooks (POS & Apps)",
    subtabApi: "REST API & Keys",
    subtabWidget: "Webflow Iframe Widget",
    subtabCommunications: "Email & WhatsApp Gateways",
    commHubTitle: "Communication Gateways: Email & WhatsApp",
    commHubSub: "Configure your live providers (Resend, SendGrid, Meta WhatsApp Cloud API, Twilio, Webhooks) and monitor delivery logs",
    commEmailTitle: "Email Gateway Configuration",
    commWaTitle: "WhatsApp Gateway Configuration",
    commLogsTitle: "Global Communication & Delivery Log",
    btnTestEmail: "Send Test Email",
    btnTestWa: "Send Test WhatsApp",
    btnSaveComm: "Save Gateway Settings",

    // Timeline
    timelineTitle: "Live Operational Arena & Room Schedule",
    timelineSubtitle: "Real-time timeline across Jungle arena, Prison arena, Minigolf and Birthday party tables",
    arenaJungle: "Arena 1 · Jungle (Max 22)",
    arenaPrison: "Arena 2 · Prison (Max 22)",
    arenaCombined: "Linked Arena Mode (44 players)",
    facilityMinigolf: "Outdoor Minigolf (12 holes)",
    facilityKaraoke: "Karaoke Lounge",
    tablesArea: "Birthday Party Tables (T1 - T8)",

    // Group Sheet / Kitchen
    kitchenTitle: "Reception Briefing & Food Prep Sheet",
    kitchenSubtitle: "Aggregated snacks, cake orders, allergy alerts, and team rosters",
    foodDonuts: "Mini Donuts (Units)",
    foodFriesFricadelle: "Fries & Fricadelle Servings",
    foodVipMeals: "VIP Meals (Chicken Tenders + Fries + Ice Cream)",
    foodCakes: "Birthday Chocolate Cakes",
    foodArcadeTokens: "Arcade Tokens to Issue",
    foodChampagne: "Bottles of Kid Champagne (VIP)",
    dietaryNotes: "Allergies / Special Diets",
    teamComposition: "Team Rosters",
    teamRed: "Red Team",
    teamBlue: "Blue Team",

    // Widget Steps
    step1Title: "Package",
    step1Desc: "Choose your experience",
    step2Title: "Date & Time",
    step2Desc: "Live available slots",
    step3Title: "Options & Extras",
    step3Desc: "Customize your party",
    step4Title: "Contact Details",
    step4Desc: "Confirmation & Deposit",

    // Package types
    categoryBirthdays: "Kids Birthday Parties (7-15 y/o)",
    categoryStandard: "Standard Laser Game Games",
    categoryCorporate: "Team Building & Corporate",

    // Packages
    sweetTitle: "Sweet Package",
    sweetPrice: "24",
    sweetTag: "The Sweet Celebration",
    sweetDuration: "2 hours",
    sweetFeatures: [
      "2 laser game rounds (or 1 Laser + 1 Minigolf)",
      "Delicious mini donuts selection",
      "1 soft drink of choice per child",
      "Birthday animation: music & sparklers",
      "1 arcade token per child",
      "1 return gift voucher for each child"
    ],

    funTitle: "Fun Package",
    funPrice: "26",
    funTag: "Hot Savory Snack",
    funDuration: "2 hours",
    funFeatures: [
      "2 laser game rounds (or 1 Laser + 1 Minigolf)",
      "Fries & fricadelle portion with ketchup",
      "1 soft drink of choice per child",
      "Birthday animation: music & sparklers",
      "1 arcade token per child",
      "1 return gift voucher for each child"
    ],

    vipTitle: "VIP Package",
    vipPrice: "28",
    vipTag: "Full meal + 1 extra hour",
    vipDuration: "3 hours",
    vipBadge: "Most Popular",
    vipFeatures: [
      "VIP Welcome: alcohol-free champagne, chips & popcorn",
      "Hot meal: fries + crispy chicken tenders + 1 ice cream",
      "2 laser game rounds (or 1 Laser + 1 Minigolf)",
      "Birthday animation: music & sparklers",
      "1 arcade token per child",
      "1 return gift voucher for each child"
    ],

    standard1Title: "1 Discovery Round",
    standard1Price: "12",
    standard1Duration: "30 min (15 min game)",
    standard1Features: ["1 arena match", "Tactical briefing & vest fitting", "Individual score sheets"],

    standard2Title: "2 Action Rounds",
    standard2Price: "22",
    standard2Duration: "1 hour",
    standard2Badge: "Recommended",
    standard2Features: ["2 intense matches", "Arena switch (Jungle & Prison)", "Score sheets"],

    standard3Title: "3 Marathon Rounds",
    standard3Price: "30",
    standard3Duration: "1h30",
    standard3Features: ["3 full matches", "Advanced tactical scenarios", "Break between games"],

    // Addons
    addonsTitle: "Customize your event:",
    addonsSubtitle: "Add-on activities and extras with real-time price calculations",
    addonLaserGame: "Additional laser game session",
    addonLaserGameSub: "Extra 15/20 min match in the fluorescent Jungle / Prison arena",
    addonLaserGamePrice: "+7 € / pers.",
    addonMiniGolf: "Additional mini golf game",
    addonMiniGolfSub: "12-hole outdoor landscaped minigolf (weather permitting)",
    addonMiniGolfPrice: "+7 € / pers.",
    addonCake: "Homemade chocolate birthday cake",
    addonCakeSub: "Artisanal cake with sparklers & celebratory candles",
    addonCakePrice: "+6 € / pers.",
    addonCastle: "Bouncy castle & Outdoor course",
    addonCastleSub: "Giant inflatable bouncy castle and obstacle course (weather permitting)",
    addonCastlePrice: "+2 € / pers.",
    addonArcade: "Vintage arcade tokens",
    addonArcadeSub: "Tokens for pinball, retro arcade cabinets and racing simulators",
    addonArcadePrice: "2 € / token",
    addonDrinks: "Additional soft drinks",
    addonDrinksSub: "1 cold drink of choice or refreshing pitcher for the group",
    addonDrinksPrice: "+3.20 € / pers.",
    tagLaserArena: "Neon Arena",
    tagOutdoor: "Outdoor",
    tagGourmet: "Sweet Treat",
    tagFun: "Adventure",
    tagArcade: "Arcade Room",
    tagBar: "Bar & Lounge",
    totalForPlayers: "for {count} players",
    tokensSelected: "{count} token(s) selected",
    categoryGames: "Laser Games (min. 10 pers.)",
    categoryQuick: "Flash Formula EVG / Friends",
    categoryDinner: "Laser & Evening Dinner",

    // Step 2 Calendar
    selectDate: "1. Select your date",
    selectTime: "2. Select your time slot",
    minPlayersNotice: "Minimum requirement: 8 children (billing tolerance applies)",
    slotsAvailable: "spots remaining",
    slotFull: "Fully Booked",
    calendarDaysHeader: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

    // Step 3 Customization
    playersCountLabel: "Number of participants:",
    childrenAgeLabel: "Age celebrated (or age group):",
    childCelebratedName: "Birthday child's first name:",
    guestNotice: "Provide your best estimate. Adjustable until the day of event as per center terms.",

    // Step 4 Form & Checkout
    organizerName: "Organizer's Full Name",
    organizerEmail: "Email address (for immediate confirmation)",
    organizerPhone: "Mobile phone number (Belgian or intl format)",
    specialNotes: "Special notes, food allergies, dietary restrictions",
    playersUnit: "guests",
    orderSummary: "Booking Summary",
    depositToPayNow: "Online Deposit (30%)",
    balanceDueOnSite: "Balance due on-site on event day",
    totalAmount: "Estimated Total",
    payDepositCard: "Pay Deposit via Secure Card (Stripe)",
    payOnSiteOption: "Confirm without deposit (Pay full amount on-site)",
    payBancontact: "Bancontact (Payconiq app / Card)",
    payPayconiq: "Payconiq by Bancontact (Mobile QR Code)",
    payStripeCard: "Credit Card (Visa / Mastercard)",
    depositChoice30: "30% Deposit Now (Recommended)",
    depositChoice100: "100% Full Payment Now",
    depositChoiceOnsite: "100% Payment on arrival",
    termsAgree: "I accept the booking terms & conditions (free cancellation up to 72 hours prior to the event).",
    completeBookingBtn: "Confirm My Instant Booking",

    // Success Screen
    bookingSuccessTitle: "Booking Confirmed Successfully!",
    bookingRef: "Booking Reference:",
    successMsg: "Your slot has been immediately secured in our live arena schedule. A confirmation email has been dispatched.",
    btnWhatsAppRecap: "Open my WhatsApp summary",
    btnClientPortal: "Access my client confirmation portal",
    btnPreviewEmail: "Preview my confirmation email",
    btnAddToCalendar: "Add to Calendar (.ics)",
    btnDownloadInvitations: "Download Party Invitations",
    btnNewBooking: "Make another reservation",

    // Iframe Embed instructions
    embedTitle: "Iframe Integration on Webflow (lasermagic.be)",
    embedSubtitle: "Simply copy-paste this responsive embed snippet into Webflow to replace the old Amelia widget.",
    copyCodeBtn: "Copy Embed Snippet",
    codeCopied: "Snippet copied to clipboard!"
  }
};

let currentLang = 'fr';

export function getLang() {
  return currentLang;
}

export function setLang(lang, persistToAdmin = true) {
  if (translations[lang]) {
    currentLang = lang;
    if (typeof localStorage !== 'undefined') {
      if (persistToAdmin) {
        localStorage.setItem('laser_admin_lang', lang);
      }
      localStorage.setItem('laser_magic_lang', lang);
    }
    return true;
  }
  return false;
}

export function t(key) {
  const dict = translations[currentLang] || translations.fr;
  return dict[key] !== undefined ? dict[key] : (translations.fr[key] || key);
}

export function tFor(lang, key) {
  const dict = translations[lang] || translations.fr;
  return dict[key] !== undefined ? dict[key] : (translations.fr[key] || key);
}

export function getPackageTitle(packageId, lang = 'fr') {
  const map = {
    sweet: 'sweetTitle',
    fun: 'funTitle',
    vip: 'vipTitle',
    standard1: 'standard1Title',
    standard2: 'standard2Title',
    standard3: 'standard3Title'
  };
  const key = map[packageId];
  if (key) {
    return tFor(lang, key);
  }
  return tFor(lang, 'funTitle');
}

export function getRoundFlagSvg(lang, size = 18) {
  const l = (lang || 'fr').toLowerCase();
  const uid = 'flag_circ_' + Math.random().toString(36).substring(2, 8);
  let title = 'Français (FR)';
  let content = '';

  if (l === 'nl') {
    title = 'Nederlands (NL)';
    content = `
      <rect width="32" height="10.67" fill="#C8102E"/>
      <rect y="10.67" width="32" height="10.66" fill="#FFFFFF"/>
      <rect y="21.33" width="32" height="10.67" fill="#1E4785"/>
    `;
  } else if (l === 'en') {
    title = 'English (EN)';
    content = `
      <rect width="32" height="32" fill="#012169"/>
      <path d="M0,0 L32,32 M32,0 L0,32" stroke="#FFFFFF" stroke-width="5.5"/>
      <path d="M0,0 L32,32 M32,0 L0,32" stroke="#C8102E" stroke-width="3"/>
      <path d="M16,0 v32 M0,16 h32" stroke="#FFFFFF" stroke-width="9"/>
      <path d="M16,0 v32 M0,16 h32" stroke="#C8102E" stroke-width="5"/>
    `;
  } else {
    // Default: FR
    title = 'Français (FR)';
    content = `
      <rect width="10.67" height="32" fill="#002654"/>
      <rect x="10.67" width="10.66" height="32" fill="#FFFFFF"/>
      <rect x="21.33" width="10.67" height="32" fill="#CE1126"/>
    `;
  }

  return `<svg class="flag-icon flag-round flag-round-${l}" width="${size}" height="${size}" viewBox="0 0 32 32" style="border-radius:50%; flex-shrink:0; display:inline-block; vertical-align:middle; overflow:hidden; box-shadow:0 0 0 1.5px rgba(255,255,255,0.25), 0 1px 3px rgba(0,0,0,0.3); cursor:help;" title="${title}" aria-label="${title}"><clipPath id="${uid}"><circle cx="16" cy="16" r="16"/></clipPath><g clip-path="url(#${uid})">${content}<circle cx="16" cy="16" r="15.25" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5"/></g></svg>`;
}

export function getFlagSvg(lang, width = 15, height = 10, isRound = false) {
  if (isRound || width === height) {
    return getRoundFlagSvg(lang, width);
  }
  const l = (lang || 'fr').toLowerCase();
  if (l === 'nl') {
    return `<svg class="flag-icon flag-nl" width="${width}" height="${height}" viewBox="0 0 3 2" style="border-radius:2px; flex-shrink:0; display:inline-block; vertical-align:middle; box-shadow:0 0 0 1px rgba(255,255,255,0.2); overflow:hidden;" aria-label="Nederlands"><rect width="3" height="0.67" fill="#AE1C28"/><rect y="0.67" width="3" height="0.66" fill="#FFFFFF"/><rect y="1.33" width="3" height="0.67" fill="#21468B"/></svg>`;
  }
  if (l === 'en') {
    return `<svg class="flag-icon flag-en" width="${width}" height="${height}" viewBox="0 0 60 30" style="border-radius:2px; flex-shrink:0; display:inline-block; vertical-align:middle; box-shadow:0 0 0 1px rgba(255,255,255,0.2); overflow:hidden;" aria-label="English"><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="3"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/></svg>`;
  }
  // Default: fr
  return `<svg class="flag-icon flag-fr" width="${width}" height="${height}" viewBox="0 0 3 2" style="border-radius:2px; flex-shrink:0; display:inline-block; vertical-align:middle; box-shadow:0 0 0 1px rgba(255,255,255,0.2); overflow:hidden;" aria-label="Français"><rect width="1" height="2" fill="#002654"/><rect x="1" width="1" height="2" fill="#FFFFFF"/><rect x="2" width="1" height="2" fill="#CE1126"/></svg>`;
}

// Initialize from storage: check laser_admin_lang first, then fallback to laser_magic_lang, then 'fr'
const savedAdmin = typeof localStorage !== 'undefined' ? localStorage.getItem('laser_admin_lang') : null;
const savedGeneral = typeof localStorage !== 'undefined' ? localStorage.getItem('laser_magic_lang') : null;
const saved = savedAdmin || savedGeneral;
if (saved && translations[saved]) {
  currentLang = saved;
} else {
  currentLang = 'fr';
}

/**
 * Format monetary amount with thousands separator (.) and currency symbol (€)
 * e.g. 17202 -> "17.202 €" (or "17.202" without symbol)
 *      1724  -> "1.724 €"
 *      468   -> "468 €"
 *      0     -> "0 €"
 *      1724.5 -> "1.724,50 €"
 */
export function formatMoney(val, showSymbol = true) {
  if (val === null || val === undefined || val === '' || isNaN(val)) {
    return showSymbol ? '0\u00A0€' : '0';
  }
  const num = Number(val);
  const isInteger = Math.abs(num % 1) < 0.00001;
  const parts = (isInteger ? num.toFixed(0) : num.toFixed(2)).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatted = parts.join(',');
  return showSymbol ? `${formatted}\u00A0€` : formatted;
}

export const formatPrice = formatMoney;

