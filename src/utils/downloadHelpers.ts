import { jsPDF } from "jspdf";

const sanitizeFilename = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "story";

export const downloadAudioFromDataUrl = (
  dataUrl: string,
  baseName: string,
  mediaType = "audio/mpeg"
) => {
  const extension = mediaType.includes("wav") ? "wav" : "mp3";
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = `${sanitizeFilename(baseName)}.${extension}`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
};

export const downloadStoryPdfWithAudioLink = (params: {
  title: string;
  story: string;
  audioUrl?: string | null;
}) => {
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;

  let y = margin;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text(params.title, margin, y);
  y += 26;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  const storyLines = pdf.splitTextToSize(params.story, contentWidth);

  storyLines.forEach((line: string) => {
    if (y > pageHeight - margin) {
      pdf.addPage();
      y = margin;
    }
    pdf.text(line, margin, y);
    y += 18;
  });

  if (params.audioUrl) {
    if (y > pageHeight - margin - 36) {
      pdf.addPage();
      y = margin;
    }
    y += 8;
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(30, 64, 175);
    pdf.textWithLink("Listen to story audio", margin, y, { url: params.audioUrl });
    pdf.setTextColor(0, 0, 0);
    y += 16;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text(
      "Tip: open this PDF in a browser tab for best audio-link support.",
      margin,
      y
    );
  }

  pdf.save(`${sanitizeFilename(params.title)}.pdf`);
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const downloadStoryHtmlWithAudio = (params: {
  title: string;
  story: string;
  audioUrl?: string | null;
}) => {
  const safeTitle = escapeHtml(params.title);
  const safeStory = escapeHtml(params.story).replace(/\n/g, "<br/>");
  const audioBlock = params.audioUrl
    ? `<audio controls preload="none" src="${params.audioUrl}" style="width:100%;max-width:640px;margin:0 0 16px 0;"></audio>`
    : `<p style="margin:0 0 16px 0;color:#555;">No audio available for this story.</p>`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;background:#f8fafc;color:#0f172a;margin:0;padding:24px;}
    .wrap{max-width:860px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:24px;}
    h1{margin:0 0 14px 0;font-size:28px;}
    .story{line-height:1.75;font-size:16px;white-space:normal;}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>${safeTitle}</h1>
    ${audioBlock}
    <div class="story">${safeStory}</div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${sanitizeFilename(params.title)}.html`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};
