// Translation keys and their values for different locales
export type TranslationKey = 
  // Navigation
  | 'nav.home'
  | 'nav.services'
  | 'nav.about'
  | 'nav.pricing'
  | 'nav.contact'
  | 'nav.blog'
  | 'nav.case-studies'
  | 'nav.enterprise'
  | 'nav.ai-agents'
  | 'nav.get-quote'
  | 'nav.login'
  | 'nav.language'
  
  // Common
  | 'common.loading'
  | 'common.error'
  | 'common.success'
  | 'common.submit'
  | 'common.cancel'
  | 'common.save'
  | 'common.delete'
  | 'common.edit'
  | 'common.view'
  | 'common.download'
  | 'common.share'
  | 'common.back'
  | 'common.next'
  | 'common.previous'
  | 'common.close'
  | 'common.open'
  | 'common.read-more'
  | 'common.learn-more'
  | 'common.get-started'
  | 'common.contact-us'
  | 'common.book-demo'
  | 'common.free-consultation'
  
  // Homepage
  | 'home.hero.title'
  | 'home.hero.subtitle'
  | 'home.hero.cta'
  | 'home.services.title'
  | 'home.services.subtitle'
  | 'home.testimonials.title'
  | 'home.stats.projects'
  | 'home.stats.clients'
  | 'home.stats.satisfaction'
  | 'home.stats.countries'
  
  // Services
  | 'services.ai.title'
  | 'services.ai.description'
  | 'services.web.title'
  | 'services.web.description'
  | 'services.mobile.title'
  | 'services.mobile.description'
  | 'services.software.title'
  | 'services.software.description'
  
  // About
  | 'about.title'
  | 'about.description'
  | 'about.team.title'
  | 'about.mission.title'
  | 'about.mission.description'
  
  // Contact
  | 'contact.title'
  | 'contact.subtitle'
  | 'contact.form.name'
  | 'contact.form.email'
  | 'contact.form.company'
  | 'contact.form.message'
  | 'contact.form.submit'
  | 'contact.form.success'
  | 'contact.info.address'
  | 'contact.info.phone'
  | 'contact.info.email'
  
  // Pricing
  | 'pricing.title'
  | 'pricing.subtitle'
  | 'pricing.starter.title'
  | 'pricing.professional.title'
  | 'pricing.enterprise.title'
  | 'pricing.custom.title'
  | 'pricing.monthly'
  | 'pricing.annually'
  | 'pricing.save'
  
  // Blog
  | 'blog.title'
  | 'blog.subtitle'
  | 'blog.read-time'
  | 'blog.author'
  | 'blog.published'
  | 'blog.categories'
  | 'blog.tags'
  | 'blog.related'
  | 'blog.share'
  
  // Case Studies
  | 'case-studies.title'
  | 'case-studies.subtitle'
  | 'case-studies.client'
  | 'case-studies.industry'
  | 'case-studies.duration'
  | 'case-studies.results'
  | 'case-studies.challenge'
  | 'case-studies.solution'
  | 'case-studies.testimonial'
  
  // Footer
  | 'footer.company'
  | 'footer.services'
  | 'footer.resources'
  | 'footer.legal'
  | 'footer.newsletter.title'
  | 'footer.newsletter.description'
  | 'footer.newsletter.email'
  | 'footer.newsletter.subscribe'
  | 'footer.social.follow'
  | 'footer.copyright'
  
  // Legal
  | 'legal.privacy.title'
  | 'legal.terms.title'
  | 'legal.cookies.title'
  | 'legal.gdpr.title'
  
  // Error pages
  | 'error.404.title'
  | 'error.404.description'
  | 'error.500.title'
  | 'error.500.description'
  
  // SEO
  | 'seo.default.title'
  | 'seo.default.description';

