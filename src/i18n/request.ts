import {cookies} from 'next/headers';
import {getRequestConfig} from 'next-intl/server';

export const locales = ['en', 'kh'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export default getRequestConfig(async () => {
    // The profile menu's language switch stores the choice in this cookie.
    const saved = (await cookies()).get('locale')?.value;
    const locale = locales.find((l) => l === saved) ?? defaultLocale;

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default
    };
});
