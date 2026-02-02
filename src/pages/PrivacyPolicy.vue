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
          Politique de Confidentialité
        </h1>
        <p class="text-gray-600">Dernière mise à jour : {{ lastUpdated }}</p>
      </div>

      <!-- Content -->
      <div class="bg-white rounded-2xl shadow-md p-8 md:p-12 border border-gray-100">
        <div class="prose prose-sm sm:prose-base max-w-none text-gray-700">
          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
            <p>
              Bienvenue sur Coachiles. Nous accordons une grande importance à la protection de vos
              données personnelles. Cette politique de confidentialité explique comment nous
              collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez
              notre plateforme.
            </p>
            <p>
              Coachiles est une plateforme de mise en relation entre coachs sportifs et personnes
              recherchant un accompagnement personnalisé aux Antilles.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">2. Données Collectées</h2>
            <p>Nous collectons les types de données suivants :</p>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
              2.1 Données d'identification
            </h3>
            <ul>
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone (optionnel)</li>
              <li>Photo de profil (optionnel)</li>
            </ul>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">
              2.2 Données de profil coach
            </h3>
            <ul>
              <li>Spécialités et compétences</li>
              <li>Expérience professionnelle</li>
              <li>Localisation géographique</li>
              <li>Tarifs et disponibilités</li>
              <li>Diplômes et certifications</li>
            </ul>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">2.3 Données de navigation</h3>
            <ul>
              <li>Adresse IP</li>
              <li>Type de navigateur</li>
              <li>Pages visitées</li>
              <li>Durée de visite</li>
            </ul>

            <h3 class="text-lg font-semibold text-gray-800 mt-4 mb-2">2.4 Données de paiement</h3>
            <ul>
              <li>Informations de facturation (traitées par Stripe)</li>
              <li>Historique des transactions</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">3. Utilisation des Données</h2>
            <p>Vos données sont utilisées pour :</p>
            <ul>
              <li>Créer et gérer votre compte utilisateur</li>
              <li>Permettre la mise en relation entre coachs et clients</li>
              <li>Traiter les paiements et abonnements</li>
              <li>Améliorer nos services et l'expérience utilisateur</li>
              <li>Envoyer des notifications relatives à votre compte</li>
              <li>Répondre à vos demandes de support</li>
              <li>Assurer la sécurité de la plateforme</li>
              <li>Respecter nos obligations légales</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">4. Base Légale du Traitement</h2>
            <p>Nous traitons vos données sur les bases légales suivantes :</p>
            <ul>
              <li><strong>Exécution du contrat :</strong> pour fournir nos services</li>
              <li><strong>Consentement :</strong> pour les communications marketing</li>
              <li><strong>Intérêt légitime :</strong> pour améliorer nos services</li>
              <li><strong>Obligation légale :</strong> pour respecter la réglementation</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">5. Partage des Données</h2>
            <p>Nous ne vendons jamais vos données personnelles. Nous pouvons les partager avec :</p>
            <ul>
              <li><strong>Supabase :</strong> hébergement et base de données</li>
              <li><strong>Stripe :</strong> traitement des paiements</li>
              <li><strong>Google :</strong> authentification OAuth</li>
              <li><strong>Vercel :</strong> hébergement du site</li>
            </ul>
            <p>
              Ces partenaires sont soumis à des obligations contractuelles strictes de
              confidentialité et ne peuvent utiliser vos données que pour les finalités définies.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">6. Conservation des Données</h2>
            <p>Nous conservons vos données :</p>
            <ul>
              <li>
                <strong>Données de compte :</strong> pendant la durée de votre inscription + 3 ans
                après suppression
              </li>
              <li><strong>Données de facturation :</strong> 10 ans (obligations légales)</li>
              <li><strong>Données de navigation :</strong> 13 mois maximum</li>
              <li><strong>Demandes de leads :</strong> 2 ans après la dernière interaction</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">7. Sécurité des Données</h2>
            <p>Nous mettons en œuvre des mesures de sécurité appropriées :</p>
            <ul>
              <li>Chiffrement SSL/TLS pour toutes les communications</li>
              <li>Chiffrement des données sensibles en base</li>
              <li>Authentification sécurisée (OAuth 2.0)</li>
              <li>Contrôle d'accès par rôles (RLS)</li>
              <li>Sauvegardes régulières</li>
              <li>Surveillance et audit des accès</li>
            </ul>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">8. Vos Droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> supprimer vos données</li>
              <li>
                <strong>Droit à la portabilité :</strong> recevoir vos données dans un format
                standard
              </li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à :
              <a href="mailto:privacy@coachiles.com" class="text-orange-600 hover:underline"
                >privacy@coachiles.com</a
              >
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">9. Cookies</h2>
            <p>Nous utilisons des cookies pour :</p>
            <ul>
              <li>
                <strong>Cookies essentiels :</strong> fonctionnement du site et authentification
              </li>
              <li><strong>Cookies analytiques :</strong> comprendre l'utilisation du site</li>
              <li><strong>Cookies de préférences :</strong> mémoriser vos choix</li>
            </ul>
            <p>
              Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">10. Transferts Internationaux</h2>
            <p>
              Vos données peuvent être transférées vers des serveurs situés hors de l'Union
              Européenne (notamment aux États-Unis via nos prestataires). Ces transferts sont
              encadrés par des clauses contractuelles types approuvées par la Commission Européenne.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">11. Mineurs</h2>
            <p>
              Coachiles n'est pas destiné aux personnes de moins de 16 ans. Nous ne collectons pas
              sciemment de données personnelles de mineurs. Si vous êtes parent et pensez que votre
              enfant nous a fourni des données, contactez-nous.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">12. Modifications</h2>
            <p>
              Nous pouvons modifier cette politique de confidentialité à tout moment. Les
              modifications seront publiées sur cette page avec une nouvelle date de mise à jour. En
              cas de modifications substantielles, nous vous en informerons par email.
            </p>
          </section>

          <section class="mb-8">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">13. Contact</h2>
            <p>Pour toute question relative à cette politique de confidentialité :</p>
            <ul>
              <li>
                <strong>Email :</strong>
                <a href="mailto:privacy@coachiles.com" class="text-orange-600 hover:underline"
                  >privacy@coachiles.com</a
                >
              </li>
              <li><strong>Adresse :</strong> Coachiles, Guadeloupe, France</li>
            </ul>
            <p>
              Vous pouvez également déposer une réclamation auprès de la CNIL (Commission Nationale
              de l'Informatique et des Libertés) :
              <a href="https://www.cnil.fr" target="_blank" class="text-orange-600 hover:underline"
                >www.cnil.fr</a
              >
            </p>
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
