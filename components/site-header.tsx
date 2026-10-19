"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { isCurrentPage, siteNavigation } from "@/lib/site-navigation";
export default function SiteHeader() {
  const pathname = usePathname();
  const [openFor, setOpenFor] = useState<string | null>(null);
  const button = useRef<HTMLButtonElement>(null);
  const open = openFor === pathname;
  return <header className="app-header" onKeyDown={(event) => {
    if (event.key === "Escape" && open) { setOpenFor(null); button.current?.focus(); }
  }}><div className="app-header-inner">
    <Link className="brand" href="/" onClick={() => setOpenFor(null)} aria-label="U-SAFE 홈"><span className="brand-mark" aria-hidden="true">U</span><span><strong>U-SAFE</strong><small>울산 산업물류·보행안전 점검 지원</small></span></Link>
    <button ref={button} className="menu-toggle" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpenFor(open ? null : pathname)}>{open ? "메뉴 닫기" : "메뉴 열기"}</button>
    <nav id="site-navigation" className={`app-nav${open ? " is-open" : ""}`} aria-label="주요 메뉴">{siteNavigation.map((item) => <Link key={item.href} href={item.href} aria-current={isCurrentPage(pathname, item.href) ? "page" : undefined} onClick={() => setOpenFor(null)}>{item.label}</Link>)}</nav>
  </div></header>;
}
