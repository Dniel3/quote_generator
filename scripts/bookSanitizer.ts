import { serve } from "https://deno.land/std@0.99.0/http/server.ts";

const endOfBook = '*** END OF THE PROJECT GUTENBERG EBOOK';
const indexStartWords = ['CONTENTS', 'Contents',];
const server = serve({ port: 8080 });

for await (const request of server) {
  if (request.url.indexOf('favicon') !== -1) {
    continue;
  }

  const bookId = request.url.split('/')[1];


  const book = await fetch(`https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`);
  const result = sanitizeChapter(extractBookContent(await book.text()));

  const response: Response = { headers: new Headers() } as Response;
  response.headers.set('Content-Type', 'text/plain');

  request.respond({
    ...response,
    status: 200, body: JSON.stringify(result),
  });
}

function sanitizeChapter(chapterContent: string) {
  return chapterContent.trim().replaceAll(/-{10,}/g, ' ').replaceAll(/\* {3,}\*/g, ' ').replaceAll('\r\n', ' ');
}

function extractBookContent(book: string): string {
  const indexStart = indexStartWords
    .map(word => ({ word, position: book.indexOf(word) }))
    .find(({ position }) => position !== -1);
  if (!indexStart) throw Error('Failed to find content start');
  let firstChapterStart = indexStart.word.length + indexStart.position;
  const trimmed = book.substr(firstChapterStart).trimLeft();

  let firstChapterEnd = trimmed.indexOf('\r\n');
  let firstChapter = trimmed.substring(0, firstChapterEnd);

  while (trimmed.indexOf(firstChapter, firstChapterEnd) === -1) {
    firstChapterEnd--;
    firstChapter = trimmed.substring(0, firstChapterEnd);
  }

  const contentStart = trimmed.indexOf(firstChapter, firstChapterEnd);

  const contentEnd = trimmed.indexOf(endOfBook);

  return trimmed.substring(contentStart, contentEnd);
}