// Translation dictionaries for each supported locale
export const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.about': 'About',
    'nav.pricing': 'Pricing',
    'nav.contact': 'Contact',
    'nav.blog': 'Blog',
    'nav.case-studies': 'Case Studies',
    'nav.enterprise': 'Enterprise',
    'nav.ai-agents': 'AI Agents',
    'nav.get-quote': 'Get Quote',
    'nav.login': 'Login',
    'nav.language': 'Language',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.download': 'Download',
    'common.share': 'Share',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.close': 'Close',
    'common.open': 'Open',
    'common.read-more': 'Read More',
    'common.learn-more': 'Learn More',
    'common.get-started': 'Get Started',
    'common.contact-us': 'Contact Us',
    'common.book-demo': 'Book Demo',
    'common.free-consultation': 'Free Consultation',
    
    // Homepage
    'home.hero.title': 'Build The Future With AI-Powered Software Development',
    'home.hero.subtitle': 'Transform your business with custom software solutions, AI integration, and digital innovation. Trusted by enterprises worldwide.',
    'home.hero.cta': 'Start Your Project',
    'home.services.title': 'Our Services',
    'home.services.subtitle': 'Comprehensive software development solutions tailored to your needs',
    'home.testimonials.title': 'What Our Clients Say',
    'home.stats.projects': 'Projects Completed',
    'home.stats.clients': 'Happy Clients',
    'home.stats.satisfaction': 'Client Satisfaction',
    'home.stats.countries': 'Countries Served',
    
    // Services
    'services.ai.title': 'AI Development',
    'services.ai.description': 'Custom AI solutions and machine learning models',
    'services.web.title': 'Web Development',
    'services.web.description': 'Modern web applications and platforms',
    'services.mobile.title': 'Mobile Development',
    'services.mobile.description': 'Native and cross-platform mobile apps',
    'services.software.title': 'Custom Software Development',
    'services.software.description': 'Tailored software solutions for your business',
    
    // About
    'about.title': 'About Zoptal',
    'about.description': 'Leading software development company specializing in AI-powered solutions',
    'about.team.title': 'Our Team',
    'about.mission.title': 'Our Mission',
    'about.mission.description': 'To empower businesses through innovative technology solutions',
    
    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'Get in touch with our team',
    'contact.form.name': 'Full Name',
    'contact.form.email': 'Email Address',
    'contact.form.company': 'Company',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Send Message',
    'contact.form.success': 'Thank you! We\'ll get back to you soon.',
    'contact.info.address': 'Address',
    'contact.info.phone': 'Phone',
    'contact.info.email': 'Email',
    
    // Pricing
    'pricing.title': 'Pricing Plans',
    'pricing.subtitle': 'Choose the perfect plan for your needs',
    'pricing.starter.title': 'Starter',
    'pricing.professional.title': 'Professional',
    'pricing.enterprise.title': 'Enterprise',
    'pricing.custom.title': 'Custom',
    'pricing.monthly': 'Monthly',
    'pricing.annually': 'Annually',
    'pricing.save': 'Save',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Latest insights and updates',
    'blog.read-time': 'min read',
    'blog.author': 'Author',
    'blog.published': 'Published',
    'blog.categories': 'Categories',
    'blog.tags': 'Tags',
    'blog.related': 'Related Posts',
    'blog.share': 'Share',
    
    // Case Studies
    'case-studies.title': 'Case Studies',
    'case-studies.subtitle': 'Real results from our client projects',
    'case-studies.client': 'Client',
    'case-studies.industry': 'Industry',
    'case-studies.duration': 'Duration',
    'case-studies.results': 'Results',
    'case-studies.challenge': 'Challenge',
    'case-studies.solution': 'Solution',
    'case-studies.testimonial': 'Testimonial',
    
    // Footer
    'footer.company': 'Company',
    'footer.services': 'Services',
    'footer.resources': 'Resources',
    'footer.legal': 'Legal',
    'footer.newsletter.title': 'Stay Updated',
    'footer.newsletter.description': 'Get the latest news and updates',
    'footer.newsletter.email': 'Your email',
    'footer.newsletter.subscribe': 'Subscribe',
    'footer.social.follow': 'Follow Us',
    'footer.copyright': '© 2024 Zoptal. All rights reserved.',
    
    // Legal
    'legal.privacy.title': 'Privacy Policy',
    'legal.terms.title': 'Terms of Service',
    'legal.cookies.title': 'Cookie Policy',
    'legal.gdpr.title': 'GDPR Compliance',
    
    // Error pages
    'error.404.title': 'Page Not Found',
    'error.404.description': 'The page you are looking for does not exist.',
    'error.500.title': 'Server Error',
    'error.500.description': 'Something went wrong on our end.',
    
    // SEO
    'seo.default.title': 'Zoptal - AI-Powered Software Development',
    'seo.default.description': 'Leading software development company specializing in AI solutions, web development, and custom software. Transform your business with cutting-edge technology.',
  },

  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.services': 'Servicios',
    'nav.about': 'Acerca de',
    'nav.pricing': 'Precios',
    'nav.contact': 'Contacto',
    'nav.blog': 'Blog',
    'nav.case-studies': 'Casos de Estudio',
    'nav.enterprise': 'Empresas',
    'nav.ai-agents': 'Agentes IA',
    'nav.get-quote': 'Cotizar',
    'nav.login': 'Iniciar Sesión',
    'nav.language': 'Idioma',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.submit': 'Enviar',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.view': 'Ver',
    'common.download': 'Descargar',
    'common.share': 'Compartir',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.previous': 'Anterior',
    'common.close': 'Cerrar',
    'common.open': 'Abrir',
    'common.read-more': 'Leer Más',
    'common.learn-more': 'Saber Más',
    'common.get-started': 'Comenzar',
    'common.contact-us': 'Contáctanos',
    'common.book-demo': 'Reservar Demo',
    'common.free-consultation': 'Consulta Gratuita',
    
    // Homepage
    'home.hero.title': 'Construye el Futuro con Desarrollo de Software Impulsado por IA',
    'home.hero.subtitle': 'Transforma tu negocio con soluciones de software personalizadas, integración de IA e innovación digital. Confiado por empresas en todo el mundo.',
    'home.hero.cta': 'Iniciar Tu Proyecto',
    'home.services.title': 'Nuestros Servicios',
    'home.services.subtitle': 'Soluciones integrales de desarrollo de software adaptadas a tus necesidades',
    'home.testimonials.title': 'Lo Que Dicen Nuestros Clientes',
    'home.stats.projects': 'Proyectos Completados',
    'home.stats.clients': 'Clientes Satisfechos',
    'home.stats.satisfaction': 'Satisfacción del Cliente',
    'home.stats.countries': 'Países Atendidos',
    
    // Services
    'services.ai.title': 'Desarrollo de IA',
    'services.ai.description': 'Soluciones de IA personalizadas y modelos de aprendizaje automático',
    'services.web.title': 'Desarrollo Web',
    'services.web.description': 'Aplicaciones web modernas y plataformas',
    'services.mobile.title': 'Desarrollo Móvil',
    'services.mobile.description': 'Aplicaciones móviles nativas y multiplataforma',
    'services.software.title': 'Software Personalizado',
    'services.software.description': 'Soluciones de software a medida para tu negocio',
    
    // About
    'about.title': 'Acerca de Zoptal',
    'about.description': 'Empresa líder en desarrollo de software especializada en soluciones impulsadas por IA',
    'about.team.title': 'Nuestro Equipo',
    'about.mission.title': 'Nuestra Misión',
    'about.mission.description': 'Empoderar a las empresas a través de soluciones tecnológicas innovadoras',
    
    // Contact
    'contact.title': 'Contáctanos',
    'contact.subtitle': 'Ponte en contacto con nuestro equipo',
    'contact.form.name': 'Nombre Completo',
    'contact.form.email': 'Correo Electrónico',
    'contact.form.company': 'Empresa',
    'contact.form.message': 'Mensaje',
    'contact.form.submit': 'Enviar Mensaje',
    'contact.form.success': '¡Gracias! Te contactaremos pronto.',
    'contact.info.address': 'Dirección',
    'contact.info.phone': 'Teléfono',
    'contact.info.email': 'Correo',
    
    // Pricing
    'pricing.title': 'Planes de Precios',
    'pricing.subtitle': 'Elige el plan perfecto para tus necesidades',
    'pricing.starter.title': 'Inicial',
    'pricing.professional.title': 'Profesional',
    'pricing.enterprise.title': 'Empresarial',
    'pricing.custom.title': 'Personalizado',
    'pricing.monthly': 'Mensual',
    'pricing.annually': 'Anual',
    'pricing.save': 'Ahorrar',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Últimas perspectivas y actualizaciones',
    'blog.read-time': 'min de lectura',
    'blog.author': 'Autor',
    'blog.published': 'Publicado',
    'blog.categories': 'Categorías',
    'blog.tags': 'Etiquetas',
    'blog.related': 'Artículos Relacionados',
    'blog.share': 'Compartir',
    
    // Case Studies
    'case-studies.title': 'Casos de Estudio',
    'case-studies.subtitle': 'Resultados reales de nuestros proyectos con clientes',
    'case-studies.client': 'Cliente',
    'case-studies.industry': 'Industria',
    'case-studies.duration': 'Duración',
    'case-studies.results': 'Resultados',
    'case-studies.challenge': 'Desafío',
    'case-studies.solution': 'Solución',
    'case-studies.testimonial': 'Testimonio',
    
    // Footer
    'footer.company': 'Empresa',
    'footer.services': 'Servicios',
    'footer.resources': 'Recursos',
    'footer.legal': 'Legal',
    'footer.newsletter.title': 'Mantente Actualizado',
    'footer.newsletter.description': 'Obtén las últimas noticias y actualizaciones',
    'footer.newsletter.email': 'Tu correo',
    'footer.newsletter.subscribe': 'Suscribirse',
    'footer.social.follow': 'Síguenos',
    'footer.copyright': '© 2024 Zoptal. Todos los derechos reservados.',
    
    // Legal
    'legal.privacy.title': 'Política de Privacidad',
    'legal.terms.title': 'Términos de Servicio',
    'legal.cookies.title': 'Política de Cookies',
    'legal.gdpr.title': 'Cumplimiento GDPR',
    
    // Error pages
    'error.404.title': 'Página No Encontrada',
    'error.404.description': 'La página que buscas no existe.',
    'error.500.title': 'Error del Servidor',
    'error.500.description': 'Algo salió mal de nuestro lado.',
    
    // SEO
    'seo.default.title': 'Zoptal - Desarrollo de Software Impulsado por IA',
    'seo.default.description': 'Empresa líder en desarrollo de software especializada en soluciones de IA, desarrollo web y software personalizado. Transforma tu negocio con tecnología de vanguardia.',
  },

  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.services': 'Services',
    'nav.about': 'À propos',
    'nav.pricing': 'Tarifs',
    'nav.contact': 'Contact',
    'nav.blog': 'Blog',
    'nav.case-studies': 'Études de Cas',
    'nav.enterprise': 'Entreprise',
    'nav.ai-agents': 'Agents IA',
    'nav.get-quote': 'Devis',
    'nav.login': 'Connexion',
    'nav.language': 'Langue',
    
    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.submit': 'Soumettre',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.view': 'Voir',
    'common.download': 'Télécharger',
    'common.share': 'Partager',
    'common.back': 'Retour',
    'common.next': 'Suivant',
    'common.previous': 'Précédent',
    'common.close': 'Fermer',
    'common.open': 'Ouvrir',
    'common.read-more': 'Lire Plus',
    'common.learn-more': 'En Savoir Plus',
    'common.get-started': 'Commencer',
    'common.contact-us': 'Nous Contacter',
    'common.book-demo': 'Réserver une Démo',
    'common.free-consultation': 'Consultation Gratuite',
    
    // Homepage
    'home.hero.title': 'Construisez l\'Avenir avec le Développement Logiciel Alimenté par l\'IA',
    'home.hero.subtitle': 'Transformez votre entreprise avec des solutions logicielles personnalisées, l\'intégration de l\'IA et l\'innovation numérique. Fait confiance par les entreprises du monde entier.',
    'home.hero.cta': 'Commencer Votre Projet',
    'home.services.title': 'Nos Services',
    'home.services.subtitle': 'Solutions complètes de développement logiciel adaptées à vos besoins',
    'home.testimonials.title': 'Ce Que Disent Nos Clients',
    'home.stats.projects': 'Projets Terminés',
    'home.stats.clients': 'Clients Satisfaits',
    'home.stats.satisfaction': 'Satisfaction Client',
    'home.stats.countries': 'Pays Servis',
    
    // Services
    'services.ai.title': 'Développement IA',
    'services.ai.description': 'Solutions IA personnalisées et modèles d\'apprentissage automatique',
    'services.web.title': 'Développement Web',
    'services.web.description': 'Applications web modernes et plateformes',
    'services.mobile.title': 'Développement Mobile',
    'services.mobile.description': 'Applications mobiles natives et multiplateformes',
    'services.software.title': 'Logiciel Personnalisé',
    'services.software.description': 'Solutions logicielles sur mesure pour votre entreprise',
    
    // About
    'about.title': 'À propos de Zoptal',
    'about.description': 'Entreprise leader en développement logiciel spécialisée dans les solutions alimentées par l\'IA',
    'about.team.title': 'Notre Équipe',
    'about.mission.title': 'Notre Mission',
    'about.mission.description': 'Autonomiser les entreprises grâce à des solutions technologiques innovantes',
    
    // Contact
    'contact.title': 'Nous Contacter',
    'contact.subtitle': 'Entrez en contact avec notre équipe',
    'contact.form.name': 'Nom Complet',
    'contact.form.email': 'Adresse Email',
    'contact.form.company': 'Entreprise',
    'contact.form.message': 'Message',
    'contact.form.submit': 'Envoyer le Message',
    'contact.form.success': 'Merci ! Nous vous recontacterons bientôt.',
    'contact.info.address': 'Adresse',
    'contact.info.phone': 'Téléphone',
    'contact.info.email': 'Email',
    
    // Pricing
    'pricing.title': 'Plans Tarifaires',
    'pricing.subtitle': 'Choisissez le plan parfait pour vos besoins',
    'pricing.starter.title': 'Débutant',
    'pricing.professional.title': 'Professionnel',
    'pricing.enterprise.title': 'Entreprise',
    'pricing.custom.title': 'Personnalisé',
    'pricing.monthly': 'Mensuel',
    'pricing.annually': 'Annuel',
    'pricing.save': 'Économiser',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Dernières perspectives et mises à jour',
    'blog.read-time': 'min de lecture',
    'blog.author': 'Auteur',
    'blog.published': 'Publié',
    'blog.categories': 'Catégories',
    'blog.tags': 'Étiquettes',
    'blog.related': 'Articles Connexes',
    'blog.share': 'Partager',
    
    // Case Studies
    'case-studies.title': 'Études de Cas',
    'case-studies.subtitle': 'Résultats réels de nos projets clients',
    'case-studies.client': 'Client',
    'case-studies.industry': 'Industrie',
    'case-studies.duration': 'Durée',
    'case-studies.results': 'Résultats',
    'case-studies.challenge': 'Défi',
    'case-studies.solution': 'Solution',
    'case-studies.testimonial': 'Témoignage',
    
    // Footer
    'footer.company': 'Entreprise',
    'footer.services': 'Services',
    'footer.resources': 'Ressources',
    'footer.legal': 'Légal',
    'footer.newsletter.title': 'Restez Informé',
    'footer.newsletter.description': 'Obtenez les dernières nouvelles et mises à jour',
    'footer.newsletter.email': 'Votre email',
    'footer.newsletter.subscribe': 'S\'abonner',
    'footer.social.follow': 'Suivez-nous',
    'footer.copyright': '© 2024 Zoptal. Tous droits réservés.',
    
    // Legal
    'legal.privacy.title': 'Politique de Confidentialité',
    'legal.terms.title': 'Conditions de Service',
    'legal.cookies.title': 'Politique des Cookies',
    'legal.gdpr.title': 'Conformité GDPR',
    
    // Error pages
    'error.404.title': 'Page Non Trouvée',
    'error.404.description': 'La page que vous recherchez n\'existe pas.',
    'error.500.title': 'Erreur Serveur',
    'error.500.description': 'Quelque chose s\'est mal passé de notre côté.',
    
    // SEO
    'seo.default.title': 'Zoptal - Développement Logiciel Alimenté par l\'IA',
    'seo.default.description': 'Entreprise leader en développement logiciel spécialisée dans les solutions IA, le développement web et les logiciels personnalisés. Transformez votre entreprise avec une technologie de pointe.',
  },

  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.services': 'Dienstleistungen',
    'nav.about': 'Über uns',
    'nav.pricing': 'Preise',
    'nav.contact': 'Kontakt',
    'nav.blog': 'Blog',
    'nav.case-studies': 'Fallstudien',
    'nav.enterprise': 'Unternehmen',
    'nav.ai-agents': 'KI-Agenten',
    'nav.get-quote': 'Angebot',
    'nav.login': 'Anmelden',
    'nav.language': 'Sprache',
    
    // Common
    'common.loading': 'Laden...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    'common.submit': 'Senden',
    'common.cancel': 'Abbrechen',
    'common.save': 'Speichern',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.view': 'Ansehen',
    'common.download': 'Herunterladen',
    'common.share': 'Teilen',
    'common.back': 'Zurück',
    'common.next': 'Weiter',
    'common.previous': 'Vorherige',
    'common.close': 'Schließen',
    'common.open': 'Öffnen',
    'common.read-more': 'Mehr Lesen',
    'common.learn-more': 'Mehr Erfahren',
    'common.get-started': 'Loslegen',
    'common.contact-us': 'Kontaktieren Sie uns',
    'common.book-demo': 'Demo Buchen',
    'common.free-consultation': 'Kostenlose Beratung',
    
    // Homepage
    'home.hero.title': 'Bauen Sie die Zukunft mit KI-gestützter Softwareentwicklung',
    'home.hero.subtitle': 'Transformieren Sie Ihr Unternehmen mit maßgeschneiderten Softwarelösungen, KI-Integration und digitaler Innovation. Vertraut von Unternehmen weltweit.',
    'home.hero.cta': 'Projekt Starten',
    'home.services.title': 'Unsere Dienstleistungen',
    'home.services.subtitle': 'Umfassende Softwareentwicklungslösungen maßgeschneidert für Ihre Bedürfnisse',
    'home.testimonials.title': 'Was Unsere Kunden Sagen',
    'home.stats.projects': 'Abgeschlossene Projekte',
    'home.stats.clients': 'Zufriedene Kunden',
    'home.stats.satisfaction': 'Kundenzufriedenheit',
    'home.stats.countries': 'Bediente Länder',
    
    // Services
    'services.ai.title': 'KI-Entwicklung',
    'services.ai.description': 'Maßgeschneiderte KI-Lösungen und maschinelle Lernmodelle',
    'services.web.title': 'Webentwicklung',
    'services.web.description': 'Moderne Webanwendungen und Plattformen',
    'services.mobile.title': 'Mobile Entwicklung',
    'services.mobile.description': 'Native und plattformübergreifende mobile Apps',
    'services.software.title': 'Individuelle Software',
    'services.software.description': 'Maßgeschneiderte Softwarelösungen für Ihr Unternehmen',
    
    // About
    'about.title': 'Über Zoptal',
    'about.description': 'Führendes Softwareentwicklungsunternehmen spezialisiert auf KI-gestützte Lösungen',
    'about.team.title': 'Unser Team',
    'about.mission.title': 'Unsere Mission',
    'about.mission.description': 'Unternehmen durch innovative Technologielösungen zu stärken',
    
    // Contact
    'contact.title': 'Kontaktieren Sie uns',
    'contact.subtitle': 'Nehmen Sie Kontakt mit unserem Team auf',
    'contact.form.name': 'Vollständiger Name',
    'contact.form.email': 'E-Mail-Adresse',
    'contact.form.company': 'Unternehmen',
    'contact.form.message': 'Nachricht',
    'contact.form.submit': 'Nachricht Senden',
    'contact.form.success': 'Danke! Wir melden uns bald bei Ihnen.',
    'contact.info.address': 'Adresse',
    'contact.info.phone': 'Telefon',
    'contact.info.email': 'E-Mail',
    
    // Pricing
    'pricing.title': 'Preispläne',
    'pricing.subtitle': 'Wählen Sie den perfekten Plan für Ihre Bedürfnisse',
    'pricing.starter.title': 'Starter',
    'pricing.professional.title': 'Professionell',
    'pricing.enterprise.title': 'Unternehmen',
    'pricing.custom.title': 'Individuell',
    'pricing.monthly': 'Monatlich',
    'pricing.annually': 'Jährlich',
    'pricing.save': 'Sparen',
    
    // Blog
    'blog.title': 'Blog',
    'blog.subtitle': 'Neueste Einblicke und Updates',
    'blog.read-time': 'Min Lesezeit',
    'blog.author': 'Autor',
    'blog.published': 'Veröffentlicht',
    'blog.categories': 'Kategorien',
    'blog.tags': 'Tags',
    'blog.related': 'Verwandte Beiträge',
    'blog.share': 'Teilen',
    
    // Case Studies
    'case-studies.title': 'Fallstudien',
    'case-studies.subtitle': 'Echte Ergebnisse aus unseren Kundenprojekten',
    'case-studies.client': 'Kunde',
    'case-studies.industry': 'Branche',
    'case-studies.duration': 'Dauer',
    'case-studies.results': 'Ergebnisse',
    'case-studies.challenge': 'Herausforderung',
    'case-studies.solution': 'Lösung',
    'case-studies.testimonial': 'Zeugnis',
    
    // Footer
    'footer.company': 'Unternehmen',
    'footer.services': 'Dienstleistungen',
    'footer.resources': 'Ressourcen',
    'footer.legal': 'Rechtliches',
    'footer.newsletter.title': 'Bleiben Sie auf dem Laufenden',
    'footer.newsletter.description': 'Erhalten Sie die neuesten Nachrichten und Updates',
    'footer.newsletter.email': 'Ihre E-Mail',
    'footer.newsletter.subscribe': 'Abonnieren',
    'footer.social.follow': 'Folgen Sie uns',
    'footer.copyright': '© 2024 Zoptal. Alle Rechte vorbehalten.',
    
    // Legal
    'legal.privacy.title': 'Datenschutz-Bestimmungen',
    'legal.terms.title': 'Nutzungsbedingungen',
    'legal.cookies.title': 'Cookie-Richtlinie',
    'legal.gdpr.title': 'DSGVO-Konformität',
    
    // Error pages
    'error.404.title': 'Seite Nicht Gefunden',
    'error.404.description': 'Die Seite, die Sie suchen, existiert nicht.',
    'error.500.title': 'Server-Fehler',
    'error.500.description': 'Etwas ist auf unserer Seite schief gelaufen.',
    
    // SEO
    'seo.default.title': 'Zoptal - KI-gestützte Softwareentwicklung',
    'seo.default.description': 'Führendes Softwareentwicklungsunternehmen spezialisiert auf KI-Lösungen, Webentwicklung und individuelle Software. Transformieren Sie Ihr Unternehmen mit modernster Technologie.',
  },

  // Add more languages (zh, ar, hi) with similar structure...
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.services': '服务',
    'nav.about': '关于我们',
    'nav.pricing': '价格',
    'nav.contact': '联系我们',
    'nav.blog': '博客',
    'nav.case-studies': '案例研究',
    'nav.enterprise': '企业',
    'nav.ai-agents': 'AI代理',
    'nav.get-quote': '获取报价',
    'nav.login': '登录',
    'nav.language': '语言',
    
    // ... (continue with all other translations in Chinese)
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    'common.submit': '提交',
    'common.cancel': '取消',
    'common.save': '保存',
    'common.delete': '删除',
    'common.edit': '编辑',
    'common.view': '查看',
    'common.download': '下载',
    'common.share': '分享',
    'common.back': '返回',
    'common.next': '下一个',
    'common.previous': '上一个',
    'common.close': '关闭',
    'common.open': '打开',
    'common.read-more': '阅读更多',
    'common.learn-more': '了解更多',
    'common.get-started': '开始',
    'common.contact-us': '联系我们',
    'common.book-demo': '预约演示',
    'common.free-consultation': '免费咨询',
    
    // Homepage
    'home.hero.title': '用AI驱动的软件开发构建未来',
    'home.hero.subtitle': '通过定制软件解决方案、AI集成和数字创新转型您的业务。全球企业信赖。',
    'home.hero.cta': '开始您的项目',
    'home.services.title': '我们的服务',
    'home.services.subtitle': '为您需求量身定制的综合软件开发解决方案',
    'home.testimonials.title': '客户评价',
    'home.stats.projects': '已完成项目',
    'home.stats.clients': '满意客户',
    'home.stats.satisfaction': '客户满意度',
    'home.stats.countries': '服务国家',
    
    // Services
    'services.ai.title': 'AI开发',
    'services.ai.description': '定制AI解决方案和机器学习模型',
    'services.web.title': '网站开发',
    'services.web.description': '现代网络应用程序和平台',
    'services.mobile.title': '移动开发',
    'services.mobile.description': '原生和跨平台移动应用',
    'services.software.title': '定制软件',
    'services.software.description': '为您的业务量身定制的软件解决方案',
    
    // Add other required translations...
    'about.title': '关于Zoptal',
    'about.description': '专注于AI驱动解决方案的领先软件开发公司',
    'about.team.title': '我们的团队',
    'about.mission.title': '我们的使命',
    'about.mission.description': '通过创新的技术解决方案赋能企业',
    
    'contact.title': '联系我们',
    'contact.subtitle': '与我们的团队取得联系',
    'contact.form.name': '全名',
    'contact.form.email': '电子邮件地址',
    'contact.form.company': '公司',
    'contact.form.message': '消息',
    'contact.form.submit': '发送消息',
    'contact.form.success': '谢谢！我们很快会联系您。',
    'contact.info.address': '地址',
    'contact.info.phone': '电话',
    'contact.info.email': '电子邮件',
    
    'pricing.title': '价格计划',
    'pricing.subtitle': '选择适合您需求的完美计划',
    'pricing.starter.title': '入门版',
    'pricing.professional.title': '专业版',
    'pricing.enterprise.title': '企业版',
    'pricing.custom.title': '定制版',
    'pricing.monthly': '月付',
    'pricing.annually': '年付',
    'pricing.save': '节省',
    
    'blog.title': '博客',
    'blog.subtitle': '最新见解和更新',
    'blog.read-time': '分钟阅读',
    'blog.author': '作者',
    'blog.published': '发布',
    'blog.categories': '分类',
    'blog.tags': '标签',
    'blog.related': '相关文章',
    'blog.share': '分享',
    
    'case-studies.title': '案例研究',
    'case-studies.subtitle': '我们客户项目的真实结果',
    'case-studies.client': '客户',
    'case-studies.industry': '行业',
    'case-studies.duration': '持续时间',
    'case-studies.results': '结果',
    'case-studies.challenge': '挑战',
    'case-studies.solution': '解决方案',
    'case-studies.testimonial': '推荐',
    
    'footer.company': '公司',
    'footer.services': '服务',
    'footer.resources': '资源',
    'footer.legal': '法律',
    'footer.newsletter.title': '保持更新',
    'footer.newsletter.description': '获得最新新闻和更新',
    'footer.newsletter.email': '您的邮箱',
    'footer.newsletter.subscribe': '订阅',
    'footer.social.follow': '关注我们',
    'footer.copyright': '© 2024 Zoptal. 版权所有。',
    
    'legal.privacy.title': '隐私政策',
    'legal.terms.title': '服务条款',
    'legal.cookies.title': 'Cookie政策',
    'legal.gdpr.title': 'GDPR合规',
    
    'error.404.title': '页面未找到',
    'error.404.description': '您查找的页面不存在。',
    'error.500.title': '服务器错误',
    'error.500.description': '我们这边出了问题。',
    
    'seo.default.title': 'Zoptal - AI驱动的软件开发',
    'seo.default.description': '专注于AI解决方案、网站开发和定制软件的领先软件开发公司。用尖端技术转型您的业务。',
  },

  // For now, provide basic structure for other languages
  ar: {} as Record<TranslationKey, string>, // Arabic translations would go here
  hi: {} as Record<TranslationKey, string>, // Hindi translations would go here
};

// Helper function to get translation
export function getTranslation(key: TranslationKey, locale: string = 'en'): string {
  return translations[locale]?.[key] || translations['en'][key] || key;
}

// Helper function to check if translation exists
export function hasTranslation(key: TranslationKey, locale: string): boolean {
  return !!(translations[locale]?.[key]);
}

// Get all available translation keys
export function getTranslationKeys(): TranslationKey[] {
  return Object.keys(translations.en) as TranslationKey[];
}

// Get completion percentage for a locale
export function getTranslationCompleteness(locale: string): number {
  if (!translations[locale]) return 0;
  
  const totalKeys = getTranslationKeys().length;
  const translatedKeys = Object.keys(translations[locale]).length;
  
  return Math.round((translatedKeys / totalKeys) * 100);
}