/**
 * scraper.ts
 * Single Responsibility: Trích xuất URL từ instruction và scrape nội dung.
 *
 * Sử dụng Firecrawl API để lấy nội dung documentation từ URL.
 */

import { firecrawl } from "@/lib/firecrawl";

const URL_REGEX = /https?:\/\/[^\s)>\]]+/g;

/**
 * Trích xuất URLs từ instruction text và scrape nội dung.
 *
 * @param instruction - Text chứa URLs cần scrape
 * @returns Documentation context string (rỗng nếu không có URL)
 */
export const scrapeUrlsFromInstruction = async (
  instruction: string
): Promise<string> => {
  const urls: string[] = instruction.match(URL_REGEX) || [];

  if (urls.length === 0) {
    return "";
  }

  const scrapedResults = await Promise.all(
    urls.map(async (url) => {
      try {
        const result = await firecrawl.scrape(url, {
          formats: ["markdown"],
        });

        if (result.markdown) {
          return `<doc url="${url}">\n${result.markdown}\n</doc>`;
        }

        return null;
      } catch {
        return null;
      }
    })
  );

  const validResults = scrapedResults.filter(Boolean);

  if (validResults.length === 0) {
    return "";
  }

  return `<documentation>\n${validResults.join("\n\n")}\n</documentation>`;
};
