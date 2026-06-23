"use client";

import { useState, Suspense, lazy } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Car,
  Check,
  ChevronDown,
  Coins,
  Compass,
  Crosshair,
  ExternalLink,
  MapPinned,
  Newspaper,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Module header with distinct icon + title + intro (no internal links)
function ModuleHeader({
  icon: Icon,
  title,
  intro,
}: {
  icon: LucideIcon;
  title: string;
  intro: string;
}) {
  return (
    <div className="mb-8 text-center md:mb-12 scroll-reveal">
      <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] md:mb-4 md:h-14 md:w-14">
        <Icon className="h-6 w-6 text-[hsl(var(--nav-theme-light))] md:h-7 md:w-7" />
      </div>
      <h2 className="text-3xl font-bold md:text-5xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-3xl text-base text-muted-foreground md:mt-4 md:text-lg">
        {intro}
      </p>
    </div>
  );
}

// Risk badge for money methods
function riskBadgeClass(risk: string): string {
  const r = risk.toLowerCase();
  if (r.includes("very high") || r === "high")
    return "bg-red-500/10 text-red-400 border-red-500/30";
  if (r.includes("medium"))
    return "bg-orange-500/10 text-orange-400 border-orange-500/30";
  return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
}

// Priority badge for store passes
function priorityBadgeClass(priority: string): string {
  if (priority === "High")
    return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  if (priority === "Medium")
    return "bg-orange-500/10 text-orange-400 border-orange-500/30";
  if (priority === "Low")
    return "bg-sky-500/10 text-sky-400 border-sky-500/30";
  return "bg-white/5 text-muted-foreground border-border";
}

