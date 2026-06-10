import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { getServerEnv } from "#/server/env";

/**
 * Persist a raw source artifact before parsing. Cache failures must never fail
 * an import run, so this returns null on error.
 */
export async function writeCacheArtifact(
  source: string,
  artifact: { sourceUrl: string; content: unknown },
): Promise<string | null> {
  try {
    const env = getServerEnv();
    const directory = join(env.importCacheDir, source);
    await mkdir(directory, { recursive: true });

    const body = JSON.stringify(
      {
        sourceUrl: artifact.sourceUrl,
        fetchedAt: new Date().toISOString(),
        content: artifact.content,
      },
      null,
      2,
    );
    const hash = createHash("sha256").update(body).digest("hex").slice(0, 12);
    const fileName = `${Date.now()}-${hash}.json`;
    const filePath = join(directory, fileName);
    await writeFile(filePath, body, "utf8");
    return filePath;
  } catch (error) {
    console.warn(`[imports] failed to cache raw artifact for ${source}:`, error);
    return null;
  }
}
