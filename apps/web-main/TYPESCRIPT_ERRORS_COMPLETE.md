     1. src/app/(public)/blog/[slug]/amp/seo-example.tsx(336,26): error TS2322: Type 'TransformedBlogPost' is not assignable to type 'Entry<any>'.
     2.   Property 'metadata' is missing in type 'TransformedBlogPost' but required in type 'BaseEntry'.
     3. src/app/(public)/blog/[slug]/page.tsx(124,24): error TS2322: Type 'TransformedBlogPost' is not assignable to type 'Entry<any>'.
     4.   Property 'metadata' is missing in type 'TransformedBlogPost' but required in type 'BaseEntry'.
     5. src/app/(public)/case-studies/page.tsx(145,38): error TS2322: Type '{ children: string; variant: "primary"; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
     6.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
     7. src/app/(public)/case-studies/page.tsx(225,50): error TS2322: Type '{ children: string; variant: "secondary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
     8.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
     9. src/app/(public)/case-studies/page.tsx(231,27): error TS2322: Type '{ children: string; variant: "success" | "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
    10.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
    11. src/app/(public)/legal/cookies/page.tsx(23,53): error TS2345: Argument of type '{ name: string; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    12.   Property 'items' is missing in type '{ name: string; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    13. src/app/(public)/legal/cookies/page.tsx(52,9): error TS2322: Type '{ title: string; description: string; canonicalUrl: string; keywords: string[]; type: "website"; structuredData: any[]; }' is not assignable to type 'IntrinsicAttributes & SEOHeadProps'.
    14.   Property 'structuredData' does not exist on type 'IntrinsicAttributes & SEOHeadProps'.
    15. src/app/(public)/legal/gdpr/page.tsx(24,53): error TS2345: Argument of type '{ name: string; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    16.   Property 'items' is missing in type '{ name: string; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    17. src/app/(public)/legal/gdpr/page.tsx(53,9): error TS2322: Type '{ title: string; description: string; canonicalUrl: string; keywords: string[]; type: "website"; structuredData: any[]; }' is not assignable to type 'IntrinsicAttributes & SEOHeadProps'.
    18.   Property 'structuredData' does not exist on type 'IntrinsicAttributes & SEOHeadProps'.
    19. src/app/(public)/legal/terms/page.tsx(23,53): error TS2345: Argument of type '{ name: string; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    20.   Property 'items' is missing in type '{ name: string; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    21. src/app/(public)/legal/terms/page.tsx(52,9): error TS2322: Type '{ title: string; description: string; canonicalUrl: string; keywords: string[]; type: "website"; structuredData: any[]; }' is not assignable to type 'IntrinsicAttributes & SEOHeadProps'.
    22.   Property 'structuredData' does not exist on type 'IntrinsicAttributes & SEOHeadProps'.
    23. src/app/(public)/locations/[country]/page.tsx(279,5): error TS2322: Type 'string' is not assignable to type '{ name: string; url: string; }'.
    24. src/app/(public)/locations/[country]/page.tsx(285,53): error TS2345: Argument of type '{ name: any; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    25.   Property 'items' is missing in type '{ name: any; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    26. src/app/(public)/locations/[country]/page.tsx(295,7): error TS2353: Object literal may only specify known properties, and 'country' does not exist in type '{ streetAddress: string; addressLocality: string; addressRegion: string; postalCode: string; addressCountry: string; }'.
    27. src/app/(public)/pricing/page.tsx(200,35): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
    28. src/app/(public)/pricing/page.tsx(295,23): error TS2322: Type '{ defaultChecked: true; }' is not assignable to type 'IntrinsicAttributes & SwitchProps'.
    29.   Property 'defaultChecked' does not exist on type 'IntrinsicAttributes & SwitchProps'.
    30. src/app/(public)/resources/api-reference/page.tsx(318,31): error TS2322: Type '"success" | "warning" | "primary" | "secondary" | "danger"' is not assignable to type '"success" | "error" | "default" | "warning" | "outline" | "primary" | "secondary" | undefined'.
    31.   Type '"danger"' is not assignable to type '"success" | "error" | "default" | "warning" | "outline" | "primary" | "secondary" | undefined'.
    32. src/app/(public)/resources/api-reference/page.tsx(367,46): error TS2322: Type '{ children: string[]; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
    33.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
    34. src/app/(public)/resources/documentation/page.tsx(290,48): error TS2322: Type '{ children: string; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
    35.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
    36. src/app/(public)/resources/documentation/page.tsx(332,48): error TS2322: Type '{ children: string; variant: "secondary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
    37.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
    38. src/app/(public)/resources/help-center/page.tsx(294,50): error TS2322: Type '{ children: string; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
    39.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
    40. src/app/(public)/resources/help-center/page.tsx(337,38): error TS2322: Type '{ children: Element[]; type: "single"; collapsible: true; className: string; }' is not assignable to type 'IntrinsicAttributes & AccordionProps'.
    41.   Property 'collapsible' does not exist on type 'IntrinsicAttributes & AccordionProps'.
    42. src/app/(public)/resources/page.tsx(156,38): error TS2322: Type '{ children: string; variant: "primary"; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
    43.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
    44. src/app/(public)/resources/page.tsx(208,25): error TS2322: Type '{ children: string; variant: "success" | "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
    45.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
    46. src/app/(public)/resources/page.tsx(258,25): error TS2322: Type '{ children: string; variant: "success" | "primary" | "secondary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
    47.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
    48. src/app/(public)/resources/whitepapers/page.tsx(164,50): error TS2322: Type '{ children: string; key: string; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
    49.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
    50. src/app/(public)/services/[slug]/page.tsx(100,23): error TS2322: Type 'TransformedService' is not assignable to type 'Entry<any>'.
    51.   Property 'metadata' is missing in type 'TransformedService' but required in type 'BaseEntry'.
    52. src/app/(public)/services/ai-agents-development/page.tsx(47,5): error TS2322: Type 'string' is not assignable to type '{ name: string; url: string; }'.
    53. src/app/(public)/services/ai-agents-development/page.tsx(53,53): error TS2345: Argument of type '{ name: string; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    54.   Property 'items' is missing in type '{ name: string; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    55. src/app/(public)/services/ai-development/page.tsx(20,3): error TS2353: Object literal may only specify known properties, and 'openGraph' does not exist in type 'SEOConfig'.
    56. src/app/(public)/services/custom-software-development/by-industry/[industry]/page.tsx(269,5): error TS2322: Type 'string' is not assignable to type '{ name: string; url: string; }'.
    57. src/app/(public)/services/custom-software-development/by-industry/[industry]/page.tsx(275,53): error TS2345: Argument of type '{ name: any; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    58.   Property 'items' is missing in type '{ name: any; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    59. src/app/(public)/services/custom-software-development/by-industry/[industry]/page.tsx(344,43): error TS7006: Parameter 'stat' implicitly has an 'any' type.
    60. src/app/(public)/services/custom-software-development/by-industry/[industry]/page.tsx(344,49): error TS7006: Parameter 'index' implicitly has an 'any' type.
    61. src/app/(public)/services/custom-software-development/by-industry/[industry]/page.tsx(368,41): error TS7006: Parameter 'feature' implicitly has an 'any' type.
    62. src/app/(public)/services/custom-software-development/by-industry/[industry]/page.tsx(368,50): error TS7006: Parameter 'index' implicitly has an 'any' type.
    63. src/app/(public)/services/custom-software-development/by-industry/[industry]/page.tsx(394,42): error TS7006: Parameter 'solution' implicitly has an 'any' type.
    64. src/app/(public)/services/custom-software-development/by-industry/[industry]/page.tsx(394,52): error TS7006: Parameter 'index' implicitly has an 'any' type.
    65. src/app/(public)/services/custom-software-development/by-industry/[industry]/page.tsx(399,43): error TS7006: Parameter 'benefit' implicitly has an 'any' type.
    66. src/app/(public)/services/custom-software-development/by-industry/[industry]/page.tsx(399,52): error TS7006: Parameter 'benefitIndex' implicitly has an 'any' type.
    67. src/app/(public)/services/custom-software-development/by-industry/finance/page.tsx(443,9): error TS2322: Type '{ title: string; description: string; canonicalUrl: string; keywords: string[]; type: "service"; structuredData: any[]; }' is not assignable to type 'IntrinsicAttributes & SEOHeadProps'.
    68.   Property 'structuredData' does not exist on type 'IntrinsicAttributes & SEOHeadProps'.
    69. src/app/(public)/services/custom-software-development/by-industry/healthcare/page.tsx(432,9): error TS2322: Type '{ title: string; description: string; canonicalUrl: string; keywords: string[]; type: "service"; structuredData: any[]; }' is not assignable to type 'IntrinsicAttributes & SEOHeadProps'.
    70.   Property 'structuredData' does not exist on type 'IntrinsicAttributes & SEOHeadProps'.
    71. src/app/(public)/services/custom-software-development/by-industry/retail/page.tsx(419,9): error TS2322: Type '{ title: string; description: string; canonicalUrl: string; keywords: string[]; type: "service"; structuredData: any[]; }' is not assignable to type 'IntrinsicAttributes & SEOHeadProps'.
    72.   Property 'structuredData' does not exist on type 'IntrinsicAttributes & SEOHeadProps'.
    73. src/app/(public)/services/custom-software-development/enterprise/page.tsx(364,9): error TS2322: Type '{ title: string; description: string; canonicalUrl: string; keywords: string[]; type: "service"; structuredData: any[]; }' is not assignable to type 'IntrinsicAttributes & SEOHeadProps'.
    74.   Property 'structuredData' does not exist on type 'IntrinsicAttributes & SEOHeadProps'.
    75. src/app/(public)/services/custom-software-development/startup/page.tsx(348,9): error TS2322: Type '{ title: string; description: string; canonicalUrl: string; keywords: string[]; type: "service"; structuredData: any[]; }' is not assignable to type 'IntrinsicAttributes & SEOHeadProps'.
    76.   Property 'structuredData' does not exist on type 'IntrinsicAttributes & SEOHeadProps'.
    77. src/app/(public)/services/enterprise-solutions/page.tsx(47,5): error TS2322: Type 'string' is not assignable to type '{ name: string; url: string; }'.
    78. src/app/(public)/services/enterprise-solutions/page.tsx(53,53): error TS2345: Argument of type '{ name: string; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    79.   Property 'items' is missing in type '{ name: string; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    80. src/app/(public)/services/mobile-app-development/android/page.tsx(47,5): error TS2322: Type 'string' is not assignable to type '{ name: string; url: string; }'.
    81. src/app/(public)/services/mobile-app-development/android/page.tsx(53,53): error TS2345: Argument of type '{ name: string; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    82.   Property 'items' is missing in type '{ name: string; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    83. src/app/(public)/services/mobile-app-development/cross-platform/page.tsx(47,5): error TS2322: Type 'string' is not assignable to type '{ name: string; url: string; }'.
    84. src/app/(public)/services/mobile-app-development/cross-platform/page.tsx(53,53): error TS2345: Argument of type '{ name: string; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    85.   Property 'items' is missing in type '{ name: string; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    86. src/app/(public)/services/mobile-app-development/ios/page.tsx(48,5): error TS2322: Type 'string' is not assignable to type '{ name: string; url: string; }'.
    87. src/app/(public)/services/mobile-app-development/ios/page.tsx(54,53): error TS2345: Argument of type '{ name: string; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    88.   Property 'items' is missing in type '{ name: string; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    89. src/app/(public)/services/saas-development/enterprise-saas/page.tsx(47,5): error TS2322: Type 'string' is not assignable to type '{ name: string; url: string; }'.
    90. src/app/(public)/services/saas-development/enterprise-saas/page.tsx(53,53): error TS2345: Argument of type '{ name: string; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    91.   Property 'items' is missing in type '{ name: string; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    92. src/app/(public)/services/saas-development/micro-saas/page.tsx(47,5): error TS2322: Type 'string' is not assignable to type '{ name: string; url: string; }'.
    93. src/app/(public)/services/saas-development/micro-saas/page.tsx(53,53): error TS2345: Argument of type '{ name: string; url: string; }[]' is not assignable to parameter of type 'BreadcrumbSchemaProps'.
    94.   Property 'items' is missing in type '{ name: string; url: string; }[]' but required in type 'BreadcrumbSchemaProps'.
    95. src/app/(public)/solutions/ai-agents/page.tsx(264,9): error TS2322: Type '{ title: string; description: string; canonicalUrl: string; keywords: string[]; type: "service"; structuredData: { "@context": string; "@type": string; name: string; description: string; provider: { "@type": string; name: string; }; serviceType: string; areaServed: string; }; }' is not assignable to type 'IntrinsicAttributes & SEOHeadProps'.
    96.   Property 'structuredData' does not exist on type 'IntrinsicAttributes & SEOHeadProps'.
    97. src/app/(public)/solutions/page.tsx(101,38): error TS2322: Type '{ children: string; variant: "primary"; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
    98.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
    99. src/app/(public)/solutions/page.tsx(152,25): error TS2322: Type '{ children: string; variant: "success" | "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   100.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   101. src/app/(public)/solutions/products/[category]/[product]/page.tsx(183,9): error TS2322: Type '"product"' is not assignable to type '"service" | "location" | "article" | "website" | undefined'.
   102. src/app/(public)/solutions/products/[category]/page.tsx(183,9): error TS2322: Type '{ title: string; description: string; canonicalUrl: string; keywords: any[]; type: "website"; structuredData: { "@context": string; "@type": string; name: string; description: any; url: string; mainEntity: { ...; }; }; }' is not assignable to type 'IntrinsicAttributes & SEOHeadProps'.
   103.   Property 'structuredData' does not exist on type 'IntrinsicAttributes & SEOHeadProps'.
   104. src/app/api/ai/chat/route.ts(135,30): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ services_inquiry: { message: string; confidence: number; suggestedActions: string[]; }[]; pricing_inquiry: { message: string; confidence: number; suggestedActions: string[]; }[]; project_inquiry: { ...; }[]; ... 4 more ...; general_inquiry: { ...; }[]; }'.
   105.   No index signature with a parameter of type 'string' was found on type '{ services_inquiry: { message: string; confidence: number; suggestedActions: string[]; }[]; pricing_inquiry: { message: string; confidence: number; suggestedActions: string[]; }[]; project_inquiry: { ...; }[]; ... 4 more ...; general_inquiry: { ...; }[]; }'.
   106. src/app/api/ai/chat/route.ts(136,11): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ services_inquiry: { message: string; confidence: number; suggestedActions: string[]; }[]; pricing_inquiry: { message: string; confidence: number; suggestedActions: string[]; }[]; project_inquiry: { ...; }[]; ... 4 more ...; general_inquiry: { ...; }[]; }'.
   107.   No index signature with a parameter of type 'string' was found on type '{ services_inquiry: { message: string; confidence: number; suggestedActions: string[]; }[]; pricing_inquiry: { message: string; confidence: number; suggestedActions: string[]; }[]; project_inquiry: { ...; }[]; ... 4 more ...; general_inquiry: { ...; }[]; }'.
   108. src/app/api/ai/chat/route.ts(154,13): error TS2322: Type 'string' is not assignable to type 'ChatIntent | undefined'.
   109. src/app/api/leads/contact/route.ts(176,25): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ under_10k: number; '10k_25k': number; '25k_50k': number; '50k_100k': number; '100k_plus': number; }'.
   110. src/app/api/leads/contact/route.ts(197,26): error TS7053: Element implicitly has an 'any' type because expression of type 'any' can't be used to index type '{ immediate: number; within_month: number; within_quarter: number; exploring: number; }'.
   111. src/app/api/notifications/send/route.ts(3,21): error TS7016: Could not find a declaration file for module 'web-push'. '/Users/eshancheema/Documents/RAG_Apps/Website_Zoptal/node_modules/.pnpm/web-push@3.6.7/node_modules/web-push/src/index.js' implicitly has an 'any' type.
   112.   Try `npm i --save-dev @types/web-push` if it exists or add a new declaration (.d.ts) file containing `declare module 'web-push';`
   113. src/app/api/notifications/send/route.ts(73,24): error TS2339: Property 'lastUsed' does not exist on type 'PushSubscriptionData & { id: string; tags: string[]; }'.
   114. src/app/api/notifications/send/route.ts(81,15): error TS18046: 'error' is of type 'unknown'.
   115. src/app/api/notifications/send/route.ts(81,43): error TS18046: 'error' is of type 'unknown'.
   116. src/app/api/notifications/send/route.ts(89,20): error TS18046: 'error' is of type 'unknown'.
   117. src/app/api/notifications/send/route.ts(163,78): error TS18046: 'error' is of type 'unknown'.
   118. src/app/api/notifications/subscribe/route.ts(82,23): error TS2339: Property 'lastUsed' does not exist on type 'PushSubscriptionData & { id: string; tags: string[]; }'.
   119. src/app/help/articles/[slug]/page.tsx(202,18): error TS2741: Property 'title' is missing in type '{ content: string; }' but required in type 'ArticleContentProps'.
   120. src/app/help/articles/[slug]/page.tsx(235,58): error TS2322: Type '{ key: string; article: HelpArticle; }' is not assignable to type 'IntrinsicAttributes & ArticleCardProps'.
   121.   Property 'article' does not exist on type 'IntrinsicAttributes & ArticleCardProps'.
   122. src/app/help/faq/page.tsx(89,14): error TS2741: Property 'onSearch' is missing in type '{}' but required in type 'SearchBoxProps'.
   123. src/app/help/faq/page.tsx(126,37): error TS2322: Type '{ key: string; faq: FAQ; showCategory: boolean; }' is not assignable to type 'IntrinsicAttributes & FAQCardProps'.
   124.   Property 'faq' does not exist on type 'IntrinsicAttributes & FAQCardProps'.
   125. src/app/help/faq/page.tsx(148,39): error TS2322: Type '{ key: string; faq: FAQ; showCategory: boolean; }' is not assignable to type 'IntrinsicAttributes & FAQCardProps'.
   126.   Property 'faq' does not exist on type 'IntrinsicAttributes & FAQCardProps'.
   127. src/app/help/page.tsx(71,14): error TS2741: Property 'onSearch' is missing in type '{}' but required in type 'SearchBoxProps'.
   128. src/app/help/page.tsx(111,47): error TS2322: Type '{ key: string; category: HelpCategory; }' is not assignable to type 'IntrinsicAttributes & CategoryCardProps'.
   129.   Property 'category' does not exist on type 'IntrinsicAttributes & CategoryCardProps'.
   130. src/app/help/page.tsx(136,45): error TS2322: Type '{ key: string; article: HelpArticle; }' is not assignable to type 'IntrinsicAttributes & ArticleCardProps'.
   131.   Property 'article' does not exist on type 'IntrinsicAttributes & ArticleCardProps'.
   132. src/app/help/page.tsx(161,37): error TS2322: Type '{ key: string; faq: FAQ; }' is not assignable to type 'IntrinsicAttributes & FAQCardProps'.
   133.   Property 'faq' does not exist on type 'IntrinsicAttributes & FAQCardProps'.
   134. src/app/manifest.ts(22,9): error TS2820: Type '"maskable any"' is not assignable to type '"any" | "maskable" | "monochrome" | "badge" | undefined'. Did you mean '"maskable"'?
   135. src/app/manifest.ts(28,9): error TS2820: Type '"maskable any"' is not assignable to type '"any" | "maskable" | "monochrome" | "badge" | undefined'. Did you mean '"maskable"'?
   136. src/app/manifest.ts(34,9): error TS2820: Type '"maskable any"' is not assignable to type '"any" | "maskable" | "monochrome" | "badge" | undefined'. Did you mean '"maskable"'?
   137. src/app/manifest.ts(40,9): error TS2820: Type '"maskable any"' is not assignable to type '"any" | "maskable" | "monochrome" | "badge" | undefined'. Did you mean '"maskable"'?
   138. src/app/manifest.ts(46,9): error TS2820: Type '"maskable any"' is not assignable to type '"any" | "maskable" | "monochrome" | "badge" | undefined'. Did you mean '"maskable"'?
   139. src/app/manifest.ts(52,9): error TS2820: Type '"maskable any"' is not assignable to type '"any" | "maskable" | "monochrome" | "badge" | undefined'. Did you mean '"maskable"'?
   140. src/app/manifest.ts(58,9): error TS2820: Type '"maskable any"' is not assignable to type '"any" | "maskable" | "monochrome" | "badge" | undefined'. Did you mean '"maskable"'?
   141. src/app/manifest.ts(64,9): error TS2820: Type '"maskable any"' is not assignable to type '"any" | "maskable" | "monochrome" | "badge" | undefined'. Did you mean '"maskable"'?
   142. src/app/manifest.ts(128,9): error TS2353: Object literal may only specify known properties, and 'form_factor' does not exist in type '{ src: string; type?: string | undefined; sizes?: string | undefined; }'.
   143. src/app/manifest.ts(135,9): error TS2353: Object literal may only specify known properties, and 'form_factor' does not exist in type '{ src: string; type?: string | undefined; sizes?: string | undefined; }'.
   144. src/app/manifest.ts(142,9): error TS2353: Object literal may only specify known properties, and 'form_factor' does not exist in type '{ src: string; type?: string | undefined; sizes?: string | undefined; }'.
   145. src/app/manifest.ts(149,9): error TS2353: Object literal may only specify known properties, and 'form_factor' does not exist in type '{ src: string; type?: string | undefined; sizes?: string | undefined; }'.
   146. src/app/not-found.tsx(155,25): error TS2322: Type '{ children: string; variant: "success" | "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   147.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   148. src/app/page-backup.tsx(122,13): error TS2322: Type '{ variant: string; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<NewsletterSignupProps, "variant" | "size" | "theme">'.
   149.   Property 'variant' does not exist on type 'IntrinsicAttributes & Omit<NewsletterSignupProps, "variant" | "size" | "theme">'.
   150. src/app/page.tsx(122,13): error TS2322: Type '{ variant: string; className: string; }' is not assignable to type 'IntrinsicAttributes & Omit<NewsletterSignupProps, "variant" | "size" | "theme">'.
   151.   Property 'variant' does not exist on type 'IntrinsicAttributes & Omit<NewsletterSignupProps, "variant" | "size" | "theme">'.
   152. src/components/admin/AdminDashboard.tsx(163,9): error TS2322: Type '"admin_action"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   153. src/components/admin/AdminDashboard.tsx(271,20): error TS18048: 'stats.notifications.unread' is possibly 'undefined'.
   154. src/components/admin/AdminDashboard.tsx(273,24): error TS18047: 'stats' is possibly 'null'.
   155. src/components/admin/UserManagement.tsx(217,9): error TS2322: Type '"admin_action"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   156. src/components/admin/UserManagement.tsx(312,9): error TS2322: Type '"admin_action"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   157. src/components/admin/UserManagement.tsx(362,9): error TS2322: Type '"admin_action"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   158. src/components/amp/AMPBlogPost.tsx(25,63): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   159.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   160. src/components/amp/AMPBlogPost.tsx(30,49): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   161.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   162. src/components/amp/AMPBlogPost.tsx(35,45): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   163.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   164. src/components/amp/AMPBlogPost.tsx(38,46): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   165.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   166. src/components/amp/AMPBlogPost.tsx(42,22): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   167.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   168. src/components/amp/AMPBlogPost.tsx(43,19): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   169.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   170. src/components/amp/AMPBlogPost.tsx(44,19): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   171.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   172. src/components/amp/AMPBlogPost.tsx(50,15): error TS2322: Type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray' is not assignable to type 'string | undefined'.
   173.   Type 'number' is not assignable to type 'string'.
   174. src/components/amp/AMPBlogPost.tsx(54,15): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'string | undefined'.
   175.   Type 'null' is not assignable to type 'string | undefined'.
   176. src/components/amp/AMPBlogPost.tsx(65,45): error TS2339: Property 'length' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   177.   Property 'length' does not exist on type 'number'.
   178. src/components/amp/AMPBlogPost.tsx(69,32): error TS2339: Property 'map' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   179.   Property 'map' does not exist on type 'string'.
   180. src/components/amp/AMPBlogPost.tsx(82,13): error TS2339: Property 'amp-social-share' does not exist on type 'JSX.IntrinsicElements'.
   181. src/components/amp/AMPBlogPost.tsx(89,13): error TS2339: Property 'amp-social-share' does not exist on type 'JSX.IntrinsicElements'.
   182. src/components/amp/AMPBlogPost.tsx(95,13): error TS2339: Property 'amp-social-share' does not exist on type 'JSX.IntrinsicElements'.
   183. src/components/amp/AMPBlogPost.tsx(103,13): error TS2339: Property 'amp-social-share' does not exist on type 'JSX.IntrinsicElements'.
   184. src/components/amp/AMPComponents.tsx(24,17): error TS2323: Cannot redeclare exported variable 'AMPImage'.
   185. src/components/amp/AMPComponents.tsx(46,7): error TS2322: Type '"blur" | "empty" | undefined' is not assignable to type 'boolean | undefined'.
   186.   Type '"blur"' is not assignable to type 'boolean | undefined'.
   187. src/components/amp/AMPComponents.tsx(71,17): error TS2323: Cannot redeclare exported variable 'AMPVideo'.
   188. src/components/amp/AMPComponents.tsx(109,17): error TS2323: Cannot redeclare exported variable 'AMPYouTube'.
   189. src/components/amp/AMPComponents.tsx(118,5): error TS2339: Property 'amp-youtube' does not exist on type 'JSX.IntrinsicElements'.
   190. src/components/amp/AMPComponents.tsx(139,17): error TS2323: Cannot redeclare exported variable 'AMPVimeo'.
   191. src/components/amp/AMPComponents.tsx(148,5): error TS2339: Property 'amp-vimeo' does not exist on type 'JSX.IntrinsicElements'.
   192. src/components/amp/AMPComponents.tsx(173,17): error TS2323: Cannot redeclare exported variable 'AMPCarousel'.
   193. src/components/amp/AMPComponents.tsx(186,5): error TS2339: Property 'amp-carousel' does not exist on type 'JSX.IntrinsicElements'.
   194. src/components/amp/AMPComponents.tsx(198,5): error TS2339: Property 'amp-carousel' does not exist on type 'JSX.IntrinsicElements'.
   195. src/components/amp/AMPComponents.tsx(210,17): error TS2323: Cannot redeclare exported variable 'AMPSidebar'.
   196. src/components/amp/AMPComponents.tsx(217,5): error TS2339: Property 'amp-sidebar' does not exist on type 'JSX.IntrinsicElements'.
   197. src/components/amp/AMPComponents.tsx(224,5): error TS2339: Property 'amp-sidebar' does not exist on type 'JSX.IntrinsicElements'.
   198. src/components/amp/AMPComponents.tsx(236,17): error TS2323: Cannot redeclare exported variable 'AMPAccordion'.
   199. src/components/amp/AMPComponents.tsx(243,5): error TS2339: Property 'amp-accordion' does not exist on type 'JSX.IntrinsicElements'.
   200. src/components/amp/AMPComponents.tsx(249,5): error TS2339: Property 'amp-accordion' does not exist on type 'JSX.IntrinsicElements'.
   201. src/components/amp/AMPComponents.tsx(260,17): error TS2323: Cannot redeclare exported variable 'AMPAccordionSection'.
   202. src/components/amp/AMPComponents.tsx(266,14): error TS2322: Type '{ children: Element[]; expanded: boolean; }' is not assignable to type 'DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>'.
   203.   Property 'expanded' does not exist on type 'DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>'.
   204. src/components/amp/AMPComponents.tsx(287,17): error TS2323: Cannot redeclare exported variable 'AMPForm'.
   205. src/components/amp/AMPComponents.tsx(328,17): error TS2323: Cannot redeclare exported variable 'AMPInput'.
   206. src/components/amp/AMPComponents.tsx(367,17): error TS2323: Cannot redeclare exported variable 'AMPButton'.
   207. src/components/amp/AMPComponents.tsx(401,17): error TS2323: Cannot redeclare exported variable 'AMPSocialShare'.
   208. src/components/amp/AMPComponents.tsx(414,5): error TS2339: Property 'amp-social-share' does not exist on type 'JSX.IntrinsicElements'.
   209. src/components/amp/AMPComponents.tsx(432,17): error TS2323: Cannot redeclare exported variable 'AMPAnalytics'.
   210. src/components/amp/AMPComponents.tsx(465,17): error TS2323: Cannot redeclare exported variable 'AMPLightbox'.
   211. src/components/amp/AMPComponents.tsx(473,5): error TS2339: Property 'amp-lightbox' does not exist on type 'JSX.IntrinsicElements'.
   212. src/components/amp/AMPComponents.tsx(480,5): error TS2339: Property 'amp-lightbox' does not exist on type 'JSX.IntrinsicElements'.
   213. src/components/amp/AMPComponents.tsx(492,17): error TS2323: Cannot redeclare exported variable 'AMPAnimation'.
   214. src/components/amp/AMPComponents.tsx(499,5): error TS2339: Property 'amp-animation' does not exist on type 'JSX.IntrinsicElements'.
   215. src/components/amp/AMPComponents.tsx(509,5): error TS2339: Property 'amp-animation' does not exist on type 'JSX.IntrinsicElements'.
   216. src/components/amp/AMPComponents.tsx(523,17): error TS2323: Cannot redeclare exported variable 'AMPFitText'.
   217. src/components/amp/AMPComponents.tsx(532,5): error TS2339: Property 'amp-fit-text' does not exist on type 'JSX.IntrinsicElements'.
   218. src/components/amp/AMPComponents.tsx(540,5): error TS2339: Property 'amp-fit-text' does not exist on type 'JSX.IntrinsicElements'.
   219. src/components/amp/AMPComponents.tsx(550,17): error TS2323: Cannot redeclare exported variable 'AMPCallTracking'.
   220. src/components/amp/AMPComponents.tsx(555,5): error TS2339: Property 'amp-call-tracking' does not exist on type 'JSX.IntrinsicElements'.
   221. src/components/amp/AMPComponents.tsx(562,5): error TS2339: Property 'amp-call-tracking' does not exist on type 'JSX.IntrinsicElements'.
   222. src/components/amp/AMPComponents.tsx(586,17): error TS2323: Cannot redeclare exported variable 'AMPHeader'.
   223. src/components/amp/AMPComponents.tsx(656,17): error TS2323: Cannot redeclare exported variable 'AMPFooter'.
   224. src/components/amp/AMPComponents.tsx(714,17): error TS2323: Cannot redeclare exported variable 'AMPHero'.
   225. src/components/amp/AMPComponents.tsx(768,17): error TS2323: Cannot redeclare exported variable 'AMPContactForm'.
   226. src/components/amp/AMPComponents.tsx(822,3): error TS2323: Cannot redeclare exported variable 'AMPImage'.
   227. src/components/amp/AMPComponents.tsx(822,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPImage'.
   228. src/components/amp/AMPComponents.tsx(823,3): error TS2323: Cannot redeclare exported variable 'AMPVideo'.
   229. src/components/amp/AMPComponents.tsx(823,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPVideo'.
   230. src/components/amp/AMPComponents.tsx(824,3): error TS2323: Cannot redeclare exported variable 'AMPYouTube'.
   231. src/components/amp/AMPComponents.tsx(824,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPYouTube'.
   232. src/components/amp/AMPComponents.tsx(825,3): error TS2323: Cannot redeclare exported variable 'AMPVimeo'.
   233. src/components/amp/AMPComponents.tsx(825,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPVimeo'.
   234. src/components/amp/AMPComponents.tsx(826,3): error TS2323: Cannot redeclare exported variable 'AMPCarousel'.
   235. src/components/amp/AMPComponents.tsx(826,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPCarousel'.
   236. src/components/amp/AMPComponents.tsx(827,3): error TS2323: Cannot redeclare exported variable 'AMPSidebar'.
   237. src/components/amp/AMPComponents.tsx(827,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPSidebar'.
   238. src/components/amp/AMPComponents.tsx(828,3): error TS2323: Cannot redeclare exported variable 'AMPAccordion'.
   239. src/components/amp/AMPComponents.tsx(828,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPAccordion'.
   240. src/components/amp/AMPComponents.tsx(829,3): error TS2323: Cannot redeclare exported variable 'AMPAccordionSection'.
   241. src/components/amp/AMPComponents.tsx(829,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPAccordionSection'.
   242. src/components/amp/AMPComponents.tsx(830,3): error TS2323: Cannot redeclare exported variable 'AMPForm'.
   243. src/components/amp/AMPComponents.tsx(830,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPForm'.
   244. src/components/amp/AMPComponents.tsx(831,3): error TS2323: Cannot redeclare exported variable 'AMPInput'.
   245. src/components/amp/AMPComponents.tsx(831,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPInput'.
   246. src/components/amp/AMPComponents.tsx(832,3): error TS2323: Cannot redeclare exported variable 'AMPButton'.
   247. src/components/amp/AMPComponents.tsx(832,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPButton'.
   248. src/components/amp/AMPComponents.tsx(833,3): error TS2323: Cannot redeclare exported variable 'AMPSocialShare'.
   249. src/components/amp/AMPComponents.tsx(833,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPSocialShare'.
   250. src/components/amp/AMPComponents.tsx(834,3): error TS2323: Cannot redeclare exported variable 'AMPAnalytics'.
   251. src/components/amp/AMPComponents.tsx(834,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPAnalytics'.
   252. src/components/amp/AMPComponents.tsx(835,3): error TS2323: Cannot redeclare exported variable 'AMPLightbox'.
   253. src/components/amp/AMPComponents.tsx(835,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPLightbox'.
   254. src/components/amp/AMPComponents.tsx(836,3): error TS2323: Cannot redeclare exported variable 'AMPAnimation'.
   255. src/components/amp/AMPComponents.tsx(836,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPAnimation'.
   256. src/components/amp/AMPComponents.tsx(837,3): error TS2323: Cannot redeclare exported variable 'AMPFitText'.
   257. src/components/amp/AMPComponents.tsx(837,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPFitText'.
   258. src/components/amp/AMPComponents.tsx(838,3): error TS2323: Cannot redeclare exported variable 'AMPCallTracking'.
   259. src/components/amp/AMPComponents.tsx(838,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPCallTracking'.
   260. src/components/amp/AMPComponents.tsx(839,3): error TS2323: Cannot redeclare exported variable 'AMPHeader'.
   261. src/components/amp/AMPComponents.tsx(839,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPHeader'.
   262. src/components/amp/AMPComponents.tsx(840,3): error TS2323: Cannot redeclare exported variable 'AMPFooter'.
   263. src/components/amp/AMPComponents.tsx(840,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPFooter'.
   264. src/components/amp/AMPComponents.tsx(841,3): error TS2323: Cannot redeclare exported variable 'AMPHero'.
   265. src/components/amp/AMPComponents.tsx(841,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPHero'.
   266. src/components/amp/AMPComponents.tsx(842,3): error TS2323: Cannot redeclare exported variable 'AMPContactForm'.
   267. src/components/amp/AMPComponents.tsx(842,3): error TS2484: Export declaration conflicts with exported declaration of 'AMPContactForm'.
   268. src/components/amp/AMPRichTextRenderer.tsx(185,9): error TS2339: Property 'amp-youtube' does not exist on type 'JSX.IntrinsicElements'.
   269. src/components/amp/AMPRichTextRenderer.tsx(201,9): error TS2339: Property 'amp-vimeo' does not exist on type 'JSX.IntrinsicElements'.
   270. src/components/analytics/AnalyticsDashboard.tsx(101,9): error TS2322: Type '"analytics"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   271. src/components/analytics/AnalyticsDashboard.tsx(147,9): error TS2322: Type '"analytics"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   272. src/components/analytics/AnalyticsProvider.tsx(89,24): error TS2339: Property 'trackEvent' does not exist on type '{ leadGenerated: (source: string, serviceInterest: string, value?: number | undefined) => void; contactFormSubmit: (formType: string, page: string) => void; serviceInterest: (serviceName: string, action: string) => void; ... 14 more ...; performanceMetric: (metric: string, value: number, page: string) => void; }'.
   273. src/components/analytics/ConversionTracking.tsx(66,30): error TS2339: Property 'trackEvent' does not exist on type '{ leadGenerated: (source: string, serviceInterest: string, value?: number | undefined) => void; contactFormSubmit: (formType: string, page: string) => void; serviceInterest: (serviceName: string, action: string) => void; ... 14 more ...; performanceMetric: (metric: string, value: number, page: string) => void; }'.
   274. src/components/analytics/ConversionTracking.tsx(76,30): error TS2339: Property 'trackEvent' does not exist on type '{ leadGenerated: (source: string, serviceInterest: string, value?: number | undefined) => void; contactFormSubmit: (formType: string, page: string) => void; serviceInterest: (serviceName: string, action: string) => void; ... 14 more ...; performanceMetric: (metric: string, value: number, page: string) => void; }'.
   275. src/components/analytics/ConversionTracking.tsx(93,30): error TS2339: Property 'trackEvent' does not exist on type '{ leadGenerated: (source: string, serviceInterest: string, value?: number | undefined) => void; contactFormSubmit: (formType: string, page: string) => void; serviceInterest: (serviceName: string, action: string) => void; ... 14 more ...; performanceMetric: (metric: string, value: number, page: string) => void; }'.
   276. src/components/analytics/ConversionTracking.tsx(122,30): error TS2339: Property 'trackEvent' does not exist on type '{ leadGenerated: (source: string, serviceInterest: string, value?: number | undefined) => void; contactFormSubmit: (formType: string, page: string) => void; serviceInterest: (serviceName: string, action: string) => void; ... 14 more ...; performanceMetric: (metric: string, value: number, page: string) => void; }'.
   277. src/components/cms/BlogPostContent.tsx(19,5): error TS2345: Argument of type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to parameter of type 'string'.
   278.   Type 'undefined' is not assignable to type 'string'.
   279. src/components/cms/BlogPostContent.tsx(40,47): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   280.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   281. src/components/cms/BlogPostContent.tsx(47,19): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   282.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   283. src/components/cms/BlogPostContent.tsx(50,46): error TS2322: Type '{ children: string; variant: "secondary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   284.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   285. src/components/cms/BlogPostContent.tsx(56,17): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   286.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   287. src/components/cms/BlogPostContent.tsx(59,17): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   288.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   289. src/components/cms/BlogPostContent.tsx(68,25): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   290.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   291. src/components/cms/BlogPostContent.tsx(74,25): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   292.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   293. src/components/cms/BlogPostContent.tsx(80,25): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   294.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   295. src/components/cms/BlogPostContent.tsx(89,19): error TS2322: Type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray' is not assignable to type 'string | StaticImport'.
   296.   Type 'number' is not assignable to type 'string | StaticImport'.
   297. src/components/cms/BlogPostContent.tsx(90,19): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'string'.
   298.   Type 'undefined' is not assignable to type 'string'.
   299. src/components/cms/BlogPostContent.tsx(113,53): error TS2339: Property 'length' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   300.   Property 'length' does not exist on type 'number'.
   301. src/components/cms/BlogPostContent.tsx(117,40): error TS2339: Property 'map' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   302.   Property 'map' does not exist on type 'string'.
   303. src/components/cms/BlogPostContent.tsx(118,60): error TS2322: Type '{ children: string; key: string; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   304.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   305. src/components/cms/BlogPostContent.tsx(129,21): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'string'.
   306.   Type 'undefined' is not assignable to type 'string'.
   307. src/components/cms/BlogPostContent.tsx(131,21): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'string | undefined'.
   308.   Type 'null' is not assignable to type 'string | undefined'.
   309. src/components/cms/BlogPostContent.tsx(149,54): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   310.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   311. src/components/cms/CaseStudyContent.tsx(34,47): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   312.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   313. src/components/cms/CaseStudyContent.tsx(41,19): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   314.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   315. src/components/cms/CaseStudyContent.tsx(44,46): error TS2322: Type '{ children: string; variant: "secondary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   316.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   317. src/components/cms/CaseStudyContent.tsx(50,17): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   318.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   319. src/components/cms/CaseStudyContent.tsx(53,17): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   320.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   321. src/components/cms/CaseStudyContent.tsx(59,64): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   322.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   323. src/components/cms/CaseStudyContent.tsx(62,66): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   324.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   325. src/components/cms/CaseStudyContent.tsx(65,67): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   326.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   327. src/components/cms/CaseStudyContent.tsx(68,67): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   328.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   329. src/components/cms/CaseStudyContent.tsx(77,19): error TS2322: Type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray' is not assignable to type 'string | StaticImport'.
   330.   Type 'number' is not assignable to type 'string | StaticImport'.
   331. src/components/cms/CaseStudyContent.tsx(78,19): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'string'.
   332.   Type 'undefined' is not assignable to type 'string'.
   333. src/components/cms/CaseStudyContent.tsx(98,21): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   334.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   335. src/components/cms/CaseStudyContent.tsx(104,21): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   336.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   337. src/components/cms/CaseStudyContent.tsx(141,20): error TS18049: 'fields.technologiesUsed' is possibly 'null' or 'undefined'.
   338. src/components/cms/CaseStudyContent.tsx(141,44): error TS2339: Property 'map' does not exist on type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   339.   Property 'map' does not exist on type 'string'.
   340. src/components/cms/CaseStudyContent.tsx(142,39): error TS2322: Type '{ children: string; key: string; size: string; variant: "outline"; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   341.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   342. src/components/cms/CaseStudyContent.tsx(157,50): error TS2339: Property 'content' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   343.   Property 'content' does not exist on type 'string'.
   344. src/components/cms/CaseStudyContent.tsx(160,57): error TS2339: Property 'clientName' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   345.   Property 'clientName' does not exist on type 'string'.
   346. src/components/cms/CaseStudyContent.tsx(162,49): error TS2339: Property 'clientPosition' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   347.   Property 'clientPosition' does not exist on type 'string'.
   348. src/components/cms/CaseStudyContent.tsx(176,55): error TS2339: Property 'length' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   349.   Property 'length' does not exist on type 'number'.
   350. src/components/cms/CaseStudyContent.tsx(180,39): error TS2339: Property 'map' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   351.   Property 'map' does not exist on type 'string'.
   352. src/components/cms/CaseStudyContent.tsx(197,17): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'string'.
   353.   Type 'undefined' is not assignable to type 'string'.
   354. src/components/cms/CaseStudyContent.tsx(199,17): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'string | undefined'.
   355.   Type 'null' is not assignable to type 'string | undefined'.
   356. src/components/cms/ContentDashboard.tsx(103,9): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   357. src/components/cms/ContentDashboard.tsx(190,11): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   358. src/components/cms/ContentDashboard.tsx(226,9): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   359. src/components/cms/ContentEditor.tsx(228,11): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   360. src/components/cms/PreviewBanner.tsx(49,37): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   361. src/components/cms/PreviewBanner.tsx(51,3): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   362. src/components/cms/ServiceContent.tsx(34,47): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   363.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   364. src/components/cms/ServiceContent.tsx(41,19): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   365.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   366. src/components/cms/ServiceContent.tsx(44,46): error TS2322: Type '{ children: string; variant: "secondary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   367.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   368. src/components/cms/ServiceContent.tsx(50,17): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   369.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   370. src/components/cms/ServiceContent.tsx(53,17): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   371.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   372. src/components/cms/ServiceContent.tsx(60,71): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   373.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   374. src/components/cms/ServiceContent.tsx(64,66): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'ReactNode'.
   375.   Type 'Asset<ChainModifiers, string>' is not assignable to type 'ReactNode'.
   376. src/components/cms/ServiceContent.tsx(76,19): error TS2322: Type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray' is not assignable to type 'string | StaticImport'.
   377.   Type 'number' is not assignable to type 'string | StaticImport'.
   378. src/components/cms/ServiceContent.tsx(77,19): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'string'.
   379.   Type 'undefined' is not assignable to type 'string'.
   380. src/components/cms/ServiceContent.tsx(94,16): error TS18049: 'fields.features' is possibly 'null' or 'undefined'.
   381. src/components/cms/ServiceContent.tsx(94,32): error TS2339: Property 'map' does not exist on type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   382.   Property 'map' does not exist on type 'string'.
   383. src/components/cms/ServiceContent.tsx(121,51): error TS2339: Property 'length' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   384.   Property 'length' does not exist on type 'number'.
   385. src/components/cms/ServiceContent.tsx(125,38): error TS2339: Property 'map' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   386.   Property 'map' does not exist on type 'string'.
   387. src/components/cms/ServiceContent.tsx(138,59): error TS2339: Property 'length' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   388.   Property 'length' does not exist on type 'number'.
   389. src/components/cms/ServiceContent.tsx(142,42): error TS2339: Property 'map' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   390.   Property 'map' does not exist on type 'string'.
   391. src/components/cms/ServiceContent.tsx(163,59): error TS2339: Property 'length' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   392.   Property 'length' does not exist on type 'number'.
   393. src/components/cms/ServiceContent.tsx(167,42): error TS2339: Property 'map' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   394.   Property 'map' does not exist on type 'string'.
   395. src/components/cms/ServiceContent.tsx(168,41): error TS2322: Type '{ children: string; key: string; size: string; variant: "outline"; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   396.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   397. src/components/cms/ServiceContent.tsx(177,51): error TS2339: Property 'length' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   398.   Property 'length' does not exist on type 'number'.
   399. src/components/cms/ServiceContent.tsx(181,38): error TS2339: Property 'map' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   400.   Property 'map' does not exist on type 'string'.
   401. src/components/cms/ServiceContent.tsx(194,49): error TS2339: Property 'length' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   402.   Property 'length' does not exist on type 'number'.
   403. src/components/cms/ServiceContent.tsx(198,37): error TS2339: Property 'map' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   404.   Property 'map' does not exist on type 'string'.
   405. src/components/cms/ServiceContent.tsx(212,17): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'string'.
   406.   Type 'undefined' is not assignable to type 'string'.
   407. src/components/cms/ServiceContent.tsx(214,17): error TS2322: Type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 11 more ... | undefined' is not assignable to type 'string | undefined'.
   408.   Type 'null' is not assignable to type 'string | undefined'.
   409. src/components/cms/ServiceContent.tsx(222,63): error TS2339: Property 'length' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   410.   Property 'length' does not exist on type 'number'.
   411. src/components/cms/ServiceContent.tsx(228,44): error TS2339: Property 'slice' does not exist on type 'string | number | true | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   412.   Property 'slice' does not exist on type 'number'.
   413. src/components/cms/ServiceContent.tsx(241,48): error TS2322: Type '{ children: any; variant: "outline"; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   414.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   415. src/components/cms/ServiceContent.tsx(276,34): error TS18049: 'fields.name' is possibly 'null' or 'undefined'.
   416. src/components/cms/ServiceContent.tsx(276,46): error TS2339: Property 'toLowerCase' does not exist on type 'string | number | boolean | Asset<ChainModifiers, string> | { [x: string]: string | number | boolean | Asset<ChainModifiers, string> | ... 11 more ... | undefined; } | ... 9 more ... | JsonArray'.
   417.   Property 'toLowerCase' does not exist on type 'number'.
   418. src/components/ComingSoon.tsx(44,9): error TS2322: Type '"service" | "location" | "article" | "company" | "product"' is not assignable to type '"service" | "location" | "article" | "website" | undefined'.
   419.   Type '"company"' is not assignable to type '"service" | "location" | "article" | "website" | undefined'.
   420. src/components/demos/AIChatbotDemo.tsx(194,45): error TS18048: 'message.metadata.confidence' is possibly 'undefined'.
   421. src/components/email/EmailDashboard.tsx(83,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   422. src/components/email/EmailDashboard.tsx(128,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   423. src/components/homepage/HeroSection.tsx(197,19): error TS2322: Type '{ src: string; alt: string; width: number; height: number; className: string; priority: true; }' is not assignable to type 'IntrinsicAttributes & Omit<OptimizedImageProps, "sizes" | "priority">'.
   424.   Property 'priority' does not exist on type 'IntrinsicAttributes & Omit<OptimizedImageProps, "sizes" | "priority">'.
   425. src/components/i18n/LanguageSwitcher.tsx(292,27): error TS2304: Cannot find name 'supportedLocales'.
   426. src/components/i18n/LanguageSwitcher.tsx(292,49): error TS7006: Parameter 'l' implicitly has an 'any' type.
   427. src/components/layout/Header/MobileMenu.tsx(58,19): error TS2322: Type '{ children: string; variant: "success" | "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   428.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   429. src/components/layout/Header/MobileMenu.tsx(94,19): error TS2322: Type '{ children: string; variant: "success" | "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   430.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   431. src/components/layout/Header/MobileMenu.tsx(196,17): error TS2322: Type '"outline" | "primary" | "ghost"' is not assignable to type '"outline" | "white" | "primary" | "secondary" | "outline-white" | undefined'.
   432.   Type '"ghost"' is not assignable to type '"outline" | "white" | "primary" | "secondary" | "outline-white" | undefined'.
   433. src/components/layout/Header/Navigation.tsx(46,21): error TS2322: Type '{ children: string; variant: "success" | "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   434.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   435. src/components/layout/Header/Navigation.tsx(136,17): error TS2322: Type '{ children: string; variant: "success" | "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   436.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   437. src/components/layout/Header/Navigation.tsx(250,17): error TS2322: Type '"outline" | "primary" | "ghost"' is not assignable to type '"outline" | "white" | "primary" | "secondary" | "outline-white" | undefined'.
   438.   Type '"ghost"' is not assignable to type '"outline" | "white" | "primary" | "secondary" | "outline-white" | undefined'.
   439. src/components/lead-capture/SmartLeadForm.tsx(160,24): error TS2339: Property 'trackEvent' does not exist on type '{ leadGenerated: (source: string, serviceInterest: string, value?: number | undefined) => void; contactFormSubmit: (formType: string, page: string) => void; serviceInterest: (serviceName: string, action: string) => void; ... 14 more ...; performanceMetric: (metric: string, value: number, page: string) => void; }'.
   440. src/components/performance/PerformanceDashboard.tsx(497,21): error TS7006: Parameter 'alert' implicitly has an 'any' type.
   441. src/components/performance/PerformanceDashboard.tsx(515,69): error TS7006: Parameter 'l' implicitly has an 'any' type.
   442. src/components/pricing/PricingPlans.tsx(517,22): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   443. src/components/pricing/PricingPlans.tsx(548,23): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   444. src/components/sections/cta/CTAManager.tsx(212,11): error TS2322: Type '{ variant: "primary"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; intent?: CTAIntent | undefined; children?: ReactNode; ... 6 more ...; fullWidth?: boolean | undefined; }' is not assignable to type 'IntrinsicAttributes & CTAProps'.
   445.   Property 'onClick' is missing in type '{ variant: "primary"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; intent?: CTAIntent | undefined; children?: ReactNode; ... 6 more ...; fullWidth?: boolean | undefined; }' but required in type 'ButtonCTAProps'.
   446. src/components/sections/cta/CTAManager.tsx(216,11): error TS2322: Type '{ variant: "secondary"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; intent?: CTAIntent | undefined; children?: ReactNode; ... 6 more ...; fullWidth?: boolean | undefined; }' is not assignable to type 'IntrinsicAttributes & CTAProps'.
   447.   Property 'onClick' is missing in type '{ variant: "secondary"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; intent?: CTAIntent | undefined; children?: ReactNode; ... 6 more ...; fullWidth?: boolean | undefined; }' but required in type 'ButtonCTAProps'.
   448. src/components/sections/cta/CTAManager.tsx(220,11): error TS2322: Type '{ variant: "outline"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; intent?: CTAIntent | undefined; children?: ReactNode; ... 6 more ...; fullWidth?: boolean | undefined; }' is not assignable to type 'IntrinsicAttributes & CTAProps'.
   449.   Property 'onClick' is missing in type '{ variant: "outline"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; intent?: CTAIntent | undefined; children?: ReactNode; ... 6 more ...; fullWidth?: boolean | undefined; }' but required in type 'ButtonCTAProps'.
   450. src/components/sections/cta/CTAManager.tsx(224,11): error TS2322: Type '{ variant: "gradient"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; intent?: CTAIntent | undefined; children?: ReactNode; ... 6 more ...; fullWidth?: boolean | undefined; }' is not assignable to type 'IntrinsicAttributes & CTAProps'.
   451.   Property 'onClick' is missing in type '{ variant: "gradient"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; intent?: CTAIntent | undefined; children?: ReactNode; ... 6 more ...; fullWidth?: boolean | undefined; }' but required in type 'ButtonCTAProps'.
   452. src/components/sections/cta/CTAManager.tsx(229,11): error TS2322: Type '{ intent: "sales"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; children?: ReactNode; icon?: ReactNode; className?: string | undefined; ... 8 more ...; href?: string | undefined; }' is not assignable to type 'IntrinsicAttributes & CTAProps'.
   453.   Type '{ intent: "sales"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; children?: ReactNode; icon?: ReactNode; className?: string | undefined; ... 8 more ...; href?: string | undefined; }' is not assignable to type 'LinkCTAProps'.
   454.     Types of property 'href' are incompatible.
   455.       Type 'string | undefined' is not assignable to type 'string'.
   456.         Type 'undefined' is not assignable to type 'string'.
   457. src/components/sections/cta/CTAManager.tsx(233,11): error TS2322: Type '{ intent: "demo"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; children?: ReactNode; icon?: ReactNode; className?: string | undefined; ... 8 more ...; href?: string | undefined; }' is not assignable to type 'IntrinsicAttributes & CTAProps'.
   458.   Type '{ intent: "demo"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; children?: ReactNode; icon?: ReactNode; className?: string | undefined; ... 8 more ...; href?: string | undefined; }' is not assignable to type 'LinkCTAProps'.
   459.     Types of property 'href' are incompatible.
   460.       Type 'string | undefined' is not assignable to type 'string'.
   461.         Type 'undefined' is not assignable to type 'string'.
   462. src/components/sections/cta/CTAManager.tsx(237,11): error TS2322: Type '{ intent: "consultation"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; children?: ReactNode; icon?: ReactNode; className?: string | undefined; ... 8 more ...; href?: string | undefined; }' is not assignable to type 'IntrinsicAttributes & CTAProps'.
   463.   Type '{ intent: "consultation"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; children?: ReactNode; icon?: ReactNode; className?: string | undefined; ... 8 more ...; href?: string | undefined; }' is not assignable to type 'LinkCTAProps'.
   464.     Types of property 'href' are incompatible.
   465.       Type 'string | undefined' is not assignable to type 'string'.
   466.         Type 'undefined' is not assignable to type 'string'.
   467. src/components/sections/cta/CTAManager.tsx(241,11): error TS2322: Type '{ intent: "signup"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; children?: ReactNode; icon?: ReactNode; className?: string | undefined; ... 8 more ...; href?: string | undefined; }' is not assignable to type 'IntrinsicAttributes & CTAProps'.
   468.   Type '{ intent: "signup"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; children?: ReactNode; icon?: ReactNode; className?: string | undefined; ... 8 more ...; href?: string | undefined; }' is not assignable to type 'LinkCTAProps'.
   469.     Types of property 'href' are incompatible.
   470.       Type 'string | undefined' is not assignable to type 'string'.
   471.         Type 'undefined' is not assignable to type 'string'.
   472. src/components/sections/cta/CTAManager.tsx(245,11): error TS2322: Type '{ intent: "contact"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; children?: ReactNode; icon?: ReactNode; className?: string | undefined; ... 8 more ...; href?: string | undefined; }' is not assignable to type 'IntrinsicAttributes & CTAProps'.
   473.   Type '{ intent: "contact"; analytics?: { event: string; category: string; label?: string | undefined; } | undefined; children?: ReactNode; icon?: ReactNode; className?: string | undefined; ... 8 more ...; href?: string | undefined; }' is not assignable to type 'LinkCTAProps'.
   474.     Types of property 'href' are incompatible.
   475.       Type 'string | undefined' is not assignable to type 'string'.
   476.         Type 'undefined' is not assignable to type 'string'.
   477. src/components/sections/hero/index.tsx(196,30): error TS2322: Type 'LocationData | null' is not assignable to type '{ city: string; country: string; region?: string | undefined; } | undefined'.
   478.   Type 'null' is not assignable to type '{ city: string; country: string; region?: string | undefined; } | undefined'.
   479. src/components/sections/HowItWorks.tsx(333,40): error TS2322: Type '{ children: string; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   480.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   481. src/components/sections/HowItWorks.tsx(363,44): error TS2322: Type '{ children: string; variant: "primary"; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   482.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   483. src/components/sections/HowItWorks.tsx(390,62): error TS2322: Type '{ children: string; key: number; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   484.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   485. src/components/sections/HowItWorks.tsx(418,36): error TS2322: Type '{ children: string; variant: "primary"; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   486.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   487. src/components/sections/HowItWorks.tsx(445,56): error TS2322: Type '{ children: string; key: number; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   488.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   489. src/components/sections/HowItWorks.tsx(518,52): error TS2322: Type '{ children: string; variant: "outline"; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   490.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   491. src/components/sections/PoweredBySection.tsx(351,36): error TS2322: Type '{ children: string; variant: "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   492.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   493. src/components/sections/PoweredBySection.tsx(383,54): error TS2322: Type '{ children: string; key: number; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   494.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   495. src/components/sections/PoweredBySection.tsx(433,50): error TS2322: Type '{ children: string; key: number; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   496.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   497. src/components/sections/PoweredBySection.tsx(449,36): error TS2322: Type '{ children: string; variant: "success"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   498.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   499. src/components/sections/ReadyBuiltSolutions.tsx(273,61): error TS2322: Type '{ children: string; variant: "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   500.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   501. src/components/sections/ReadyBuiltSolutions.tsx(274,57): error TS2322: Type '{ children: string; variant: "success"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   502.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   503. src/components/sections/ReadyBuiltSolutions.tsx(347,54): error TS2322: Type '{ children: string; key: number; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   504.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   505. src/components/sections/ReadyBuiltSolutions.tsx(391,57): error TS2322: Type '{ children: string; variant: "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   506.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   507. src/components/sections/ReadyBuiltSolutions.tsx(392,53): error TS2322: Type '{ children: string; variant: "success"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   508.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   509. src/components/sections/ReadyBuiltSolutions.tsx(418,50): error TS2322: Type '{ children: string; key: number; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   510.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   511. src/components/sections/RecentlyDelivered.tsx(226,40): error TS2322: Type '{ children: string; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   512.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   513. src/components/sections/RecentlyDelivered.tsx(227,61): error TS2322: Type '{ children: string; variant: "success"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   514.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   515. src/components/sections/RecentlyDelivered.tsx(273,42): error TS2322: Type '{ children: string; variant: "primary"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   516.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   517. src/components/sections/RecentlyDelivered.tsx(274,42): error TS2322: Type '{ children: string; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   518.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   519. src/components/sections/RecentlyDelivered.tsx(298,56): error TS2322: Type '{ children: string; key: number; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   520.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   521. src/components/sections/RecentlyDelivered.tsx(389,54): error TS2322: Type '{ children: string; key: number; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   522.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   523. src/components/sections/RecentlyDelivered.tsx(431,57): error TS2322: Type '{ children: string; variant: "success"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   524.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   525. src/components/sections/RecentlyDelivered.tsx(465,52): error TS2322: Type '{ children: string; key: number; variant: "outline"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   526.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   527. src/components/sections/RecentlyDelivered.tsx(468,36): error TS2322: Type '{ children: string; variant: "success"; size: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   528.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   529. src/components/sections/TestimonialsSection.tsx(301,34): error TS2322: Type '{ children: string; variant: "outline"; size: string; className: string; }' is not assignable to type 'IntrinsicAttributes & BadgeProps'.
   530.   Property 'size' does not exist on type 'IntrinsicAttributes & BadgeProps'.
   531. src/components/seo/StructuredData.tsx(345,6): error TS2304: Cannot find name 'Head'.
   532. src/components/seo/StructuredData.tsx(352,7): error TS2304: Cannot find name 'Head'.
   533. src/components/services/ServicePageTemplate.tsx(15,10): error TS2614: Module '"@/components/seo/RelatedLinks"' has no exported member 'RelatedLinks'. Did you mean to use 'import RelatedLinks from "@/components/seo/RelatedLinks"' instead?
   534. src/components/services/ServiceRelated.tsx(2,10): error TS2614: Module '"@/components/seo/RelatedLinks"' has no exported member 'RelatedLinks'. Did you mean to use 'import RelatedLinks from "@/components/seo/RelatedLinks"' instead?
   535. src/components/testing/ABTestManager.tsx(21,3): error TS2305: Module '"lucide-react"' has no exported member 'Alert'.
   536. src/components/testing/ABTestManager.tsx(34,3): error TS2305: Module '"@/lib/testing/ab-testing"' has no exported member 'formatMetricValue'.
   537. src/components/testing/ABTestManager.tsx(73,9): error TS2322: Type '"ab_testing"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   538. src/components/testing/ABTestManager.tsx(88,9): error TS2322: Type '"ab_testing"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   539. src/components/testing/ABTestManager.tsx(162,9): error TS2322: Type '"ab_testing"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   540. src/components/ui/OptimizedImage.tsx(164,11): error TS2322: Type '"blur" | "empty"' is not assignable to type 'undefined'.
   541.   Type '"blur"' is not assignable to type 'undefined'.
   542. src/hooks/useAnalytics.ts(108,49): error TS2741: Property 'id' is missing in type '{}' but required in type 'AnalyticsUser'.
   543. src/lib/ai/code-generator.ts(135,36): error TS2551: Property 'generateAuthCode' does not exist on type 'ZoptalCodeGenerator'. Did you mean 'generateCode'?
   544. src/lib/ai/code-generator.ts(136,37): error TS2339: Property 'generateValidationCode' does not exist on type 'ZoptalCodeGenerator'.
   545. src/lib/ai/code-generator.ts(1097,11): error TS7034: Variable 'functions' implicitly has type 'any[]' in some locations where its type cannot be determined.
   546. src/lib/ai/code-generator.ts(1109,12): error TS7005: Variable 'functions' implicitly has an 'any[]' type.
   547. src/lib/ai/code-generator.ts(1218,12): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ jest: string; mocha: string; pytest: string; unittest: string; }'.
   548.   No index signature with a parameter of type 'string' was found on type '{ jest: string; mocha: string; pytest: string; unittest: string; }'.
   549. src/lib/ai/code-generator.ts(1246,12): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ javascript: string; typescript: string; python: string; java: string; go: string; }'.
   550.   No index signature with a parameter of type 'string' was found on type '{ javascript: string; typescript: string; python: string; java: string; go: string; }'.
   551. src/lib/ai/code-generator.ts(1258,12): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ javascript: RegExp; typescript: RegExp; python: RegExp; java: RegExp; }'.
   552.   No index signature with a parameter of type 'string' was found on type '{ javascript: RegExp; typescript: RegExp; python: RegExp; java: RegExp; }'.
   553. src/lib/ai/project-estimator.ts(437,13): error TS2339: Property 'cost' does not exist on type '{ name: string; description: string; duration: number; effort: number; deliverables: string[]; milestones: string[]; }'.
   554. src/lib/ai/project-estimator.ts(447,7): error TS2322: Type '{ name: string; description: string; duration: number; effort: number; deliverables: string[]; milestones: string[]; }[]' is not assignable to type '{ name: string; description: string; duration: number; effort: number; cost: number; deliverables: string[]; milestones: string[]; }[]'.
   555.   Property 'cost' is missing in type '{ name: string; description: string; duration: number; effort: number; deliverables: string[]; milestones: string[]; }' but required in type '{ name: string; description: string; duration: number; effort: number; cost: number; deliverables: string[]; milestones: string[]; }'.
   556. src/lib/ai/project-estimator.ts(448,7): error TS2322: Type '{ role: string; level: string; allocation: number; duration: number; hourlyRate: number; }[]' is not assignable to type '{ role: string; level: "junior" | "mid" | "senior" | "lead"; allocation: number; duration: number; hourlyRate: number; }[]'.
   557.   Type '{ role: string; level: string; allocation: number; duration: number; hourlyRate: number; }' is not assignable to type '{ role: string; level: "junior" | "mid" | "senior" | "lead"; allocation: number; duration: number; hourlyRate: number; }'.
   558.     Types of property 'level' are incompatible.
   559.       Type 'string' is not assignable to type '"junior" | "mid" | "senior" | "lead"'.
   560. src/lib/ai/project-estimator.ts(449,7): error TS2322: Type '{ name: string; category: string; complexity: number; learningCurve: "low" | "medium" | "high"; }[]' is not assignable to type '{ name: string; category: "frontend" | "backend" | "database" | "infrastructure" | "tool"; complexity: number; learningCurve: "low" | "medium" | "high"; }[]'.
   561.   Type '{ name: string; category: string; complexity: number; learningCurve: "low" | "medium" | "high"; }' is not assignable to type '{ name: string; category: "frontend" | "backend" | "database" | "infrastructure" | "tool"; complexity: number; learningCurve: "low" | "medium" | "high"; }'.
   562.     Types of property 'category' are incompatible.
   563.       Type 'string' is not assignable to type '"frontend" | "backend" | "database" | "infrastructure" | "tool"'.
   564. src/lib/ai/project-estimator.ts(870,28): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ simple: number; medium: number; complex: number; enterprise: number; }'.
   565.   No index signature with a parameter of type 'string' was found on type '{ simple: number; medium: number; complex: number; enterprise: number; }'.
   566. src/lib/ai/project-estimator.ts(882,27): error TS7053: Element implicitly has an 'any' type because expression of type 'string' can't be used to index type '{ simple: number; medium: number; complex: number; enterprise: number; }'.
   567.   No index signature with a parameter of type 'string' was found on type '{ simple: number; medium: number; complex: number; enterprise: number; }'.
   568. src/lib/amp/component-registry.ts(381,14): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   569. src/lib/amp/css-generator.ts(205,23): error TS2551: Property 'generateSidebarCSS' does not exist on type 'AMPCSSGenerator'. Did you mean 'generateHeaderCSS'?
   570. src/lib/amp/testing.ts(539,20): error TS18046: 'error' is of type 'unknown'.
   571. src/lib/amp/testing.ts(550,17): error TS18048: 'p.amp' is possibly 'undefined'.
   572. src/lib/analytics/google-analytics.ts(8,5): error TS2687: All declarations of 'gtag' must have identical modifiers.
   573. src/lib/analytics/google-analytics.ts(8,5): error TS2717: Subsequent property declarations must have the same type.  Property 'gtag' must be of type '((...args: any[]) => void) | undefined', but here has type '(command: "set" | "config" | "event" | "js", targetId: string | Record<string, any> | Date, config?: Record<string, any> | undefined) => void'.
   574. src/lib/analytics/google-analytics.ts(13,5): error TS2687: All declarations of 'dataLayer' must have identical modifiers.
   575. src/lib/analytics/google-analytics.ts(13,5): error TS2717: Subsequent property declarations must have the same type.  Property 'dataLayer' must be of type 'any[] | undefined', but here has type 'Record<string, any>[]'.
   576. src/lib/analytics/google-analytics.ts(25,5): error TS18048: 'window.dataLayer' is possibly 'undefined'.
   577. src/lib/analytics/google-analytics.ts(46,3): error TS2722: Cannot invoke an object which is possibly 'undefined'.
   578. src/lib/analytics/google-analytics.ts(56,3): error TS2722: Cannot invoke an object which is possibly 'undefined'.
   579. src/lib/analytics/reporting.ts(112,9): error TS2322: Type '"analytics"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   580. src/lib/analytics/reporting.ts(226,9): error TS2322: Type '"analytics"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   581. src/lib/analytics/reporting.ts(385,9): error TS2322: Type '"analytics"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   582. src/lib/analytics/tracker.ts(6,5): error TS2687: All declarations of 'gtag' must have identical modifiers.
   583. src/lib/analytics/tracker.ts(7,5): error TS2687: All declarations of 'dataLayer' must have identical modifiers.
   584. src/lib/analytics/tracker.ts(531,36): error TS2339: Property 'getCLS' does not exist on type 'typeof import("/Users/eshancheema/Documents/RAG_Apps/Website_Zoptal/node_modules/.pnpm/web-vitals@5.1.0/node_modules/web-vitals/dist/modules/index")'.
   585. src/lib/analytics/tracker.ts(531,44): error TS2339: Property 'getFID' does not exist on type 'typeof import("/Users/eshancheema/Documents/RAG_Apps/Website_Zoptal/node_modules/.pnpm/web-vitals@5.1.0/node_modules/web-vitals/dist/modules/index")'.
   586. src/lib/analytics/tracker.ts(531,52): error TS2339: Property 'getFCP' does not exist on type 'typeof import("/Users/eshancheema/Documents/RAG_Apps/Website_Zoptal/node_modules/.pnpm/web-vitals@5.1.0/node_modules/web-vitals/dist/modules/index")'.
   587. src/lib/analytics/tracker.ts(531,60): error TS2339: Property 'getLCP' does not exist on type 'typeof import("/Users/eshancheema/Documents/RAG_Apps/Website_Zoptal/node_modules/.pnpm/web-vitals@5.1.0/node_modules/web-vitals/dist/modules/index")'.
   588. src/lib/analytics/tracker.ts(531,68): error TS2339: Property 'getTTFB' does not exist on type 'typeof import("/Users/eshancheema/Documents/RAG_Apps/Website_Zoptal/node_modules/.pnpm/web-vitals@5.1.0/node_modules/web-vitals/dist/modules/index")'.
   589. src/lib/analytics/tracker.ts(532,17): error TS7006: Parameter 'metric' implicitly has an 'any' type.
   590. src/lib/analytics/tracker.ts(533,17): error TS7006: Parameter 'metric' implicitly has an 'any' type.
   591. src/lib/analytics/tracker.ts(534,17): error TS7006: Parameter 'metric' implicitly has an 'any' type.
   592. src/lib/analytics/tracker.ts(535,17): error TS7006: Parameter 'metric' implicitly has an 'any' type.
   593. src/lib/analytics/tracker.ts(536,18): error TS7006: Parameter 'metric' implicitly has an 'any' type.
   594. src/lib/api/client.ts(19,18): error TS2395: Individual declarations in merged declaration 'ApiError' must be all exported or all local.
   595. src/lib/api/client.ts(146,13): error TS18046: 'error' is of type 'unknown'.
   596. src/lib/api/client.ts(158,22): error TS2454: Variable 'lastError' is used before being assigned.
   597. src/lib/api/client.ts(159,7): error TS2454: Variable 'lastError' is used before being assigned.
   598. src/lib/api/client.ts(262,7): error TS2395: Individual declarations in merged declaration 'ApiError' must be all exported or all local.
   599. src/lib/auth/jwt.ts(33,16): error TS2769: No overload matches this call.
   600.   Overload 1 of 5, '(payload: string | object | Buffer<ArrayBufferLike>, secretOrPrivateKey: null, options?: (SignOptions & { algorithm: "none"; }) | undefined): string', gave the following error.
   601.     Argument of type 'string' is not assignable to parameter of type 'null'.
   602.   Overload 2 of 5, '(payload: string | object | Buffer<ArrayBufferLike>, secretOrPrivateKey: Buffer<ArrayBufferLike> | Secret | PrivateKeyInput | JsonWebKeyInput, options?: SignOptions | undefined): string', gave the following error.
   603.     Type 'string' is not assignable to type 'number | StringValue | undefined'.
   604.   Overload 3 of 5, '(payload: string | object | Buffer<ArrayBufferLike>, secretOrPrivateKey: Buffer<ArrayBufferLike> | Secret | PrivateKeyInput | JsonWebKeyInput, callback: SignCallback): void', gave the following error.
   605.     Object literal may only specify known properties, and 'expiresIn' does not exist in type 'SignCallback'.
   606. src/lib/auth/jwt.ts(50,16): error TS2769: No overload matches this call.
   607.   Overload 1 of 5, '(payload: string | object | Buffer<ArrayBufferLike>, secretOrPrivateKey: null, options?: (SignOptions & { algorithm: "none"; }) | undefined): string', gave the following error.
   608.     Argument of type 'string' is not assignable to parameter of type 'null'.
   609.   Overload 2 of 5, '(payload: string | object | Buffer<ArrayBufferLike>, secretOrPrivateKey: Buffer<ArrayBufferLike> | Secret | PrivateKeyInput | JsonWebKeyInput, options?: SignOptions | undefined): string', gave the following error.
   610.     Type 'string' is not assignable to type 'number | StringValue | undefined'.
   611.   Overload 3 of 5, '(payload: string | object | Buffer<ArrayBufferLike>, secretOrPrivateKey: Buffer<ArrayBufferLike> | Secret | PrivateKeyInput | JsonWebKeyInput, callback: SignCallback): void', gave the following error.
   612.     Object literal may only specify known properties, and 'expiresIn' does not exist in type 'SignCallback'.
   613. src/lib/auth/password.ts(1,20): error TS7016: Could not find a declaration file for module 'bcryptjs'. '/Users/eshancheema/Documents/RAG_Apps/Website_Zoptal/node_modules/.pnpm/bcryptjs@2.4.3/node_modules/bcryptjs/index.js' implicitly has an 'any' type.
   614.   Try `npm i --save-dev @types/bcryptjs` if it exists or add a new declaration (.d.ts) file containing `declare module 'bcryptjs';`
   615. src/lib/case-studies/data.ts(517,52): error TS18048: 'filters.industry' is possibly 'undefined'.
   616. src/lib/cms/cache.ts(101,31): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
   617.   Type 'undefined' is not assignable to type 'string'.
   618. src/lib/cms/cache.ts(160,52): error TS2339: Property 'staleWhileRevalidate' does not exist on type 'CachedEntry<any>'.
   619. src/lib/cms/cache.ts(394,29): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   620. src/lib/cms/cache.ts(396,3): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   621. src/lib/cms/content-manager.ts(191,7): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   622. src/lib/cms/content-manager.ts(255,7): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   623. src/lib/cms/content-manager.ts(343,7): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   624. src/lib/cms/content-manager.ts(367,7): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   625. src/lib/cms/content-manager.ts(387,7): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   626. src/lib/cms/content-manager.ts(463,7): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   627. src/lib/cms/content-manager.ts(552,7): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   628. src/lib/cms/content-manager.ts(606,9): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   629. src/lib/cms/content-manager.ts(648,9): error TS2322: Type '"cms"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   630. src/lib/cms/contentful.ts(8,38): error TS2305: Module '"contentful"' has no exported member 'ContentfulApi'.
   631. src/lib/cms/contentful.ts(50,17): error TS2344: Type 'AuthorFields' does not satisfy the constraint 'EntrySkeletonType'.
   632.   Type 'AuthorFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   633. src/lib/cms/contentful.ts(51,19): error TS2344: Type 'CategoryFields' does not satisfy the constraint 'EntrySkeletonType'.
   634.   Type 'CategoryFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   635. src/lib/cms/contentful.ts(52,15): error TS2344: Type 'TagFields' does not satisfy the constraint 'EntrySkeletonType'.
   636.   Type 'TagFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   637. src/lib/cms/contentful.ts(76,22): error TS2344: Type 'TestimonialFields' does not satisfy the constraint 'EntrySkeletonType'.
   638.   Type 'TestimonialFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   639. src/lib/cms/contentful.ts(90,19): error TS2344: Type 'ServiceCategoryFields' does not satisfy the constraint 'EntrySkeletonType'.
   640.   Type 'ServiceCategoryFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   641. src/lib/cms/contentful.ts(93,18): error TS2344: Type 'ProcessStepFields' does not satisfy the constraint 'EntrySkeletonType'.
   642.   Type 'ProcessStepFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   643. src/lib/cms/contentful.ts(99,15): error TS2344: Type 'FAQFields' does not satisfy the constraint 'EntrySkeletonType'.
   644.   Type 'FAQFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   645. src/lib/cms/contentful.ts(100,22): error TS2344: Type 'CaseStudyFields' does not satisfy the constraint 'EntrySkeletonType'.
   646.   Type 'CaseStudyFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   647. src/lib/cms/contentful.ts(122,19): error TS2344: Type 'CaseStudyFields' does not satisfy the constraint 'EntrySkeletonType'.
   648.   Type 'CaseStudyFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   649. src/lib/cms/contentful.ts(123,23): error TS2344: Type 'TestimonialFields' does not satisfy the constraint 'EntrySkeletonType'.
   650.   Type 'TestimonialFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   651. src/lib/cms/contentful.ts(161,18): error TS2344: Type 'CaseStudyFields' does not satisfy the constraint 'EntrySkeletonType'.
   652.   Type 'CaseStudyFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   653. src/lib/cms/contentful.ts(190,30): error TS2344: Type 'BlogPostFields' does not satisfy the constraint 'EntrySkeletonType'.
   654.   Type 'BlogPostFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   655. src/lib/cms/contentful.ts(191,31): error TS2344: Type 'CaseStudyFields' does not satisfy the constraint 'EntrySkeletonType'.
   656.   Type 'CaseStudyFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   657. src/lib/cms/contentful.ts(192,29): error TS2344: Type 'ServiceFields' does not satisfy the constraint 'EntrySkeletonType'.
   658.   Type 'ServiceFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   659. src/lib/cms/contentful.ts(193,32): error TS2344: Type 'TeamMemberFields' does not satisfy the constraint 'EntrySkeletonType'.
   660.   Type 'TeamMemberFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   661. src/lib/cms/contentful.ts(194,28): error TS2344: Type 'AuthorFields' does not satisfy the constraint 'EntrySkeletonType'.
   662.   Type 'AuthorFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   663. src/lib/cms/contentful.ts(195,30): error TS2344: Type 'CategoryFields' does not satisfy the constraint 'EntrySkeletonType'.
   664.   Type 'CategoryFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   665. src/lib/cms/contentful.ts(196,25): error TS2344: Type 'TagFields' does not satisfy the constraint 'EntrySkeletonType'.
   666.   Type 'TagFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   667. src/lib/cms/contentful.ts(197,33): error TS2344: Type 'TestimonialFields' does not satisfy the constraint 'EntrySkeletonType'.
   668.   Type 'TestimonialFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   669. src/lib/cms/contentful.ts(198,37): error TS2344: Type 'ServiceCategoryFields' does not satisfy the constraint 'EntrySkeletonType'.
   670.   Type 'ServiceCategoryFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   671. src/lib/cms/contentful.ts(199,33): error TS2344: Type 'ProcessStepFields' does not satisfy the constraint 'EntrySkeletonType'.
   672.   Type 'ProcessStepFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   673. src/lib/cms/contentful.ts(200,25): error TS2344: Type 'FAQFields' does not satisfy the constraint 'EntrySkeletonType'.
   674.   Type 'FAQFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   675. src/lib/cms/hooks.ts(249,37): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   676. src/lib/cms/hooks.ts(251,3): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   677. src/lib/cms/hooks.ts(276,38): error TS2339: Property 'readingTime' does not exist on type '{} | {}'.
   678.   Property 'readingTime' does not exist on type '{}'.
   679. src/lib/cms/hooks.ts(277,49): error TS2339: Property 'publishDate' does not exist on type '{} | {}'.
   680.   Property 'publishDate' does not exist on type '{}'.
   681. src/lib/cms/hooks.ts(282,34): error TS2339: Property 'excerpt' does not exist on type '{} | {}'.
   682.   Property 'excerpt' does not exist on type '{}'.
   683. src/lib/cms/hooks.ts(283,31): error TS2339: Property 'tags' does not exist on type '{} | {}'.
   684.   Property 'tags' does not exist on type '{}'.
   685. src/lib/cms/hooks.ts(283,41): error TS7006: Parameter 'tag' implicitly has an 'any' type.
   686. src/lib/cms/hooks.ts(284,33): error TS2339: Property 'author' does not exist on type '{} | {}'.
   687.   Property 'author' does not exist on type '{}'.
   688. src/lib/cms/hooks.ts(285,35): error TS2339: Property 'category' does not exist on type '{} | {}'.
   689.   Property 'category' does not exist on type '{}'.
   690. src/lib/cms/hooks.ts(297,49): error TS2339: Property 'publishDate' does not exist on type '{} | {}'.
   691.   Property 'publishDate' does not exist on type '{}'.
   692. src/lib/cms/hooks.ts(302,38): error TS2339: Property 'testimonial' does not exist on type '{} | {}'.
   693.   Property 'testimonial' does not exist on type '{}'.
   694. src/lib/cms/hooks.ts(303,39): error TS2339: Property 'technologies' does not exist on type '{} | {}'.
   695.   Property 'technologies' does not exist on type '{}'.
   696. src/lib/cms/hooks.ts(304,41): error TS2339: Property 'results' does not exist on type '{} | {}'.
   697.   Property 'results' does not exist on type '{}'.
   698. src/lib/cms/hooks.ts(305,30): error TS2339: Property 'results' does not exist on type '{} | {}'.
   699.   Property 'results' does not exist on type '{}'.
   700. src/lib/cms/hooks.ts(306,29): error TS2339: Property 'results' does not exist on type '{} | {}'.
   701.   Property 'results' does not exist on type '{}'.
   702. src/lib/cms/server.ts(42,42): error TS2339: Property 'slug' does not exist on type '{} | {}'.
   703.   Property 'slug' does not exist on type '{}'.
   704. src/lib/cms/server.ts(83,58): error TS2339: Property 'slug' does not exist on type '{} | {}'.
   705.   Property 'slug' does not exist on type '{}'.
   706. src/lib/cms/server.ts(123,51): error TS2339: Property 'slug' does not exist on type '{} | {}'.
   707.   Property 'slug' does not exist on type '{}'.
   708. src/lib/cms/server.ts(303,71): error TS2339: Property 'industry' does not exist on type '{} | {}'.
   709.   Property 'industry' does not exist on type '{}'.
   710. src/lib/cms/server.ts(304,77): error TS2339: Property 'technologies' does not exist on type '{} | {}'.
   711.   Property 'technologies' does not exist on type '{}'.
   712. src/lib/cms/server.ts(360,75): error TS2339: Property 'skills' does not exist on type '{} | {}'.
   713.   Property 'skills' does not exist on type '{}'.
   714. src/lib/cms/server.ts(361,74): error TS2339: Property 'location' does not exist on type '{} | {}'.
   715.   Property 'location' does not exist on type '{}'.
   716. src/lib/cms/types.ts(17,14): error TS2344: Type 'BlogPostFields' does not satisfy the constraint 'EntrySkeletonType'.
   717.   Type 'BlogPostFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   718. src/lib/cms/types.ts(32,14): error TS2344: Type 'CaseStudyFields' does not satisfy the constraint 'EntrySkeletonType'.
   719.   Type 'CaseStudyFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   720. src/lib/cms/types.ts(43,14): error TS2344: Type 'ServiceFields' does not satisfy the constraint 'EntrySkeletonType'.
   721.   Type 'ServiceFields' is missing the following properties from type 'EntrySkeletonType': fields, contentTypeId
   722. src/lib/cms/utils.ts(130,16): error TS2344: Type 'T' does not satisfy the constraint 'EntrySkeletonType'.
   723. src/lib/cms/utils.ts(136,19): error TS2536: Type 'keyof T' cannot be used to index type '{ [FieldName in keyof T["fields"]]: { [x: string]: ResolvedField<T["fields"][FieldName], ChainModifiers, string> | undefined; }; } | { [FieldName in keyof T["fields"]]: ResolvedField<...>; }'.
   724. src/lib/cms/utils.ts(231,26): error TS2339: Property 'sys' does not exist on type 'T'.
   725. src/lib/cms/utils.ts(231,49): error TS2339: Property 'sys' does not exist on type 'T'.
   726. src/lib/cms/utils.ts(342,5): error TS2322: Type '{ readingTime: any; excerpt: any; formattedDate: string; featuredImageUrl: string; authorName: any; categoryName: any; tagNames: any; publishDate: any; }' is not assignable to type 'BlogPostFields & { readingTime: number; excerpt: string; formattedDate: string; featuredImageUrl: string; authorName: string; categoryName: string; tagNames: string[]; publishDate: string; }'.
   727.   Type '{ readingTime: any; excerpt: any; formattedDate: string; featuredImageUrl: string; authorName: any; categoryName: any; tagNames: any; publishDate: any; }' is missing the following properties from type 'BlogPostFields': title, slug, content, featuredImage, and 7 more.
   728. src/lib/cms/utils.ts(344,32): error TS2339: Property 'readingTime' does not exist on type '{} | {}'.
   729.   Property 'readingTime' does not exist on type '{}'.
   730. src/lib/cms/utils.ts(344,80): error TS2339: Property 'content' does not exist on type '{} | {}'.
   731.   Property 'content' does not exist on type '{}'.
   732. src/lib/cms/utils.ts(345,28): error TS2339: Property 'excerpt' does not exist on type '{} | {}'.
   733.   Property 'excerpt' does not exist on type '{}'.
   734. src/lib/cms/utils.ts(345,67): error TS2339: Property 'content' does not exist on type '{} | {}'.
   735.   Property 'content' does not exist on type '{}'.
   736. src/lib/cms/utils.ts(346,45): error TS2339: Property 'publishDate' does not exist on type '{} | {}'.
   737.   Property 'publishDate' does not exist on type '{}'.
   738. src/lib/cms/utils.ts(347,58): error TS2339: Property 'featuredImage' does not exist on type '{} | {}'.
   739.   Property 'featuredImage' does not exist on type '{}'.
   740. src/lib/cms/utils.ts(353,31): error TS2339: Property 'author' does not exist on type '{} | {}'.
   741.   Property 'author' does not exist on type '{}'.
   742. src/lib/cms/utils.ts(354,33): error TS2339: Property 'category' does not exist on type '{} | {}'.
   743.   Property 'category' does not exist on type '{}'.
   744. src/lib/cms/utils.ts(355,29): error TS2339: Property 'tags' does not exist on type '{} | {}'.
   745.   Property 'tags' does not exist on type '{}'.
   746. src/lib/cms/utils.ts(356,32): error TS2339: Property 'publishDate' does not exist on type '{} | {}'.
   747.   Property 'publishDate' does not exist on type '{}'.
   748. src/lib/cms/utils.ts(364,5): error TS2322: Type '{ formattedDate: string; featuredImageUrl: string; galleryUrls: any; clientTestimonial: any; technologiesUsed: any; }' is not assignable to type 'CaseStudyFields & { formattedDate: string; featuredImageUrl: string; galleryUrls: string[]; clientTestimonial: any; technologiesUsed: string[]; }'.
   749.   Type '{ formattedDate: string; featuredImageUrl: string; galleryUrls: any; clientTestimonial: any; technologiesUsed: any; }' is missing the following properties from type 'CaseStudyFields': title, slug, client, industry, and 15 more.
   750. src/lib/cms/utils.ts(366,50): error TS2339: Property 'publishDate' does not exist on type '{} | {}'.
   751.   Property 'publishDate' does not exist on type '{}'.
   752. src/lib/cms/utils.ts(367,63): error TS2339: Property 'featuredImage' does not exist on type '{} | {}'.
   753.   Property 'featuredImage' does not exist on type '{}'.
   754. src/lib/cms/utils.ts(373,37): error TS2339: Property 'gallery' does not exist on type '{} | {}'.
   755.   Property 'gallery' does not exist on type '{}'.
   756. src/lib/cms/utils.ts(381,43): error TS2339: Property 'testimonial' does not exist on type '{} | {}'.
   757.   Property 'testimonial' does not exist on type '{}'.
   758. src/lib/cms/utils.ts(382,42): error TS2339: Property 'technologies' does not exist on type '{} | {}'.
   759.   Property 'technologies' does not exist on type '{}'.
   760. src/lib/cms/utils.ts(390,5): error TS2322: Type '{ iconUrl: string; featuredImageUrl: string; categoryName: any; processSteps: any; faqList: any; relatedCaseStudies: any; }' is not assignable to type 'ServiceFields & { iconUrl: string; featuredImageUrl: string; categoryName: string; processSteps: any[]; faqList: any[]; relatedCaseStudies: TransformedCaseStudy[]; }'.
   761.   Type '{ iconUrl: string; featuredImageUrl: string; categoryName: any; processSteps: any; faqList: any; relatedCaseStudies: any; }' is missing the following properties from type 'ServiceFields': name, slug, shortDescription, fullDescription, and 17 more.
   762. src/lib/cms/utils.ts(392,52): error TS2339: Property 'icon' does not exist on type '{} | {}'.
   763.   Property 'icon' does not exist on type '{}'.
   764. src/lib/cms/utils.ts(398,61): error TS2339: Property 'featuredImage' does not exist on type '{} | {}'.
   765.   Property 'featuredImage' does not exist on type '{}'.
   766. src/lib/cms/utils.ts(404,36): error TS2339: Property 'category' does not exist on type '{} | {}'.
   767.   Property 'category' does not exist on type '{}'.
   768. src/lib/cms/utils.ts(405,36): error TS2339: Property 'process' does not exist on type '{} | {}'.
   769.   Property 'process' does not exist on type '{}'.
   770. src/lib/cms/utils.ts(406,31): error TS2339: Property 'faqs' does not exist on type '{} | {}'.
   771.   Property 'faqs' does not exist on type '{}'.
   772. src/lib/cms/utils.ts(407,42): error TS2339: Property 'caseStudies' does not exist on type '{} | {}'.
   773.   Property 'caseStudies' does not exist on type '{}'.
   774. src/lib/contentful/api.ts(94,7): error TS2322: Type 'string' is not assignable to type '(OrderFilterPaths<EntrySys, "sys"> | "sys.contentType.sys.id" | "-sys.contentType.sys.id")[]'.
   775. src/lib/contentful/api.ts(151,7): error TS2322: Type 'string' is not assignable to type '(OrderFilterPaths<EntrySys, "sys"> | "sys.contentType.sys.id" | "-sys.contentType.sys.id")[]'.
   776. src/lib/contentful/api.ts(210,7): error TS2322: Type 'string' is not assignable to type '(OrderFilterPaths<EntrySys, "sys"> | "sys.contentType.sys.id" | "-sys.contentType.sys.id" | `fields.${string}` | `-fields.${string}` | `fields.${string}.sys.id` | `-fields.${string}.sys.id`)[]'.
   777. src/lib/contentful/api.ts(264,45): error TS2345: Argument of type '{ content_type: string; 'fields.slug[ne]': string; 'fields.category': string | undefined; limit: number; order: string; }' is not assignable to parameter of type 'EntriesQueries<EntrySkeletonType, undefined> | undefined'.
   778.   Types of property 'order' are incompatible.
   779.     Type 'string' is not assignable to type '(OrderFilterPaths<EntrySys, "sys"> | "sys.contentType.sys.id" | "-sys.contentType.sys.id")[] | (OrderFilterPaths<EntrySys, "sys"> | ... 5 more ... | `-fields.${string}.sys.id`)[] | undefined'.
   780. src/lib/email/automation.ts(43,67): error TS2345: Argument of type 'LeadSegment' is not assignable to parameter of type 'string'.
   781. src/lib/email/email-service.ts(224,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   782. src/lib/email/email-service.ts(239,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   783. src/lib/email/email-service.ts(241,18): error TS18046: 'error' is of type 'unknown'.
   784. src/lib/email/email-service.ts(264,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   785. src/lib/email/email-service.ts(298,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   786. src/lib/email/email-service.ts(337,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   787. src/lib/email/email-service.ts(384,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   788. src/lib/email/email-service.ts(450,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   789. src/lib/email/email-service.ts(499,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   790. src/lib/email/email-service.ts(547,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   791. src/lib/email/email-service.ts(580,9): error TS2322: Type '"email"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   792. src/lib/email/sequences.ts(81,5): error TS2322: Type 'string' is not assignable to type 'LeadSegment'.
   793. src/lib/email/sequences.ts(130,5): error TS2322: Type 'string' is not assignable to type 'LeadSegment'.
   794. src/lib/email/sequences.ts(185,5): error TS2322: Type 'string' is not assignable to type 'LeadSegment'.
   795. src/lib/email/sequences.ts(248,5): error TS2322: Type 'string' is not assignable to type 'LeadSegment'.
   796. src/lib/email/sequences.ts(312,5): error TS2322: Type 'string' is not assignable to type 'LeadSegment'.
   797. src/lib/email/sequences.ts(414,5): error TS2367: This comparison appears to be unintentional because the types 'LeadSegment | undefined' and 'string' have no overlap.
   798. src/lib/error-tracking.tsx(5,36): error TS2307: Cannot find module '@zoptal/error-tracking' or its corresponding type declarations.
   799. src/lib/error-tracking.tsx(42,25): error TS2339: Property 'name' does not exist on type 'TransactionEvent'.
   800. src/lib/error-tracking.tsx(43,25): error TS2339: Property 'name' does not exist on type 'TransactionEvent'.
   801. src/lib/error-tracking.tsx(44,25): error TS2339: Property 'name' does not exist on type 'TransactionEvent'.
   802. src/lib/error-tracking.tsx(212,10): error TS2339: Property 'error_type' does not exist on type '{ component: string; route: string; }'.
   803. src/lib/error-tracking.tsx(213,10): error TS2339: Property 'target_route' does not exist on type '{ component: string; route: string; }'.
   804. src/lib/error-tracking.tsx(215,10): error TS2339: Property 'error_type' does not exist on type '{ component: string; route: string; }'.
   805. src/lib/error-tracking.tsx(216,10): error TS2339: Property 'component_name' does not exist on type '{ component: string; route: string; }'.
   806. src/lib/error-tracking.tsx(218,10): error TS2339: Property 'error_type' does not exist on type '{ component: string; route: string; }'.
   807. src/lib/error-tracking.tsx(219,10): error TS2339: Property 'endpoint' does not exist on type '{ component: string; route: string; }'.
   808. src/lib/error-tracking.tsx(220,10): error TS2339: Property 'status_code' does not exist on type '{ component: string; route: string; }'.
   809. src/lib/error-tracking.tsx(222,10): error TS2339: Property 'error_type' does not exist on type '{ component: string; route: string; }'.
   810. src/lib/error-tracking.tsx(223,10): error TS2339: Property 'auth_reason' does not exist on type '{ component: string; route: string; }'.
   811. src/lib/error-tracking.tsx(343,5): error TS2322: Type 'ComponentType<{ error: Error; resetError: () => void; }> | (({ error, resetError }: { error: Error; componentStack: string; eventId: string; resetError(): void; }) => Element)' is not assignable to type 'ReactElement<any, string | JSXElementConstructor<any>> | FallbackRender | undefined'.
   812.   Type 'ComponentClass<{ error: Error; resetError: () => void; }, any>' is not assignable to type 'ReactElement<any, string | JSXElementConstructor<any>> | FallbackRender | undefined'.
   813. src/lib/error-tracking.tsx(353,25): error TS18047: 'info' is possibly 'null'.
   814. src/lib/error-tracking.tsx(353,30): error TS2339: Property 'componentStack' does not exist on type 'string'.
   815. src/lib/lead-capture/lead-manager.ts(336,5): error TS2322: Type 'unknown[]' is not assignable to type 'string[]'.
   816.   Type 'unknown' is not assignable to type 'string'.
   817. src/lib/lead-capture/lead-manager.ts(336,34): error TS7006: Parameter 'p' implicitly has an 'any' type.
   818. src/lib/location/types.ts(40,18): error TS2430: Interface 'LocationPageData' incorrectly extends interface 'LocationData'.
   819.   Types of property 'industries' are incompatible.
   820.     Type '{ title: string; description: string; list: { name: string; description: string; icon: string; caseStudies?: string[] | undefined; }[]; }' is missing the following properties from type 'string[]': length, pop, push, concat, and 29 more.
   821. src/lib/notifications/push-notifications.ts(150,18): error TS18046: 'error' is of type 'unknown'.
   822. src/lib/notifications/push-notifications.ts(207,9): error TS2353: Object literal may only specify known properties, and 'image' does not exist in type 'NotificationOptions'.
   823. src/lib/performance/image-optimizer.ts(146,18): error TS18046: 'error' is of type 'unknown'.
   824. src/lib/performance/performance-monitor.ts(240,11): error TS7034: Variable 'violations' implicitly has type 'any[]' in some locations where its type cannot be determined.
   825. src/lib/performance/performance-monitor.ts(257,7): error TS7005: Variable 'violations' implicitly has an 'any[]' type.
   826. src/lib/performance/performance-monitor.ts(937,33): error TS2304: Cannot find name 'useState'.
   827. src/lib/performance/performance-monitor.ts(938,31): error TS2304: Cannot find name 'useState'.
   828. src/lib/performance/performance-monitor.ts(940,3): error TS2304: Cannot find name 'useEffect'.
   829. src/lib/performance/web-vitals.tsx(3,10): error TS2305: Module '"web-vitals"' has no exported member 'getCLS'.
   830. src/lib/performance/web-vitals.tsx(3,18): error TS2305: Module '"web-vitals"' has no exported member 'getFID'.
   831. src/lib/performance/web-vitals.tsx(3,26): error TS2305: Module '"web-vitals"' has no exported member 'getFCP'.
   832. src/lib/performance/web-vitals.tsx(3,34): error TS2305: Module '"web-vitals"' has no exported member 'getLCP'.
   833. src/lib/performance/web-vitals.tsx(3,42): error TS2305: Module '"web-vitals"' has no exported member 'getTTFB'.
   834. src/lib/performance/web-vitals.tsx(84,13): error TS7006: Parameter 'metric' implicitly has an 'any' type.
   835. src/lib/performance/web-vitals.tsx(85,13): error TS7006: Parameter 'metric' implicitly has an 'any' type.
   836. src/lib/performance/web-vitals.tsx(86,13): error TS7006: Parameter 'metric' implicitly has an 'any' type.
   837. src/lib/performance/web-vitals.tsx(87,13): error TS7006: Parameter 'metric' implicitly has an 'any' type.
   838. src/lib/performance/web-vitals.tsx(88,14): error TS7006: Parameter 'metric' implicitly has an 'any' type.
   839. src/lib/performance/web-vitals.tsx(140,51): error TS2339: Property 'domLoading' does not exist on type 'PerformanceNavigationTiming'.
   840. src/lib/performance/web-vitals.tsx(232,10): error TS2322: Type 'PropsWithoutRef<ComponentProps<T>> & { ref: ForwardedRef<any>; }' is not assignable to type 'IntrinsicAttributes & (T extends MemoExoticComponent<infer U extends ComponentType<any>> | LazyExoticComponent<infer U extends ComponentType<...>> ? ReactManagedAttributes<...> : ReactManagedAttributes<...>)'.
   841.   Type 'PropsWithoutRef<ComponentProps<T>> & { ref: ForwardedRef<any>; }' is not assignable to type 'T extends MemoExoticComponent<infer U extends ComponentType<any>> | LazyExoticComponent<infer U extends ComponentType<any>> ? ReactManagedAttributes<...> : ReactManagedAttributes<...>'.
   842. src/lib/pwa/service-worker-manager.ts(189,18): error TS2304: Cannot find name 'NetworkInformation'.
   843. src/lib/pwa/service-worker-manager.ts(371,37): error TS2345: Argument of type 'Dispatch<SetStateAction<{ cacheNames: never[]; totalSize: number; }>>' is not assignable to parameter of type '(value: { cacheNames: string[]; totalSize: number; }) => void | PromiseLike<void>'.
   844.   Types of parameters 'value' and 'value' are incompatible.
   845.     Type '{ cacheNames: string[]; totalSize: number; }' is not assignable to type 'SetStateAction<{ cacheNames: never[]; totalSize: number; }>'.
   846.       Type '{ cacheNames: string[]; totalSize: number; }' is not assignable to type '{ cacheNames: never[]; totalSize: number; }'.
   847.         Types of property 'cacheNames' are incompatible.
   848.           Type 'string[]' is not assignable to type 'never[]'.
   849.             Type 'string' is not assignable to type 'never'.
   850. src/lib/security/authentication.ts(180,9): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   851. src/lib/security/authentication.ts(196,9): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   852. src/lib/security/authentication.ts(198,18): error TS18046: 'error' is of type 'unknown'.
   853. src/lib/security/authentication.ts(239,20): error TS2353: Object literal may only specify known properties, and 'requiresTwoFactor' does not exist in type '{ user: User; tokens: AuthTokens; }'.
   854. src/lib/security/authentication.ts(268,9): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   855. src/lib/security/authentication.ts(282,9): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   856. src/lib/security/authentication.ts(284,18): error TS18046: 'error' is of type 'unknown'.
   857. src/lib/security/authentication.ts(322,9): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   858. src/lib/security/authentication.ts(332,9): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   859. src/lib/security/authentication.ts(334,18): error TS18046: 'error' is of type 'unknown'.
   860. src/lib/security/authentication.ts(379,11): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   861. src/lib/security/authentication.ts(453,9): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   862. src/lib/security/authentication.ts(461,9): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   863. src/lib/security/authentication.ts(463,18): error TS18046: 'error' is of type 'unknown'.
   864. src/lib/security/authentication.ts(500,9): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   865. src/lib/security/authentication.ts(505,9): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   866. src/lib/security/authentication.ts(507,18): error TS18046: 'error' is of type 'unknown'.
   867. src/lib/security/authentication.ts(540,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   868. src/lib/security/authentication.ts(550,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   869. src/lib/security/authentication.ts(552,18): error TS18046: 'error' is of type 'unknown'.
   870. src/lib/security/authentication.ts(602,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   871. src/lib/security/authentication.ts(612,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   872. src/lib/security/authentication.ts(614,18): error TS18046: 'error' is of type 'unknown'.
   873. src/lib/security/authentication.ts(662,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   874. src/lib/security/authentication.ts(670,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   875. src/lib/security/authentication.ts(672,18): error TS18046: 'error' is of type 'unknown'.
   876. src/lib/security/authentication.ts(743,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   877. src/lib/security/authentication.ts(969,11): error TS2322: Type '"authentication"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   878. src/lib/security/authentication.ts(991,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   879. src/lib/security/authentication.ts(1018,27): error TS2304: Cannot find name 'useState'.
   880. src/lib/security/authentication.ts(1019,37): error TS2304: Cannot find name 'useState'.
   881. src/lib/security/authentication.ts(1021,3): error TS2304: Cannot find name 'useEffect'.
   882. src/lib/security/authorization.tsx(114,9): error TS2322: Type '"authorization"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   883. src/lib/security/authorization.tsx(136,9): error TS2322: Type '"authorization"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   884. src/lib/security/authorization.tsx(141,18): error TS18046: 'error' is of type 'unknown'.
   885. src/lib/security/authorization.tsx(235,11): error TS2322: Type '"authorization"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   886. src/lib/security/authorization.tsx(286,11): error TS2322: Type '"authorization"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   887. src/lib/security/authorization.tsx(320,9): error TS2322: Type '"authorization"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   888. src/lib/security/authorization.tsx(364,9): error TS2322: Type '"authorization"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   889. src/lib/security/authorization.tsx(410,9): error TS2322: Type '"authorization"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   890. src/lib/security/authorization.tsx(814,39): error TS2304: Cannot find name 'useState'.
   891. src/lib/security/authorization.tsx(817,5): error TS2304: Cannot find name 'useEffect'.
   892. src/lib/security/encryption.ts(80,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   893. src/lib/security/encryption.ts(121,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   894. src/lib/security/encryption.ts(166,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   895. src/lib/security/encryption.ts(202,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   896. src/lib/security/encryption.ts(346,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   897. src/lib/security/encryption.ts(371,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   898. src/lib/security/encryption.ts(462,9): error TS2322: Type '"security"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   899. src/lib/security/encryption.ts(551,7): error TS2353: Object literal may only specify known properties, and ''upgrade-insecure-requests'' does not exist in type 'CSPDirectives'.
   900. src/lib/security/geo-blocking.ts(103,75): error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.
   901. src/lib/security/geo-blocking.ts(434,35): error TS2345: Argument of type 'any' is not assignable to parameter of type 'never'.
   902. src/lib/security/geo-blocking.ts(468,32): error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.
   903. src/lib/security/geo-blocking.ts(472,35): error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.
   904. src/lib/security/geo-blocking.ts(484,27): error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.
   905. src/lib/security/geo-blocking.ts(488,30): error TS2345: Argument of type 'string' is not assignable to parameter of type 'never'.
   906. src/lib/security/rate-limiter.ts(368,43): error TS2353: Object literal may only specify known properties, and 'timestamps' does not exist in type '{ count: number; resetTime: number; }'.
   907. src/lib/security/rate-limiter.ts(377,25): error TS2345: Argument of type '{ tokens: number; lastRefill: number; }' is not assignable to parameter of type '{ count: number; resetTime: number; }'.
   908.   Type '{ tokens: number; lastRefill: number; }' is missing the following properties from type '{ count: number; resetTime: number; }': count, resetTime
   909. src/lib/seo/generateMetadata.ts(121,7): error TS2322: Type '"service" | "article" | "website" | "product"' is not assignable to type '"article" | "website"'.
   910.   Type '"service"' is not assignable to type '"article" | "website"'.
   911. src/lib/seo/generateMetadata.ts(161,5): error TS2322: Type '{ 'product:category'?: string | undefined; 'product:brand'?: string | undefined; 'product:availability'?: "InStock" | "OutOfStock" | "PreOrder" | undefined; 'product:price:amount': string; 'product:price:currency': string; 'apple-touch-fullscreen'?: never; 'apple-touch-icon-precomposed'?: never; }' is not assignable to type '{ [name: string]: string | number | (string | number)[]; } & DeprecatedMetadataFields'.
   912.   Type '{ 'product:category'?: string | undefined; 'product:brand'?: string | undefined; 'product:availability'?: "InStock" | "OutOfStock" | "PreOrder" | undefined; 'product:price:amount': string; 'product:price:currency': string; 'apple-touch-fullscreen'?: never; 'apple-touch-icon-precomposed'?: never; }' is not assignable to type '{ [name: string]: string | number | (string | number)[]; }'.
   913.     Property ''apple-touch-fullscreen'' is incompatible with index signature.
   914.       Type 'undefined' is not assignable to type 'string | number | (string | number)[]'.
   915. src/lib/seo/generateMetadata.ts(173,5): error TS2322: Type '{ 'og:locality': string; 'og:region': string; 'og:country': string; 'geo.placename': string; 'geo.region': string; 'apple-touch-fullscreen'?: never; 'apple-touch-icon-precomposed'?: never; }' is not assignable to type '{ [name: string]: string | number | (string | number)[]; } & DeprecatedMetadataFields'.
   916.   Type '{ 'og:locality': string; 'og:region': string; 'og:country': string; 'geo.placename': string; 'geo.region': string; 'apple-touch-fullscreen'?: never; 'apple-touch-icon-precomposed'?: never; }' is not assignable to type '{ [name: string]: string | number | (string | number)[]; }'.
   917.     Property ''apple-touch-fullscreen'' is incompatible with index signature.
   918.       Type 'undefined' is not assignable to type 'string | number | (string | number)[]'.
   919. src/lib/seo/meta-optimization.ts(53,7): error TS2322: Type '"service" | "article" | "website" | "product"' is not assignable to type '"article" | "website"'.
   920.   Type '"service"' is not assignable to type '"article" | "website"'.
   921. src/lib/seo/meta-optimization.ts(97,5): error TS2322: Type '{ publishedTime: string; modifiedTime: string; authors: string[] | undefined; tags: string[] | undefined; } | { publishedTime: string; modifiedTime: string; authors: string[] | undefined; tags: string[] | undefined; } | ... 12 more ... | { ...; }' is not assignable to type 'OpenGraph | null | undefined'.
   922.   Type '{ publishedTime: string; modifiedTime: string; authors: string[] | undefined; tags: string[] | undefined; }' is not assignable to type 'OpenGraph | null | undefined'.
   923.     Type '{ publishedTime: string; modifiedTime: string; authors: string[] | undefined; tags: string[] | undefined; }' is not assignable to type 'OpenGraphArticle'.
   924.       Property 'type' is missing in type '{ publishedTime: string; modifiedTime: string; authors: string[] | undefined; tags: string[] | undefined; }' but required in type '{ type: "article"; publishedTime?: string | undefined; modifiedTime?: string | undefined; expirationTime?: string | undefined; authors?: string | URL | (string | URL)[] | null | undefined; section?: string | ... 1 more ... | undefined; tags?: string | ... 2 more ... | undefined; }'.
   925. src/lib/seo/metadata.ts(177,7): error TS2322: Type '"service" | "article" | "website" | "product"' is not assignable to type '"article" | "website"'.
   926.   Type '"service"' is not assignable to type '"article" | "website"'.
   927. src/lib/testing/ab-testing.ts(133,7): error TS2322: Type '"ab_testing"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   928. src/lib/testing/ab-testing.ts(190,7): error TS2322: Type '"ab_testing"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   929. src/lib/testing/ab-testing.ts(219,7): error TS2322: Type '"ab_testing"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   930. src/lib/testing/ab-testing.ts(289,9): error TS2322: Type '"ab_testing"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   931. src/lib/testing/ab-testing.ts(352,7): error TS2322: Type '"ab_testing"' is not assignable to type '"error" | "performance" | "custom" | "user_interaction" | "business_goal"'.
   932. src/lib/testing/ab-testing.ts(601,33): error TS2304: Cannot find name 'useState'.
   933. src/lib/testing/ab-testing.ts(602,31): error TS2304: Cannot find name 'useState'.
   934. src/lib/testing/ab-testing.ts(604,3): error TS2304: Cannot find name 'useEffect'.
   935. src/lib/testing/ab-testing.ts(623,62): error TS2345: Argument of type 'string | null | undefined' is not assignable to parameter of type 'string | undefined'.
   936.   Type 'null' is not assignable to type 'string | undefined'.
   937. src/lib/utils/bundleOptimization.ts(19,26): error TS2307: Cannot find module 'react-big-calendar' or its corresponding type declarations.
   938. src/lib/utils/bundleOptimization.ts(22,24): error TS2307: Cannot find module 'moment' or its corresponding type declarations.
   939. src/lib/utils/bundleOptimization.ts(23,24): error TS2307: Cannot find module 'lodash' or its corresponding type declarations.
   940. src/lib/utils/bundleOptimization.ts(27,29): error TS2307: Cannot find module '@react-spring/web' or its corresponding type declarations.
   941. src/lib/utils/bundleOptimization.ts(33,32): error TS2307: Cannot find module '../../../app/(auth)/admin/dashboard/page' or its corresponding type declarations.
   942. src/lib/utils/bundleOptimization.ts(34,28): error TS2307: Cannot find module '../../../app/(auth)/admin/users/page' or its corresponding type declarations.
   943. src/lib/utils/bundleOptimization.ts(35,31): error TS2307: Cannot find module '../../../app/(auth)/admin/settings/page' or its corresponding type declarations.
   944. src/lib/utils/bundleOptimization.ts(38,32): error TS2307: Cannot find module '../../../components/features/ProjectBuilder' or its corresponding type declarations.
   945. src/lib/utils/bundleOptimization.ts(39,28): error TS2307: Cannot find module '../../../components/features/CodeEditor' or its corresponding type declarations.
   946. src/lib/utils/bundleOptimization.ts(40,27): error TS2307: Cannot find module '../../../components/features/Analytics' or its corresponding type declarations.
   947. src/lib/utils/bundleOptimization.ts(158,24): error TS2307: Cannot find module 'lodash/debounce' or its corresponding type declarations.
   948. src/lib/utils/bundleOptimization.ts(159,23): error TS2307: Cannot find module 'lodash' or its corresponding type declarations.
   949. src/lib/utils/bundleOptimization.ts(184,37): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   950. src/lib/utils/bundleOptimization.ts(185,33): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   951. src/lib/utils/bundleOptimization.ts(186,29): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   952. src/lib/utils/bundleOptimization.ts(188,3): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   953. src/lib/utils/bundleOptimization.ts(224,33): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   954. src/lib/utils/bundleOptimization.ts(225,49): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   955. src/lib/utils/bundleOptimization.ts(227,3): error TS2686: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
   956. src/lib/utils/responsive.tsx(112,25): error TS7053: Element implicitly has an 'any' type because expression of type '"sm" | "md" | "lg" | "xl" | "xs" | "2xl"' can't be used to index type '{ xs?: T | undefined; sm?: T | undefined; md?: T | undefined; lg?: T | undefined; xl?: T | undefined; '2xl'?: T | undefined; } | (T & object)'.
   957.   Property 'sm' does not exist on type '{ xs?: T | undefined; sm?: T | undefined; md?: T | undefined; lg?: T | undefined; xl?: T | undefined; '2xl'?: T | undefined; } | (T & object)'.
   958. src/lib/utils/responsive.tsx(113,14): error TS7053: Element implicitly has an 'any' type because expression of type '"sm" | "md" | "lg" | "xl" | "xs" | "2xl"' can't be used to index type '{ xs?: T | undefined; sm?: T | undefined; md?: T | undefined; lg?: T | undefined; xl?: T | undefined; '2xl'?: T | undefined; } | (T & object)'.
   959.   Property 'sm' does not exist on type '{ xs?: T | undefined; sm?: T | undefined; md?: T | undefined; lg?: T | undefined; xl?: T | undefined; '2xl'?: T | undefined; } | (T & object)'.
   960. src/middleware.ts(133,20): error TS2367: This comparison appears to be unintentional because the types '"production" | "test"' and '"development"' have no overlap.
   961. src/store/index.ts(228,51): error TS7006: Parameter 'p' implicitly has an 'any' type.
   962. src/store/index.ts(239,51): error TS7006: Parameter 'p' implicitly has an 'any' type.
   963. src/store/index.ts(288,60): error TS7006: Parameter 'n' implicitly has an 'any' type.
   964. src/store/index.ts(297,42): error TS7006: Parameter 'n' implicitly has an 'any' type.
   965. src/store/index.ts(305,58): error TS7006: Parameter 'n' implicitly has an 'any' type.
   966. tests/performance.test.ts(100,68): error TS2551: Property 'navigationStart' does not exist on type 'PerformanceNavigationTiming'. Did you mean 'activationStart'?
   967. tests/performance.test.ts(111,9): error TS2698: Spread types may only be created from object types.
   968. tests/performance.test.ts(116,11): error TS18046: 'webVitals' is of type 'unknown'.
   969. tests/performance.test.ts(117,16): error TS18046: 'webVitals' is of type 'unknown'.
   970. tests/performance.test.ts(120,11): error TS18046: 'webVitals' is of type 'unknown'.
   971. tests/performance.test.ts(121,16): error TS18046: 'webVitals' is of type 'unknown'.
   972. tests/performance.test.ts(124,11): error TS18046: 'webVitals' is of type 'unknown'.
   973. tests/performance.test.ts(125,16): error TS18046: 'webVitals' is of type 'unknown'.