// Tier styles for weapons tier list
const TIER_STYLES: Record<string, string> = {
  S: "border-amber-500/40 bg-amber-500/10 text-amber-400",
  A: "border-sky-500/40 bg-sky-500/10 text-sky-400",
  B: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  Utility:
    "border-[hsl(var(--nav-theme)/0.4)] bg-[hsl(var(--nav-theme)/0.1)] text-[hsl(var(--nav-theme-light))]",
};

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://tha-bronx-3.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Tha Bronx 3 Wiki",
        description:
          "Complete Tha Bronx 3 Wiki covering codes, map, money methods, cars, weapons, jobs, updates, and beginner tips for the Roblox open-world action roleplay game.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Tha Bronx 3 - Roblox Open World Action RP",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Tha Bronx 3 Wiki",
        alternateName: "Tha Bronx 3",
        url: siteUrl,
        description:
          "Complete Tha Bronx 3 Wiki resource hub for codes, map, money methods, cars, weapons, jobs, and beginner guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Tha Bronx 3 Wiki - Roblox Open World Action RP",
        },
        sameAs: [
          "https://www.roblox.com/games/16472538603/THA-BRONX-3",
          "https://www.roblox.com/communities/15022380/Tha-Bronx-RP",
          "https://www.instagram.com/thabronx2official/",
          "https://www.youtube.com/watch?v=3pl_f768FeY",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Tha Bronx 3",
        gamePlatform: ["Roblox"],
        applicationCategory: "Game",
        genre: ["Action", "Roleplaying", "Open World", "Adventure"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 30,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/16472538603/THA-BRONX-3",
        },
      },
      {
        "@type": "VideoObject",
        name: "I Went From RAGS TO RICHES in Roblox Tha Bronx 3",
        description:
          "Gameplay video for THA BRONX 3, the open-world action roleplay game on Roblox, showcasing rags-to-riches city survival, cars, and progression.",
        uploadDate: "2025-04-18",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/3pl_f768FeY",
        url: "https://www.youtube.com/watch?v=3pl_f768FeY",
      },
    ],
  };

  // Accordion states
  const [linksExpanded, setLinksExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Tools Grid card -> section id mapping
  const sectionIds = [
    "codes",
    "beginner-guide",
    "money-jobs",
    "weapons-tier",
    "store-guide",
    "map-locations",
    "cars-storage",
    "official-links",
  ];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8 text-center scroll-reveal">
            {/* Badge */}
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1.5 md:mb-6 md:px-4 md:py-2"
            >
              <Sparkles className="h-4 w-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs font-medium md:text-sm">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-4 text-4xl font-bold leading-[1.05] sm:text-5xl md:mb-6 md:text-7xl">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("codes")}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[hsl(var(--nav-theme))] px-6 py-3.5 font-semibold text-base text-white transition-colors hover:bg-[hsl(var(--nav-theme)/0.9)] md:px-8 md:py-4 md:text-lg"
              >
                <BookOpen className="h-5 w-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/16472538603/THA-BRONX-3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3.5 font-semibold text-base transition-colors hover:bg-white/10 md:px-8 md:py-4 md:text-lg"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="3pl_f768FeY"
              title="I Went From RAGS TO RICHES in Roblox Tha Bronx 3"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards */}
      <section className="bg-white/[0.02] px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8 text-center md:mb-12 scroll-reveal">
            <h2 className="text-3xl font-bold md:text-5xl">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base text-muted-foreground md:text-lg">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = sectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group cursor-pointer rounded-xl border border-border bg-card p-4 text-left transition-all duration-300 hover:border-[hsl(var(--nav-theme)/0.5)] hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)] md:p-6"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)] transition-colors group-hover:bg-[hsl(var(--nav-theme)/0.2)] md:mb-4 md:h-12 md:w-12">
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 text-[hsl(var(--nav-theme-light))] md:h-6 md:w-6"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold md:text-base">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section */}
      <LatestGuidesAccordion articles={latestArticles} locale={locale} max={12} />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Tha Bronx 3 Codes and Rewards */}
      <section id="codes" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Ticket}
            title={t.modules.thaBronx3Codes.title}
            intro={t.modules.thaBronx3Codes.intro}
          />
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2">
            {t.modules.thaBronx3Codes.cards.map((card: any, index: number) => {
              const StatusIcon =
                card.statusType === "safe"
                  ? ShieldCheck
                  : card.statusType === "danger"
                    ? ShieldAlert
                    : AlertCircle;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:p-6"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <StatusIcon className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                    <h3 className="text-lg font-bold">{card.label}</h3>
                  </div>
                  <span className="mb-3 inline-block rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-3 py-1 text-xs">
                    {card.status}
                  </span>
                  <p className="mb-3 text-sm text-muted-foreground">{card.reward}</p>
                  <p className="flex items-start gap-2 text-sm">
                    <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                    <span>{card.action}</span>
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Tha Bronx 3 Beginner Guide */}
      <section
        id="beginner-guide"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Compass}
            title={t.modules.thaBronx3BeginnerGuide.title}
            intro={t.modules.thaBronx3BeginnerGuide.intro}
          />
          <div className="space-y-3 scroll-reveal md:space-y-4">
            {t.modules.thaBronx3BeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 rounded-xl border border-border bg-white/5 p-4 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)] md:gap-4 md:p-6"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)] md:h-12 md:w-12">
                    <span className="text-base font-bold text-[hsl(var(--nav-theme-light))] md:text-xl">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold md:text-xl">
                        {step.title}
                      </h3>
                      <span className="rounded-full border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-2 py-0.5 text-xs">
                        {step.focus}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground md:text-base">
                      {step.description}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 3: Tha Bronx 3 Money and Jobs Guide */}
      <section id="money-jobs" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Coins}
            title={t.modules.thaBronx3MoneyAndJobs.title}
            intro={t.modules.thaBronx3MoneyAndJobs.intro}
          />
          {/* Desktop table */}
          <div className="scroll-reveal hidden overflow-hidden rounded-xl border border-border md:block">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--nav-theme)/0.1)]">
                <tr className="text-left">
                  <th className="p-4 font-semibold">Method</th>
                  <th className="p-4 font-semibold">Risk</th>
                  <th className="p-4 font-semibold">Requirements</th>
                  <th className="p-4 font-semibold">Best For</th>
                </tr>
              </thead>
              <tbody>
                {t.modules.thaBronx3MoneyAndJobs.methods.map(
                  (m: any, index: number) => (
                    <tr
                      key={index}
                      className="border-t border-border align-top"
                    >
                      <td className="p-4 font-semibold text-[hsl(var(--nav-theme-light))]">
                        {m.method}
                        <p className="mt-1 text-xs font-normal text-muted-foreground">
                          {m.notes}
                        </p>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-xs ${riskBadgeClass(m.risk)}`}
                        >
                          {m.risk}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {m.requirements}
                      </td>
                      <td className="p-4 text-muted-foreground">{m.bestFor}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
          {/* Mobile cards */}
          <div className="space-y-3 scroll-reveal md:hidden">
            {t.modules.thaBronx3MoneyAndJobs.methods.map(
              (m: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-4"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="font-bold text-[hsl(var(--nav-theme-light))]">
                      {m.method}
                    </h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${riskBadgeClass(m.risk)}`}
                    >
                      {m.risk}
                    </span>
                  </div>
                  <p className="mb-1 text-sm text-muted-foreground">
                    {m.requirements}
                  </p>
                  <p className="mb-2 text-sm text-muted-foreground">{m.bestFor}</p>
                  <p className="text-xs text-muted-foreground">{m.notes}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 4: Tha Bronx 3 Weapons and Guns Tier List */}
      <section
        id="weapons-tier"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Crosshair}
            title={t.modules.thaBronx3WeaponsTierList.title}
            intro={t.modules.thaBronx3WeaponsTierList.intro}
          />
          <div className="space-y-6 scroll-reveal">
            {t.modules.thaBronx3WeaponsTierList.tiers.map(
              (tier: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-4 md:p-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-base font-bold ${TIER_STYLES[tier.tier] || TIER_STYLES.Utility}`}
                    >
                      {tier.tier === "Utility" ? (
                        <Star className="h-5 w-5" />
                      ) : (
                        tier.tier
                      )}
                    </span>
                    <div>
                      <h3 className="font-bold md:text-lg">{tier.tierLabel}</h3>
                      <p className="text-xs text-muted-foreground">
                        {tier.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {tier.entries.map((entry: any, ei: number) => (
                      <div
                        key={ei}
                        className="rounded-lg border border-border bg-white/5 p-3"
                      >
                        <p className="font-semibold text-[hsl(var(--nav-theme-light))]">
                          {entry.name}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entry.type}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entry.role}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 5: Tha Bronx 3 Gamepasses and Store Guide */}
      <section id="store-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={ShoppingBag}
            title={t.modules.thaBronx3StoreGuide.title}
            intro={t.modules.thaBronx3StoreGuide.intro}
          />
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2 lg:grid-cols-3">
            {t.modules.thaBronx3StoreGuide.passes.map(
              (p: any, index: number) => (
                <div
                  key={index}
                  className="flex flex-col rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[hsl(var(--nav-theme-light))]">
                      {p.name}
                    </h3>
                    <span
                      className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs ${priorityBadgeClass(p.priority)}`}
                    >
                      {p.priority}
                    </span>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">
                      {p.category}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">
                      {p.price}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">
                      {p.status}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-muted-foreground">{p.bestUse}</p>
                  <p className="mt-auto text-xs text-muted-foreground">{p.notes}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 6 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 6: Tha Bronx 3 Map and Locations Guide */}
      <section
        id="map-locations"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={MapPinned}
            title={t.modules.thaBronx3MapGuide.title}
            intro={t.modules.thaBronx3MapGuide.intro}
          />
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2 lg:grid-cols-3">
            {t.modules.thaBronx3MapGuide.locations.map(
              (loc: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-bold">{loc.name}</h3>
                    <span
                      className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-xs ${loc.safe ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}`}
                    >
                      {loc.safe ? "Safe" : "Danger"}
                    </span>
                  </div>
                  <span className="mb-2 inline-block rounded-full bg-[hsl(var(--nav-theme)/0.1)] px-2 py-0.5 text-xs">
                    {loc.category}
                  </span>
                  <p className="text-xs text-muted-foreground">{loc.area}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{loc.use}</p>
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                    <span>{loc.tip}</span>
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 7: Tha Bronx 3 Cars and Storage Guide */}
      <section id="cars-storage" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Car}
            title={t.modules.thaBronx3CarsAndStorage.title}
            intro={t.modules.thaBronx3CarsAndStorage.intro}
          />
          <div className="grid grid-cols-1 gap-4 scroll-reveal md:grid-cols-2">
            {t.modules.thaBronx3CarsAndStorage.vehicles.map(
              (v: any, index: number) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-white/5 p-5 transition-colors hover:border-[hsl(var(--nav-theme)/0.5)]"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Car className="h-5 w-5 text-[hsl(var(--nav-theme-light))]" />
                    <h3 className="font-bold text-[hsl(var(--nav-theme-light))]">
                      {v.name}
                    </h3>
                  </div>
                  <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">
                      {v.category}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-muted-foreground">
                      {v.cost}
                    </span>
                  </div>
                  <p className="mb-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPinned className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                    <span>{v.access}</span>
                  </p>
                  <p className="mb-1 text-sm text-muted-foreground">{v.use}</p>
                  <p className="text-xs text-muted-foreground">{v.storageRole}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{v.notes}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 8: Tha Bronx 3 Updates and Official Links Tracker */}
      <section
        id="official-links"
        className="scroll-mt-24 bg-white/[0.02] px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            icon={Newspaper}
            title={t.modules.thaBronx3OfficialLinks.title}
            intro={t.modules.thaBronx3OfficialLinks.intro}
          />
          <div className="space-y-3 scroll-reveal">
            {t.modules.thaBronx3OfficialLinks.panels.map(
              (panel: any, index: number) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-xl border border-border bg-white/5"
                >
                  <button
                    onClick={() =>
                      setLinksExpanded(linksExpanded === index ? null : index)
                    }
                    className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-white/5"
                  >
                    <span className="flex items-center gap-3">
                      <ExternalLink className="h-5 w-5 flex-shrink-0 text-[hsl(var(--nav-theme-light))]" />
                      <span>
                        <span className="font-semibold">{panel.label}</span>
                        <span className="block text-xs text-muted-foreground">
                          {panel.summary}
                        </span>
                      </span>
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 transition-transform ${linksExpanded === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {linksExpanded === index && (
                    <div className="px-5 pb-5">
                      <p className="mb-3 text-sm text-muted-foreground">
                        {panel.content}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {panel.links.map((link: any, li: number) => (
                          <a
                            key={li}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--nav-theme)/0.3)] bg-[hsl(var(--nav-theme)/0.1)] px-4 py-2 text-sm transition-colors hover:bg-[hsl(var(--nav-theme)/0.2)]"
                          >
                            {link.label}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="border-t border-border bg-white/[0.02]">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
            {/* Brand */}
            <div>
              <h3 className="mb-4 text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/games/16472538603/THA-BRONX-3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.robloxGame}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/communities/15022380/Tha-Bronx-RP"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.robloxCommunity}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.instagram.com/thabronx2official/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.instagram}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=3pl_f768FeY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="mb-4 font-semibold">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground transition hover:text-[hsl(var(--nav-theme-light))]"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
