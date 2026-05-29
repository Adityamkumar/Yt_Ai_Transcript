import _PdfParse from "pdf-parse-new";
const PdfParse = _PdfParse as any;

export interface PageText {
  page: number;
  text: string;
}

export const extractPdfText = async (
  pdfBuffer: Buffer
): Promise<{ pages: PageText[]; totalPages: number }> => {
  const pages: PageText[] = [];

  const pagerender = async (pageData: any) => {
    const textContent = await pageData.getTextContent();
    let lastY: number | undefined;
    let text = "";
    
    for (const item of textContent.items) {
      if (lastY !== item.transform[5] && lastY !== undefined) {
        text += "\n";
      }
      text += item.str;
      lastY = item.transform[5];
    }
    
    const pageNum = typeof pageData.pageNumber === 'number'
      ? pageData.pageNumber
      : (typeof pageData._pageIndex === 'number'
        ? pageData._pageIndex + 1
        : (typeof pageData.pageIndex === 'number'
          ? pageData.pageIndex + 1
          : pages.length + 1));

    pages.push({
      page: pageNum,
      text: text,
    });
    
    return text;
  };

  const data = await PdfParse(pdfBuffer, { pagerender });

  pages.sort((a, b) => a.page - b.page);

  return {
    pages,
    totalPages: data.numpages || pages.length,
  };
};

