import "@payloadcms/next/css";
import { handleServerFunctions } from "@payloadcms/next/layouts";
import config from "@payload-config";
import type { LanguageOptions, SanitizedPermissions, ServerFunctionClient } from "payload";
import {
  createLocalReq,
  executeAuthStrategies,
  getAccessResults,
  getPayload,
  getRequestLanguage,
  parseCookies,
} from "payload";
import type { AcceptedLanguages } from "@payloadcms/translations";
import { ProgressBar, RootProvider } from "@payloadcms/ui";
import { getClientConfig } from "@payloadcms/ui/utilities/getClientConfig";
import { initI18n } from "@payloadcms/translations";
import { headers as getHeaders } from "next/headers";
import { importMap } from "./admin/importMap";

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const headers = await getHeaders();
  const cookies = parseCookies(headers);

  const payload = await getPayload({ config, importMap });
  const resolvedConfig = payload.config;

  const languageCode = getRequestLanguage({
    config: resolvedConfig,
    cookies,
    headers,
  }) as AcceptedLanguages;

  const i18n = await initI18n({
    config: resolvedConfig.i18n,
    context: "client",
    language: languageCode,
  });

  const { user } = await executeAuthStrategies({ headers, payload });

  const req = await createLocalReq(
    { req: { headers, host: headers.get("host") ?? "", i18n, user } },
    payload
  );

  const permissions = await getAccessResults({ req });

  // Detect theme from cookie → system header → default
  const prefix = resolvedConfig.cookiePrefix || "payload";
  const themeCookie = cookies.get(`${prefix}-theme`);
  const themeFromCookie = typeof themeCookie === "string" ? themeCookie : (themeCookie as any)?.value;
  const themeFromHeader = headers.get("Sec-CH-Prefers-Color-Scheme");
  const theme =
    (themeFromCookie === "dark" || themeFromCookie === "light" ? themeFromCookie : null) ??
    (themeFromHeader === "dark" || themeFromHeader === "light" ? themeFromHeader : null) ??
    "light";

  const languageOptions: LanguageOptions = Object.entries(
    resolvedConfig.i18n.supportedLanguages ?? {}
  ).map(([lang, langConfig]: [string, any]) => ({
    label: langConfig.translations.general.thisLanguage as string,
    value: lang as AcceptedLanguages,
  }));

  const clientConfig = getClientConfig({
    config: resolvedConfig,
    i18n,
    importMap,
    user: user ?? true,
  });

  return (
    <>
      <style>{`@layer payload-default, payload;`}</style>
      <RootProvider
        config={clientConfig}
        dateFNSKey={i18n.dateFNSKey}
        fallbackLang={resolvedConfig.i18n.fallbackLanguage}
        isNavOpen={true}
        languageCode={languageCode}
        languageOptions={languageOptions}
        locale={undefined}
        permissions={permissions as unknown as SanitizedPermissions}
        serverFunction={serverFunction}
        theme={theme as "light" | "dark"}
        translations={i18n.translations}
        user={user}
      >
        <ProgressBar />
        {children}
      </RootProvider>
      <div id="portal" />
    </>
  );
}
