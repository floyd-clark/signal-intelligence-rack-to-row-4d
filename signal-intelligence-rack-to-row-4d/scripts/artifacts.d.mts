import type { Page } from '@playwright/test';
export function writeEvidence(path: string, data: string | Uint8Array): Promise<void>;
export function screenshot(page: Page, options: NonNullable<Parameters<Page['screenshot']>[0]> & { path: string }): Promise<Buffer>;
