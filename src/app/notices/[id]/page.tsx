import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Download } from "lucide-react";
import { existsSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

export default async function NoticeDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const notice = await (prisma as any).notice.findUnique({
      where: { id: params.id },
    });

    if (!notice) return notFound();

    const date = new Date(notice.createdAt).toLocaleDateString("bn-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Extract attachment URL (document link, uploaded image, or explicit field)
    const docLinkMatch = notice.content.match(/href="([^"]*(?:\/uploads\/[^"]+|\.(?:pdf|doc|docx|xls|xlsx|zip|jpg|jpeg|png|webp)[^"]*))"/i);
    const imgMatch = notice.content.match(/<img[^>]+src="([^">]+)"/i);
    
    const downloadUrl = (notice as any).attachmentUrl || (docLinkMatch ? docLinkMatch[1] : (imgMatch ? imgMatch[1] : null));
    const isPdf = downloadUrl?.toLowerCase().includes(".pdf");
    const isImage = downloadUrl && (downloadUrl.toLowerCase().includes(".jpg") || downloadUrl.toLowerCase().includes(".jpeg") || downloadUrl.toLowerCase().includes(".png") || downloadUrl.toLowerCase().includes(".webp"));

    // Verify if the local file exists on disk (if it is a local upload path)
    let fileExists = true;
    if (downloadUrl && (downloadUrl.startsWith("/uploads/") || downloadUrl.startsWith("uploads/"))) {
      const relativePath = downloadUrl.startsWith("/") ? downloadUrl.slice(1) : downloadUrl;
      const absolutePath = join(process.cwd(), "public", relativePath);
      fileExists = existsSync(absolutePath);
    }

    // Clean the injected attachment link from displayed content
    let cleanContent = notice.content;
    if (downloadUrl) {
      // Remove the clean link format inserted by the editor
      cleanContent = cleanContent.replace(/<p><strong>📎 Attached Document: <\/strong>.*?<\/p>/gi, '');
      // Remove old-style div attachment blocks
      cleanContent = cleanContent.replace(/<div style="margin-top: 20px;[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/gi, '');
      // Remove any remaining orphaned download links to uploads
      cleanContent = cleanContent.replace(/<[a-z0-9]+>[^<]*<a href="\/uploads\/[^"]+?".*?>.*?<\/a>.*?<\/[a-z0-9]+>/gi, '');
    }

    const hasAttachment = Boolean(downloadUrl && fileExists);

    return (
      <div className="container mx-auto px-4 py-8 md:py-12 min-h-[70vh]">
        <div className="max-w-full mx-auto">
          
          <Link href="/notices" className="group inline-flex items-center text-slate-500 hover:text-primary mb-6 md:mb-8 transition-all duration-300 font-bold bg-white px-5 py-2.5 rounded-full border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-x-1">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            নোটিশ তালিকায় ফিরুন
          </Link>

          <div className="bg-white p-6 md:p-12 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary"></div>
            
            {/* Header row: Date on left + Download Button on top-right */}
            <div className="flex flex-row justify-between items-center gap-4 mb-6">
              <div className="flex items-center gap-2.5 text-primary bg-primary/5 px-4 py-2 rounded-xl text-sm font-bold border border-primary/10">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>

              {hasAttachment && (
                <a
                  href={downloadUrl!}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>{isPdf ? "পিডিএফ ডাউনলোড" : isImage ? "ছবি ডাউনলোড" : "সংযুক্তি ডাউনলোড"}</span>
                </a>
              )}
            </div>
            
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-6 leading-tight tracking-tight">
              {notice.title}
            </h1>
            
            <div className="w-full h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent mb-8"></div>

            <div 
              className="prose prose-lg prose-slate max-w-none prose-img:rounded-2xl prose-img:shadow-md prose-headings:text-slate-800 prose-headings:font-bold prose-a:text-blue-600 prose-p:text-justify prose-p:leading-relaxed ql-editor px-0 mb-4"
              dangerouslySetInnerHTML={{ __html: cleanContent }} 
            />

            {/* Render PDF preview or file download box at bottom if applicable */}
            {hasAttachment && isPdf && (
              <div className="mt-8 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                    <FileText className="w-4 h-4 text-red-500" />
                    <span>সংযুক্ত পিডিএফ ফাইল</span>
                  </div>
                  <a
                    href={downloadUrl!}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-primary font-bold hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" /> ডাউনলোড করুন
                  </a>
                </div>
                <iframe
                  src={downloadUrl!}
                  className="w-full h-[800px] border-none"
                  title="PDF Viewer"
                />
              </div>
            )}

            {hasAttachment && !isPdf && !isImage && (
              <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-blue-500" />
                  <span className="text-sm font-semibold text-slate-700">সংযুক্ত ডকুমেন্ট ফাইল</span>
                </div>
                <a
                  href={downloadUrl!}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> ডাউনলোড করুন
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Failed to load notice:", error);
    return notFound();
  }
}
