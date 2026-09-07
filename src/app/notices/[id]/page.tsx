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
    const isImage = downloadUrl && (downloadUrl.startsWith("data:image/") || downloadUrl.toLowerCase().includes(".jpg") || downloadUrl.toLowerCase().includes(".jpeg") || downloadUrl.toLowerCase().includes(".png") || downloadUrl.toLowerCase().includes(".webp") || downloadUrl.toLowerCase().includes(".gif") || downloadUrl.toLowerCase().includes(".svg"));

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
      <div className="min-h-[calc(100vh-320px)] bg-slate-50 py-6 md:py-8">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-10">
          
          <Link href="/notices" className="group inline-flex items-center text-slate-600 hover:text-emerald-700 mb-4 transition-all duration-200 text-xs font-semibold bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs hover:-translate-x-0.5">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            নোটিশ তালিকায় ফিরুন
          </Link>

          <div className="bg-white p-5 md:p-8 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
            
            {/* Header row: Date on left + Download Button on top-right */}
            <div className="flex flex-row justify-between items-center gap-3 mb-4">
              <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg text-xs font-semibold border border-emerald-100">
                <Calendar className="w-3.5 h-3.5" />
                <span>{date}</span>
              </div>

              {hasAttachment && (
                <a
                  href={downloadUrl!}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs hover:shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isPdf ? "পিডিএফ ডাউনলোড" : isImage ? "ছবি ডাউনলোড" : "সংযুক্তি ডাউনলোড"}</span>
                </a>
              )}
            </div>
            
            <h1 className="text-lg md:text-2xl font-bold text-slate-800 mb-4 leading-snug">
              {notice.title}
            </h1>
            
            <div className="w-full h-px bg-slate-100 mb-5"></div>

            <div 
              className="prose prose-sm sm:prose-base prose-slate max-w-none prose-img:rounded-xl prose-img:shadow-xs prose-headings:text-slate-800 prose-headings:font-bold prose-a:text-emerald-600 prose-p:leading-relaxed ql-editor px-0 mb-4 text-slate-700 text-xs sm:text-sm"
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
