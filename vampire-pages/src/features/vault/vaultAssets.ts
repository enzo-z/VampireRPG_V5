// The build writes data-vault-asset="N" where a note embeds an image or audio;
// N indexes the bundled URLs exported by "virtual:vault".

const ASSET_ATTRIBUTE = /data-vault-asset="(\d+)"/g;

const escapeAttribute = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

/** Turns data-vault-asset="N" into src="<url>"; an unknown index is left without a source. */
export function resolveVaultAssets(html: string, assets: readonly string[]): string {
  return html.replace(ASSET_ATTRIBUTE, (attribute, index: string) => {
    const url = assets[Number(index)];
    return url === undefined ? attribute : `src="${escapeAttribute(url)}"`;
  });
}
