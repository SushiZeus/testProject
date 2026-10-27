/** Build a small text-only PDF without requiring a server-side PDF service. */
export function createPdfFile(filename: string, lines: string[]): File {
  const pageLines = lines.flatMap((line) => {
    const text = String(line ?? '');
    if (!text) return [''];
    const wrapped: string[] = [];
    for (let start = 0; start < text.length; start += 88) wrapped.push(text.slice(start, start + 88));
    return wrapped;
  });
  const chunks: string[][] = [];
  for (let index = 0; index < pageLines.length; index += 46) chunks.push(pageLines.slice(index, index + 46));
  if (!chunks.length) chunks.push(['']);

  const pageObjectIds = chunks.map((_, index) => 3 + index * 2);
  const fontObjectId = 3 + chunks.length * 2;
  const objects: string[] = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${chunks.length} >>`;

  const escapePdfText = (value: string) => value
    .replace(/[^\x20-\x7e]/g, '?')
    .replace(/([\\()])/g, '\\$1');

  chunks.forEach((page, index) => {
    const pageId = pageObjectIds[index];
    const contentId = pageId + 1;
    const textCommands = page.map((line, lineIndex) =>
      `${lineIndex === 0 ? '48 750 Td' : '0 -15 Td'} (${escapePdfText(line)}) Tj`
    ).join('\n');
    const stream = `BT\n/F1 10 Tf\n${textCommands}\nET`;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`;
  });
  objects[fontObjectId] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = new TextEncoder().encode(pdf).length;
    pdf += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id += 1) pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new File([new TextEncoder().encode(pdf)], filename, { type: 'application/pdf' });
}
