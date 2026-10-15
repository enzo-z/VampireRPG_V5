/** Fixed boxes on a printed page: labels (data-fit-label) of the boxes whose content does not fit. */
export function overflowingFields(page: HTMLElement): string[] {
  const fields = [...page.querySelectorAll<HTMLElement>('[data-fit-label]')];
  const labels = fields.filter((field) => field.scrollHeight > field.clientHeight + 1).map((field) => field.dataset['fitLabel'] ?? '');
  if (page.scrollHeight > page.clientHeight + 1) labels.push('página inteira');
  return labels;
}
