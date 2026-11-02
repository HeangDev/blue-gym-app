"use client"

import { useEffect } from "react"
import { useLocale } from "next-intl"

// Keeps <html lang> in step with the language, so the Khmer font rule in
// globals.css (html:lang(km)) applies. The root layout stays static: reading
// the locale there would make the whole page dynamic.
export function LangSync() {
    const locale = useLocale()

    useEffect(() => {
        document.documentElement.lang = locale === "kh" ? "km" : locale
    }, [locale])

    return null
}
