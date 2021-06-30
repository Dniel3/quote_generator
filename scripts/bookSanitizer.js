var endOfBook = '*** END OF THE PROJECT GUTENBERG EBOOK';
var indexStartWords = ['CONTENTS', 'Contents',];
addEventListener("fetch", function (event) {
    event.respondWith(new Response("Hello world", {
        status: 200,
        headers: { "content-type": "text/plain" }
    }));
});
function sanitizeChapter(chapterContent) {
    return chapterContent.trim().replaceAll(/-{10,}/g, ' ').replaceAll(/\* {3,}\*/g, ' ').replaceAll('\r\n', ' ');
}
function extractBookContent(book) {
    var indexStart = indexStartWords
        .map(function (word) { return ({ word: word, position: book.indexOf(word) }); })
        .find(function (_a) {
        var position = _a.position;
        return position !== -1;
    });
    if (!indexStart)
        throw Error('Failed to find content start');
    var firstChapterStart = indexStart.word.length + indexStart.position;
    var trimmed = book.substr(firstChapterStart).trimLeft();
    var firstChapterEnd = trimmed.indexOf('\r\n');
    var firstChapter = trimmed.substring(0, firstChapterEnd);
    while (trimmed.indexOf(firstChapter, firstChapterEnd) === -1) {
        firstChapterEnd--;
        firstChapter = trimmed.substring(0, firstChapterEnd);
    }
    var contentStart = trimmed.indexOf(firstChapter, firstChapterEnd);
    var contentEnd = trimmed.indexOf(endOfBook);
    return trimmed.substring(contentStart, contentEnd);
}