import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from 'docx';
import { format } from 'date-fns';

interface DocumentMetadata {
  title: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  tags?: { name: string }[];
  categories?: { name: string }[];
}

export async function createDOCX(content: string, metadata: DocumentMetadata) {
  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: metadata.title,
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),

          // Metadata table
          new Table({
            width: {
              size: 100,
              type: 'pct',
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph('Created By')],
                    width: {
                      size: 25,
                      type: 'pct',
                    },
                  }),
                  new TableCell({
                    children: [
                      new Paragraph(
                        `${metadata.createdBy.name} (${metadata.createdBy.email})`
                      ),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph('Created At')],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph(
                        format(new Date(metadata.createdAt), 'PPpp')
                      ),
                    ],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph('Last Modified')],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph(
                        format(new Date(metadata.updatedAt), 'PPpp')
                      ),
                    ],
                  }),
                ],
              }),
              ...(metadata.categories?.length
                ? [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph('Categories')],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              metadata.categories
                                .map((c) => c.name)
                                .join(', ')
                            ),
                          ],
                        }),
                      ],
                    }),
                  ]
                : []),
              ...(metadata.tags?.length
                ? [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [new Paragraph('Tags')],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph(
                              metadata.tags.map((t) => t.name).join(', ')
                            ),
                          ],
                        }),
                      ],
                    }),
                  ]
                : []),
            ],
          }),

          // Spacing after metadata
          new Paragraph({
            spacing: {
              before: 400,
              after: 400,
            },
          }),

          // Content
          ...parseContent(content),
        ],
      },
    ],
  });

  return doc;
}

function parseContent(content: string): Paragraph[] {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n');

  return paragraphs.map((text) => {
    // Check if it's a heading
    if (text.startsWith('#')) {
      const level = text.match(/^#+/)?.[0].length || 1;
      const headingText = text.replace(/^#+\s*/, '');
      return new Paragraph({
        text: headingText,
        heading: level as HeadingLevel,
        spacing: {
          before: 400,
          after: 200,
        },
      });
    }

    // Check if it's a list
    if (text.match(/^[-*]\s/m)) {
      const items = text.split('\n');
      return new Paragraph({
        bullet: {
          level: 0,
        },
        children: items.map(
          (item) =>
            new TextRun({
              text: item.replace(/^[-*]\s/, ''),
            })
        ),
      });
    }

    // Regular paragraph
    return new Paragraph({
      children: parseTextRuns(text),
      spacing: {
        before: 200,
        after: 200,
      },
    });
  });
}

function parseTextRuns(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let currentText = '';
  let isBold = false;
  let isItalic = false;

  // Process text character by character
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '*' || text[i] === '_') {
      // Check for bold (**) or italic (*)
      if (text[i + 1] === text[i]) {
        // Bold
        if (currentText) {
          runs.push(
            new TextRun({
              text: currentText,
              bold: isBold,
              italics: isItalic,
            })
          );
          currentText = '';
        }
        isBold = !isBold;
        i++; // Skip next character
      } else {
        // Italic
        if (currentText) {
          runs.push(
            new TextRun({
              text: currentText,
              bold: isBold,
              italics: isItalic,
            })
          );
          currentText = '';
        }
        isItalic = !isItalic;
      }
    } else {
      currentText += text[i];
    }
  }

  // Add remaining text
  if (currentText) {
    runs.push(
      new TextRun({
        text: currentText,
        bold: isBold,
        italics: isItalic,
      })
    );
  }

  return runs;
}


