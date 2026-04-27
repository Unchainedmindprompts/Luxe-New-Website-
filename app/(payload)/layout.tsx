import { handleServerFunctions } from "@payloadcms/next/layouts";
import config from "@payload-config";
import type { LanguageOptions, SanitizedPermissions, ServerFunctionClient } from "payload";
import { getPayload } from "payload";
import type { AcceptedLanguages } from "@payloadcms/translations";
import { ProgressBar, RootProvider } from "@payloadcms/ui";
import { getClientConfig } from "@payloadcms/ui/utilities/getClientConfig";
import { initI18n } from "@payloadcms/translations";
import { cookies } from "next/headers";
import { importMap } from "./admin/importMap";

const serverFunction: ServerFunctionClient = async (args) => {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

export default async function Layout({ children }: { children: React.ReactNode }) {
  const payload = await getPayload({ config, importMap });
  const resolvedConfig = payload.config;

  const cookieStore = await cookies();
  const prefix = resolvedConfig.cookiePrefix || "payload";
  const langCookie = cookieStore.get(`${prefix}-lng`);
  const languageCode = (langCookie?.value ?? resolvedConfig.i18n.fallbackLanguage ?? "en") as AcceptedLanguages;

  const i18n = await initI18n({
    config: resolvedConfig.i18n,
    context: "client",
    language: languageCode,
  });

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
    user: true,
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
        permissions={null as unknown as SanitizedPermissions}
        serverFunction={serverFunction}
        theme="light"
        translations={i18n.translations}
        user={null}
      >
        <ProgressBar />
        {children}
      </RootProvider>
      <div id="portal" />
    </>
  );
}
