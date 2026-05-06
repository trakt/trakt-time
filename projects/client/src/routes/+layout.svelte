<script lang="ts">
  import "../style";

  import CoverImage from "$lib/components/background/CoverImage.svelte";
  import CoverProvider from "$lib/components/background/CoverProvider.svelte";
  import AuthProvider from "$lib/features/auth/components/AuthProvider.svelte";
  import BotProvider from "$lib/features/bot-verification/BotProvider.svelte";
  import ConfirmationProvider from "$lib/features/confirmation/ConfirmationProvider.svelte";
  import CookieConsentProvider from "$lib/features/cookie-consent/CookieConsentProvider.svelte";
  import { DeploymentEndpoint } from "$lib/features/deployment/DeploymentEndpoint.js";
  import ErrorProvider from "$lib/features/errors/ErrorProvider.svelte";
  import FeatureFlagProvider from "$lib/features/feature-flag/FeatureFlagProvider.svelte";
  import FilterProvider from "$lib/features/filters/FilterProvider.svelte";
  import LocaleProvider from "$lib/features/i18n/components/LocaleProvider.svelte";
  import NavigationHistoryProvider from "$lib/features/navigation-history/NavigationHistoryProvider.svelte";
  import NavigationProvider from "$lib/features/navigation/NavigationProvider.svelte";
  import GlobalParameterProvider from "$lib/features/parameters/GlobalParameterProvider.svelte";
  import QueryClientProvider from "$lib/features/query/QueryClientProvider.svelte";
  import RedirectProvider from "$lib/features/redirect/RedirectProvider.svelte";
  import SearchProvider from "$lib/features/search/SearchProvider.svelte";
  import ThemeProvider from "$lib/features/theme/components/ThemeProvider.svelte";
  import ToastProvider from "$lib/features/toast/ToastProvider.svelte";
  import WSInvalidator from "$lib/features/websocket/WSInvalidator.svelte";
  import RenderFor from "$lib/guards/RenderFor.svelte";
  import BottomNav from "$lib/sections/bottom-nav/BottomNav.svelte";
  import MarkAsWatchedDrawerProvider from "$lib/sections/media-actions/mark-as-watched/MarkAsWatchedDrawerProvider.svelte";
  import NavbarToastContent from "$lib/sections/toast/NavbarToastContent.svelte";
  import { isPWA } from "$lib/utils/devices/isPWA.ts";
  import { retry } from "$lib/utils/retry/retry.js";
  import { WorkerMessage } from "$worker/WorkerMessage";
  import { workerRequest } from "$worker/workerRequest";
  import { SvelteQueryDevtools } from "@tanstack/svelte-query-devtools";
  import { onMount } from "svelte";

  const { data, children } = $props();

  const shareTitle = "Trakt Time";
  const shareDescription = "Track your shows & movies.";
  const shareImage = $derived(`${data.origin}/og.jpg`);

  onMount(async () => {
    if (isPWA()) {
      document.body.classList.add("trakt-pwa");
    }

    const activeSha = TRAKT_GIT_SHA;
    const deployedSha = await retry(() => fetch(DeploymentEndpoint.Get)).then(
      (res) => res.text(),
    );

    if (activeSha === deployedSha) {
      return;
    }

    await workerRequest(WorkerMessage.CacheBust);
  });
</script>

<svelte:head>
  <title>Trakt Time</title>

  <!-- Share / OG defaults — shows when the URL is pasted into Slack, Discord, iMessage, etc. -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={shareTitle} />
  <meta property="og:title" content={shareTitle} />
  <meta property="og:description" content={shareDescription} />
  <meta property="og:image" content={shareImage} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={shareTitle} />
  <meta name="twitter:description" content={shareDescription} />
  <meta name="twitter:image" content={shareImage} />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    rel="preconnect"
    href="https://walter-r2.trakt.tv"
    crossorigin="anonymous"
  />
  <link
    rel="preconnect"
    href="https://media.trakt.tv"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@300..700&display=swap"
    rel="stylesheet"
  />
  <style>
    html,
    body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: -webkit-fill-available;
      height: fill-available;
    }

    html::before {
      content: "";
      height: 100vh;
      width: 100vw;
      z-index: var(--layer-background);
      display: block;
      position: fixed;
      background-color: var(--color-background);
    }

    body {
      max-width: var(--trakttime-max-width);
      margin: 0 auto;
      background-color: var(--color-background);
      color: var(--color-foreground);
      font-family: "Roboto", Arial, sans-serif;
    }

    body:has(dialog[open]),
    body.dialog-open {
      overflow: hidden;
    }
  </style>
</svelte:head>

<ErrorProvider>
  <QueryClientProvider client={data.queryClient}>
    <GlobalParameterProvider>
      <BotProvider isLegitimateBot={data.isLegitimateBot}>
        <AuthProvider
          isAuthorized={data.oidcAuth.isAuthorized}
          accessToken={data.oidcAuth.token}
        >
          <WSInvalidator />
          <FeatureFlagProvider>
            <CookieConsentProvider
              consent={data.cookieConsent}
              isBot={data.isBot}
            >
              <RedirectProvider>
                <NavigationProvider>
                  <NavigationHistoryProvider>
                    <LocaleProvider>
                      <SearchProvider config={data.typesense}>
                        <FilterProvider>
                          <CoverProvider>
                            <ToastProvider>
                              <ConfirmationProvider>
                                <MarkAsWatchedDrawerProvider />
                                <CoverImage />

                                <ThemeProvider theme={data.theme}>
                                  {@render children()}

                                  <RenderFor audience="all">
                                    <BottomNav />
                                  </RenderFor>

                                  <RenderFor audience="authenticated">
                                    <NavbarToastContent />
                                  </RenderFor>
                                  <SvelteQueryDevtools
                                    buttonPosition="bottom-right"
                                    styleNonce="opacity: 0.5"
                                  />
                                </ThemeProvider>
                              </ConfirmationProvider>
                            </ToastProvider>
                          </CoverProvider>
                        </FilterProvider>
                      </SearchProvider>
                    </LocaleProvider>
                  </NavigationHistoryProvider>
                </NavigationProvider>
              </RedirectProvider>
            </CookieConsentProvider>
          </FeatureFlagProvider>
        </AuthProvider>
      </BotProvider>
    </GlobalParameterProvider>
  </QueryClientProvider>
</ErrorProvider>

<style lang="scss">
  @use "$style/scss/mixins/index" as *;

  :global(.tsqd-open-btn-container) {
    opacity: 0.25;
  }
</style>
