const endOfBook = '*** END OF THE PROJECT GUTENBERG EBOOK';
const indexStartWords = ['CONTENTS', 'Contents',];

addEventListener("fetch", (event) => {
  if (event.request.url.indexOf('favicon') !== -1) {
    event.respondWith(
      new Response("Hello world", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );
  }

  const bookId = event.request.url.split('/')[1];

  const book = await fetch(`https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`);
  const result = sanitizeChapter(extractBookContent(await book.text()));

  const response: Response = { headers: new Headers() } as Response;
  response.headers.set('Content-Type', 'text/plain');

  event.respondWith(
    new Response(result, {
      status: 200,
      headers: { "content-type": "text/plain" },
    }),
  );
});

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
