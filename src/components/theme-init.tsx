"use client"

import { useEffect } from "react"

export function ThemeInit() {
  useEffect(() => {
    const stored = localStorage.getItem("kasemail-theme")
    const theme = stored === "light" || stored === "dark" ? stored : "dark"
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [])

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem("kasemail-theme");if(t==="light"||t==="dark")document.documentElement.classList.toggle("dark",t==="dark");else document.documentElement.classList.add("dark")}catch(e){document.documentElement.classList.add("dark")}})()`,
      }}
    />
  )
}
