import type { CategoryDef, CategoryId, SiteDef } from '../types';

export const SITE_CATEGORIES: CategoryDef[] = [
  { id: 'social', name: 'Social Media', multiplier: 2, threshold: 3, color: '#E1306C', icon: '📱' },
  { id: 'video', name: 'Video and Streaming', multiplier: 1.75, threshold: 3, color: '#FF0033', icon: '🎬' },
  { id: 'gaming', name: 'Gaming', multiplier: 1.5, threshold: 3, color: '#7C4DFF', icon: '🎮' },
  { id: 'messaging', name: 'Messaging', multiplier: 1.5, threshold: 3, color: '#25A0E2', icon: '💬' },
  { id: 'news', name: 'News and Gossip', multiplier: 1.25, threshold: 3, color: '#8A8F98', icon: '📰' },
  { id: 'shopping', name: 'Shopping', multiplier: 1.25, threshold: 3, color: '#F59E0B', icon: '🛍️' },
];

export const SITE_CATEGORIES_BY_ID: Record<CategoryId, CategoryDef> = {
  social: SITE_CATEGORIES[0],
  video: SITE_CATEGORIES[1],
  gaming: SITE_CATEGORIES[2],
  messaging: SITE_CATEGORIES[3],
  news: SITE_CATEGORIES[4],
  shopping: SITE_CATEGORIES[5],
};

export const SITES: Record<string, SiteDef> = {
  instagram: { id: 'instagram', name: 'Instagram', categoryId: 'social', domains: ['instagram.com'], emoji: '📸' },
  tiktok: { id: 'tiktok', name: 'TikTok', categoryId: 'social', domains: ['tiktok.com'], emoji: '🎵' },
  x: { id: 'x', name: 'X / Twitter', categoryId: 'social', domains: ['x.com', 'twitter.com'], emoji: '𝕏' },
  facebook: { id: 'facebook', name: 'Facebook', categoryId: 'social', domains: ['facebook.com'], emoji: '👥' },
  reddit: { id: 'reddit', name: 'Reddit', categoryId: 'social', domains: ['reddit.com'], emoji: '🤖' },
  snapchat: { id: 'snapchat', name: 'Snapchat', categoryId: 'social', domains: ['snapchat.com'], emoji: '👻' },
  pinterest: { id: 'pinterest', name: 'Pinterest', categoryId: 'social', domains: ['pinterest.com', 'pinterest.ca'], emoji: '📌' },
  threads: { id: 'threads', name: 'Threads', categoryId: 'social', domains: ['threads.net', 'threads.com'], emoji: '🧵' },
  youtube: { id: 'youtube', name: 'YouTube', categoryId: 'video', domains: ['youtube.com', 'youtu.be'], emoji: '▶️' },
  netflix: { id: 'netflix', name: 'Netflix', categoryId: 'video', domains: ['netflix.com'], emoji: '🎞️' },
  twitch: { id: 'twitch', name: 'Twitch', categoryId: 'video', domains: ['twitch.tv'], emoji: '🎮' },
  disneyplus: { id: 'disneyplus', name: 'Disney+', categoryId: 'video', domains: ['disneyplus.com'], emoji: '✨' },
  primevideo: { id: 'primevideo', name: 'Prime Video', categoryId: 'video', domains: ['primevideo.com'], emoji: '📺' },
  crunchyroll: { id: 'crunchyroll', name: 'Crunchyroll', categoryId: 'video', domains: ['crunchyroll.com'], emoji: '🍙' },
  steam: { id: 'steam', name: 'Steam', categoryId: 'gaming', domains: ['steampowered.com', 'steamcommunity.com'], emoji: '🎮' },
  roblox: { id: 'roblox', name: 'Roblox', categoryId: 'gaming', domains: ['roblox.com'], emoji: '🧱' },
  chess: { id: 'chess', name: 'Chess.com', categoryId: 'gaming', domains: ['chess.com'], emoji: '♟️' },
  lichess: { id: 'lichess', name: 'Lichess', categoryId: 'gaming', domains: ['lichess.org'], emoji: '♞' },
  poki: { id: 'poki', name: 'Poki', categoryId: 'gaming', domains: ['poki.com'], emoji: '🎲' },
  crazygames: { id: 'crazygames', name: 'CrazyGames', categoryId: 'gaming', domains: ['crazygames.com'], emoji: '🎯' },
  epicgames: { id: 'epicgames', name: 'Epic Games', categoryId: 'gaming', domains: ['epicgames.com'], emoji: '🎮' },
  discord: { id: 'discord', name: 'Discord', categoryId: 'messaging', domains: ['discord.com'], emoji: '💬' },
  whatsapp: { id: 'whatsapp', name: 'WhatsApp Web', categoryId: 'messaging', domains: ['web.whatsapp.com'], emoji: '💬' },
  messenger: { id: 'messenger', name: 'Messenger', categoryId: 'messaging', domains: ['messenger.com'], emoji: '💬' },
  telegram: { id: 'telegram', name: 'Telegram Web', categoryId: 'messaging', domains: ['web.telegram.org'], emoji: '✈️' },
  cnn: { id: 'cnn', name: 'CNN', categoryId: 'news', domains: ['cnn.com'], emoji: '📰' },
  bbc: { id: 'bbc', name: 'BBC', categoryId: 'news', domains: ['bbc.com', 'bbc.co.uk'], emoji: '📰' },
  cbc: { id: 'cbc', name: 'CBC', categoryId: 'news', domains: ['cbc.ca'], emoji: '📰' },
  buzzfeed: { id: 'buzzfeed', name: 'BuzzFeed', categoryId: 'news', domains: ['buzzfeed.com'], emoji: '🗞️' },
  tmz: { id: 'tmz', name: 'TMZ', categoryId: 'news', domains: ['tmz.com'], emoji: '🗞️' },
  dailymail: { id: 'dailymail', name: 'Daily Mail', categoryId: 'news', domains: ['dailymail.co.uk'], emoji: '🗞️' },
  amazon: { id: 'amazon', name: 'Amazon', categoryId: 'shopping', domains: ['amazon.com', 'amazon.ca'], excludedDomains: ['aws.amazon.com'], emoji: '🛍️' },
  ebay: { id: 'ebay', name: 'eBay', categoryId: 'shopping', domains: ['ebay.com', 'ebay.ca'], emoji: '🛍️' },
  etsy: { id: 'etsy', name: 'Etsy', categoryId: 'shopping', domains: ['etsy.com'], emoji: '🛍️' },
  shein: { id: 'shein', name: 'SHEIN', categoryId: 'shopping', domains: ['shein.com'], emoji: '🛍️' },
  temu: { id: 'temu', name: 'Temu', categoryId: 'shopping', domains: ['temu.com'], emoji: '🛍️' },
  aliexpress: { id: 'aliexpress', name: 'AliExpress', categoryId: 'shopping', domains: ['aliexpress.com'], emoji: '🛍️' },
};

export const SITE_LIST = Object.values(SITES);
export const SITES_BY_ID = SITES;
