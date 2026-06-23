function deleteCookie(name) {
    var encodedName = encodeURIComponent(name);
    var hostname = window.location.hostname;

    document.cookie = encodedName + '=; path=/; max-age=0; SameSite=Lax';
    document.cookie = encodedName + '=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

    document.cookie = encodedName + '=; path=/; domain=' + hostname + '; max-age=0; SameSite=Lax';
    document.cookie = encodedName + '=; path=/; domain=.' + hostname + '; max-age=0; SameSite=Lax';
}


function deleteCookiesByPrefix(prefix) {
    document.cookie.split(';').forEach(function (cookie) {
        var name = cookie.split('=')[0].trim();

        if (name.indexOf(prefix) === 0) {
            deleteCookie(name);
        }
    });
}

function deleteAnalyticsCookies() {
    deleteCookie('_ga');
    deleteCookie('_gid');
    deleteCookie('_gat');
    deleteCookiesByPrefix('_ga_');
    deleteCookiesByPrefix('_gat_');
}

function deleteMarketingCookies() {
    deleteCookie('_fbp');
    deleteCookie('_fbc');

    deleteCookie('_ttp');
    deleteCookie('_tt_enable_cookie');
    deleteCookie('_ttclid');
    deleteCookie('ttclid');

    deleteCookiesByPrefix('_fb');
    deleteCookiesByPrefix('_tt');
}

function deletePreferenceCookies() {
    deleteCookie('BOLLang');
}

silktideCookieBannerManager.updateCookieBannerConfig({
    background: {
        showBackground: true
    },
    cookieIcon: {
        position: "bottomRight"
    },
    cookieTypes: [
        {
            id: "necessary",
            name: "Cookies estritamente necessários",
            description: "<p>Essenciais para o bom funcionamento do site, estes cookies não podem ser desativados. Caso contrário, o utilizador terá problemas a aceder ao website e aos seus serviços e ficará impossibilitado de efetuar compras.</p>",
            required: true,
            onAccept: function () {
                console.log('Add logic for the required Necessary here');
            }
        },
        {
            id: "analytics",
            name: "Cookies analíticos",
            description: "<p>Ajudam-nos a perceber de que forma o site é utilizado pelos nossos visitantes, quantas pessoas nos visitam e acedem aos vários tipos de conteúdos. Estes cookies também são utilizados para identificar eventuais problemas e, assim, melhorar a capacidade de navegação no website. Estes cookies produzem apenas estatísticas anónimas e não fornecem informações sobre os visitantes individuais.</p>",
            required: false,
            onAccept: function () {
                if (typeof gtag !== 'undefined') {
                    gtag('consent', 'update', {
                        analytics_storage: 'granted',
                    });
                }

                if (typeof dataLayer !== 'undefined') {
                    dataLayer.push({
                        'event': 'consent_accepted_analytics',
                    });
                }
            },
            onReject: function () {
                if (typeof gtag !== 'undefined') {
                    gtag('consent', 'update', {
                        analytics_storage: 'denied',
                    });
                }

                deleteAnalyticsCookies();
            }
        },
        {
            id: "marketing",
            name: "Cookies de marketing e publicidade",
            description: "<p>Recolhem informação sobre os seus hábitos de navegação de forma a apresentar publicidade que seja relevante para si e esteja de acordo com os seus interesses. Também são utilizados para medir a eficácia das campanhas publicitárias. Estes cookies e o tratamento de dados correspondentes estão sujeitos às políticas de privacidade e cookies desses terceiros.</p>",
            required: false,
            onAccept: function () {
                if (typeof fbq !== 'undefined') {
                    fbq('consent', 'grant');
                }

                if (typeof ttq !== 'undefined' && typeof ttq.grantConsent === 'function') {
                    ttq.grantConsent();
                }

                if (typeof gtag !== 'undefined') {
                    gtag('consent', 'update', {
                        ad_storage: 'granted',
                        ad_user_data: 'granted',
                        ad_personalization: 'granted'
                    });
                }

                if (typeof dataLayer !== 'undefined') {
                    dataLayer.push({
                        'event': 'consent_accepted_marketing',
                    });
                }
            },
            onReject: function () {
                if (typeof fbq !== 'undefined') {
                    fbq('consent', 'revoke');
                }

                if (typeof ttq !== 'undefined' && typeof ttq.revokeConsent === 'function') {
                    ttq.revokeConsent();
                }

                if (typeof gtag !== 'undefined') {
                    gtag('consent', 'update', {
                        ad_storage: 'denied',
                        ad_user_data: 'denied',
                        ad_personalization: 'denied'
                    });
                }

                deleteMarketingCookies();
            }
        },
        {
            id: "preferences",
            name: "Cookies de preferências",
            description: "<p>Estes cookies permitem guardar as suas preferências no site, como idioma, região ou definições de visualização.</p>",
            required: false,
            onAccept: function () {
                // Add logic for preferences cookies here
            },
            onReject: function () {
                deletePreferenceCookies();
            }
        },
    ],
    text: {
        banner: {
            description: "<p>Bem-vindo à BOL!</p><p>O nosso site utiliza cookies essenciais para o funcionamento do site e, com o seu consentimento, cookies que nos ajudam a personalizar a sua experiência e a perceber como a plataforma é utilizada pelos nossos visitantes.</p><p>Ao clicar em \"Aceitar\" concorda com o armazenamento de cookies no seu dispositivo. Para saber mais consulte a nossa <a href=\"/Projecto/PoliticadeCookies\" target=\"_blank\">Política de Cookies</a>, <a href=\"/Ajuda/InformacoesCookies\" target=\"_blank\">Informações Sobre Cookies</a> e <a href=\"/Ajuda/PrivacidadeSeguranca\" target=\"_blank\">Privacidade & Segurança</a>.</p>",
            acceptAllButtonText: "Aceitar",
            acceptAllButtonAccessibleLabel: "Aceitar cookies",
            rejectNonEssentialButtonText: "Rejeitar não essenciais",
            rejectNonEssentialButtonAccessibleLabel: "Rejeitar não essenciais",
            preferencesButtonText: "Gerir Preferências",
            preferencesButtonAccessibleLabel: "Gerir preferências"
        },
        preferences: {
            title: "Personalize as suas preferências de cookies",
            description: "<p>Respeitamos o seu direito à privacidade. Pode optar por não permitir alguns tipos de cookies. As suas preferências de cookies serão aplicadas em todo o nosso site.<br/>Por favor consulte a nossa <a href=\"/Projecto/PoliticadeCookies\" target=\"_blank\">Política de Cookies</a>, <a href=\"/Ajuda/InformacoesCookies\" target=\"_blank\">Informações Sobre Cookies</a> e <a href=\"/Ajuda/PrivacidadeSeguranca\" target=\"_blank\">Privacidade & Segurança</a>.</p>",
            creditLinkText: "Get this banner for free",
            creditLinkAccessibleLabel: "Get this banner for free"
        }
    },
    position: {
        banner: "center"
    },
    showBanner: !(window.cookieNoticeHideBanner === true)
});
