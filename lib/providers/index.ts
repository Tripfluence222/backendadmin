import { SocialProvider } from "@prisma/client";

export const SOCIAL_PROVIDERS = [
  "FACEBOOK_PAGE",
  "INSTAGRAM_BUSINESS", 
  "GOOGLE_BUSINESS",
] as const;

export const EVENT_PROVIDERS = [
  "FACEBOOK_PAGE",
  "EVENTBRITE",
  "MEETUP",
] as const;

export type SocialProviderType = typeof SOCIAL_PROVIDERS[number];
export type EventProviderType = typeof EVENT_PROVIDERS[number];

export function isSocialProvider(provider: SocialProvider): provider is SocialProviderType {
  return SOCIAL_PROVIDERS.includes(provider as SocialProviderType);
}

export function isEventProvider(provider: SocialProvider): provider is EventProviderType {
  return EVENT_PROVIDERS.includes(provider as EventProviderType);
}

export function getProviderDisplayName(provider: SocialProvider): string {
  switch (provider) {
    case "FACEBOOK_PAGE":
      return "Facebook Page";
    case "INSTAGRAM_BUSINESS":
      return "Instagram Business";
    case "GOOGLE_BUSINESS":
      return "Google Business Profile";
    case "EVENTBRITE":
      return "Eventbrite";
    case "MEETUP":
      return "Meetup";
    default:
      return provider;
  }
}

export function getProviderIcon(provider: SocialProvider): string {
  switch (provider) {
    case "FACEBOOK_PAGE":
      return "📘";
    case "INSTAGRAM_BUSINESS":
      return "📷";
    case "GOOGLE_BUSINESS":
      return "🏢";
    case "EVENTBRITE":
      return "🎫";
    case "MEETUP":
      return "👥";
    default:
      return "🔗";
  }
}

export function getProviderColor(provider: SocialProvider): string {
  switch (provider) {
    case "FACEBOOK_PAGE":
      return "bg-blue-500";
    case "INSTAGRAM_BUSINESS":
      return "bg-pink-500";
    case "GOOGLE_BUSINESS":
      return "bg-green-500";
    case "EVENTBRITE":
      return "bg-orange-500";
    case "MEETUP":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
}
