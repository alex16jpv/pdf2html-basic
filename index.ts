import pdf from "pdf-parse";

interface pdfContent {
  title: string;
  paragraphs: string[];
}

export default class PDFUtils {
  constructor() {}

  private htmlBuilder({ title, paragraphs }: pdfContent): string {
    const paragraphsHtml = paragraphs.reduce((prev: string, curr: string) => {
      if (curr.length === 0) {
        // line break
        return prev;
      }
      // TODO: add logic to identify bold for subtitles and list of items
      return (prev += `<p>${curr}</p>`);
    }, "");
    const html = `<div><h3><strong>${title}</strong></h3>${paragraphsHtml}</div>`;

    return html;
  }

  private identifyParagraphsAndTitle(text: string): pdfContent {
    const contentArray = text.split("\n");
    const title = contentArray.shift() as string;

    // group the lines by "paragraphs" (separated by empty lines)
    const groups = contentArray?.reduce(
      (acc: string[][], line: string) => {
        if (line?.trim() === "") {
          acc.push([]);
        } else {
          acc[acc.length - 1].push(line.trim());
        }
        return acc;
      },
      [[]]
    );

    const paragraphs = groups.map((group) => group.join(" "));

    return {
      title,
      paragraphs,
    };
  }

  async pdf2PlainText(fileBuffer: Buffer): Promise<string> {
    const content = await pdf(fileBuffer);
    return content?.text?.trim() || "";
  }

  async pdf2Html(fileBuffer: Buffer): Promise<string> {
    const text = await this.pdf2PlainText(fileBuffer);
    const pdfContent = this.identifyParagraphsAndTitle(text);
    const html = this.htmlBuilder(pdfContent);
    return html;
  }
}
