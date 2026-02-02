<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-12">
        <router-link to="/" class="inline-block mb-8">
          <img
            src="/images/logos/logo_coachiles_color.png"
            alt="Coachiles"
            class="h-12 w-auto mx-auto"
          />
        </router-link>
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Conditions Générales d'Utilisation
        </h1>
        <p class="text-gray-600">Dernière mise à jour : {{ lastUpdated }}</p>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-2xl shadow-md p-8 md:p-12 border border-gray-100">
        <div class="prose prose-sm sm:prose-base max-w-none text-gray-700">
          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les
              modalités et conditions d'utilisation de la plateforme Coachiles, accessible à
              l'adresse
              <a href="https://coachiles.com" class="text-orange-600 hover:underline"
                >coachiles.com</a
              >.
            </p>
            <p>
              Coachiles est une plateforme de mise en relation entre des coachs sportifs
              professionnels et des personnes recherchant un accompagnement personnalisé dans les
              domaines du sport, de la santé et du bien-être aux Antilles.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">2. Acceptation des CGU</h2>
            <p>
              L'utilisation de la plateforme Coachiles implique l'acceptation pleine et entière des
              présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser notre
              service.
            </p>
            <p>
              Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications
              prendront effet dès leur publication sur le site. Il vous appartient de consulter
              régulièrement cette page.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">3. Définitions</h2>
            <ul>
              <li>
                <strong>Plateforme :</strong> le site web Coachiles et l'ensemble de ses
                fonctionnalités
              </li>
              <li><strong>Utilisateur :</strong> toute personne naviguant sur la plateforme</li>
              <li>
                <strong>Coach :</strong> professionnel inscrit proposant ses services de coaching
              </li>
              <li><strong>Client :</strong> personne recherchant un coach via la plateforme</li>
              <li><strong>Lead :</strong> demande de contact d'un client envers un coach</li>
              <li><strong>Services :</strong> prestations de coaching proposées par les coachs</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Inscription et Compte</h2>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
              4.1 Création de compte Coach
            </h3>
            <p>Pour s'inscrire en tant que coach, vous devez :</p>
            <ul>
              <li>Être majeur (18 ans minimum)</li>
              <li>Disposer d'une adresse email valide</li>
              <li>Fournir des informations exactes et à jour</li>
              <li>Exercer légalement une activité de coaching</li>
            </ul>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
              4.2 Responsabilité du compte
            </h3>
            <p>
              Vous êtes responsable de la confidentialité de vos identifiants de connexion et de
              toutes les activités effectuées depuis votre compte. En cas d'utilisation non
              autorisée, vous devez nous en informer immédiatement.
            </p>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">4.3 Suppression de compte</h3>
            <p>
              Vous pouvez demander la suppression de votre compte à tout moment depuis les
              paramètres de votre profil. La suppression entraîne la désactivation de votre profil
              public et l'anonymisation de vos données après les délais légaux de conservation.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Services de la Plateforme</h2>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">5.1 Rôle de Coachiles</h3>
            <p>
              Coachiles agit en tant qu'intermédiaire technique permettant la mise en relation entre
              coachs et clients. Coachiles n'est pas partie prenante aux contrats conclus entre les
              coachs et leurs clients.
            </p>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
              5.2 Fonctionnalités pour les coachs
            </h3>
            <ul>
              <li>Création et gestion d'un profil professionnel</li>
              <li>Publication de services et tarifs</li>
              <li>Réception de demandes de contact (leads)</li>
              <li>Gestion des avis clients</li>
              <li>Outils de suivi et statistiques</li>
            </ul>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
              5.3 Fonctionnalités pour les clients
            </h3>
            <ul>
              <li>Recherche et filtrage de coachs</li>
              <li>Consultation des profils et avis</li>
              <li>Envoi de demandes de contact</li>
              <li>Publication d'avis vérifiés</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">6. Abonnements et Tarification</h2>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">6.1 Offre gratuite</h3>
            <p>
              Les coachs bénéficient d'un compte gratuit leur permettant de recevoir jusqu'à 2 leads
              par mois et d'accéder aux fonctionnalités de base.
            </p>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">6.2 Abonnement Premium</h3>
            <p>
              L'abonnement Premium permet de recevoir un nombre illimité de leads et d'accéder à des
              fonctionnalités avancées. Le tarif et les conditions sont indiqués sur la page
              d'abonnement.
            </p>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">6.3 Paiement</h3>
            <p>
              Les paiements sont traités de manière sécurisée par Stripe. Les prix sont indiqués en
              euros TTC. Les abonnements sont renouvelés automatiquement sauf résiliation.
            </p>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">6.4 Résiliation</h3>
            <p>
              Vous pouvez résilier votre abonnement à tout moment. La résiliation prend effet à la
              fin de la période en cours. Aucun remboursement n'est effectué pour la période
              restante.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Obligations des Utilisateurs</h2>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
              7.1 Obligations des coachs
            </h3>
            <p>Les coachs s'engagent à :</p>
            <ul>
              <li>Fournir des informations exactes sur leurs qualifications et expériences</li>
              <li>Respecter la réglementation applicable à leur activité</li>
              <li>Traiter les leads avec professionnalisme et réactivité</li>
              <li>Ne pas contourner la plateforme pour éviter les frais</li>
              <li>Respecter les clients et les autres utilisateurs</li>
            </ul>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
              7.2 Obligations des clients
            </h3>
            <p>Les clients s'engagent à :</p>
            <ul>
              <li>Fournir des informations exactes dans leurs demandes</li>
              <li>Utiliser la plateforme de manière loyale</li>
              <li>Respecter les coachs et ne pas publier de faux avis</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">8. Comportements Interdits</h2>
            <p>Il est strictement interdit de :</p>
            <ul>
              <li>Usurper l'identité d'un tiers</li>
              <li>Publier du contenu illicite, diffamatoire ou offensant</li>
              <li>Harceler d'autres utilisateurs</li>
              <li>Utiliser la plateforme à des fins frauduleuses</li>
              <li>Tenter de pirater ou perturber le fonctionnement du site</li>
              <li>Collecter des données personnelles d'autres utilisateurs</li>
              <li>Utiliser des systèmes automatisés (bots, scrapers)</li>
              <li>Contourner les mesures de sécurité</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">9. Propriété Intellectuelle</h2>
            <p>
              L'ensemble des éléments de la plateforme (design, logos, textes, code source) sont la
              propriété exclusive de Coachiles et sont protégés par le droit de la propriété
              intellectuelle.
            </p>
            <p>
              Les coachs conservent la propriété intellectuelle des contenus qu'ils publient sur
              leur profil, mais accordent à Coachiles une licence non exclusive d'utilisation pour
              les besoins du service.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">10. Avis et Modération</h2>
            <p>
              Les avis publiés sur la plateforme sont modérés manuellement. Nous nous réservons le
              droit de supprimer tout avis ne respectant pas nos règles de publication :
            </p>
            <ul>
              <li>Avis non authentiques ou frauduleux</li>
              <li>Contenu diffamatoire ou injurieux</li>
              <li>Informations personnelles de tiers</li>
              <li>Contenu promotionnel ou spam</li>
            </ul>
            <p>Les coachs peuvent répondre aux avis de manière professionnelle et courtoise.</p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">11. Responsabilité</h2>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
              11.1 Limitation de responsabilité
            </h3>
            <p>
              Coachiles n'est pas responsable des relations contractuelles entre coachs et clients,
              ni de la qualité des prestations fournies par les coachs. Coachiles agit uniquement
              comme intermédiaire technique.
            </p>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
              11.2 Disponibilité du service
            </h3>
            <p>
              Nous nous efforçons d'assurer la disponibilité de la plateforme 24h/24, mais ne
              garantissons pas une disponibilité sans interruption. Des maintenances peuvent être
              nécessaires.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">12. Sanctions</h2>
            <p>En cas de non-respect des présentes CGU, Coachiles se réserve le droit de :</p>
            <ul>
              <li>Envoyer un avertissement</li>
              <li>Suspendre temporairement le compte</li>
              <li>Supprimer définitivement le compte</li>
              <li>Engager des poursuites judiciaires si nécessaire</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">13. Droit Applicable et Litiges</h2>
            <p>
              Les présentes CGU sont régies par le droit français. En cas de litige, les parties
              s'engagent à rechercher une solution amiable avant toute action judiciaire.
            </p>
            <p>
              À défaut d'accord amiable, les tribunaux de Fort-de-France seront seuls compétents.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">14. Contact</h2>
            <p>Pour toute question relative aux présentes CGU :</p>
            <ul>
              <li>
                <strong>Email :</strong>
                <a href="mailto:contact@coachiles.com" class="text-orange-600 hover:underline"
                  >contact@coachiles.com</a
                >
              </li>
              <li><strong>Adresse :</strong> Coachiles, Guadeloupe, France</li>
            </ul>
          </section>
        </div>
      </div>

      <!-- Back to home -->
      <div class="text-center mt-8">
        <router-link
          to="/"
          class="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Retour à l'accueil
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const lastUpdated = '1er février 2026'
</script>
