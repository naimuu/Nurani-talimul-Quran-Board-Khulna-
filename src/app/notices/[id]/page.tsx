import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";

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

    // Extract the download URL
    const downloadLinkMatch = notice.content.match(/href="(\/uploads\/notices\/[^"]+)"/);
    const downloadUrl = downloadLinkMatch ? downloadLinkMatch[1] : null;
    const isPdf = downloadUrl?.toLowerCase().endsWith(".pdf");
    
    // Aggressively clean the injected text that Quill reformatted
    let cleanContent = notice.content;
    if (downloadUrl) {
      // 1. Remove the exact div structure if it exists
      cleanContent = cleanContent.replace(/<div style="margin-top: 20px;[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<\/div>/gi, '');
      
      // 2. Remove if Quill stripped it into bare tags (e.g., <p>PDF</p><p>filename.pdf</p><p><a>Download</a></p>)
      cleanContent = cleanContent.replace(/<[a-z0-9]+>\s*PDF\s*<\/[a-z0-9]+>[\s\S]*?<[a-z0-9]+>.*?\.pdf\s*<\/[a-z0-9]+>[\s\S]*?<[a-z0-9]+>.*?<a href="\/uploads\/notices\/[^"]+".*?>Download<\/a>.*?<\/[a-z0-9]+>/gi, '');
      
      // 3. Remove if Quill merged them into a single tag with line breaks
      cleanContent = cleanContent.replace(/<[a-z0-9]+>[^<]*PDF[\s\S]*?<a href="\/uploads\/notices\/[^"]+".*?>Download<\/a>.*?<\/[a-z0-9]+>/gi, '');

      // 5. Remove the new clean link format
      cleanContent = cleanContent.replace(/<p><strong>📎 Attached Document: <\/strong>.*?<\/p>/gi, '');
    }

    return (
      <div className="container mx-auto px-4 py-8 md:py-12 min-h-[70vh]">
        <div className="max-w-full mx-auto">
          
          <Link href="/notices" className="group inline-flex items-center text-slate-500 hover:text-primary mb-6 md:mb-8 transition-all duration-300 font-bold bg-white px-5 py-2.5 rounded-full border border-slate-200/60 shadow-sm hover:shadow-md hover:-translate-x-1">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            নোটিশ তালিকায় ফিরুন
          </Link>

          <div className="bg-white p-6 md:p-12 rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/80 to-primary"></div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
              <div className="flex items-center gap-3 text-primary bg-primary/5 px-4 py-2 rounded-xl text-sm font-bold border border-primary/10">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-black text-slate-800 mb-6 leading-tight tracking-tight">
              {notice.title}
            </h1>
            
            <div className="w-full h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent mb-8"></div>

            <div 
              className="prose prose-lg prose-slate max-w-none prose-img:rounded-2xl prose-img:shadow-md prose-headings:text-slate-800 prose-headings:font-bold prose-a:text-blue-600 prose-p:text-justify prose-p:leading-relaxed ql-editor px-0 mb-4"
              dangerouslySetInnerHTML={{ __html: cleanContent }} 
            />

            {isPdf && (
              <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <iframe 
                  src={downloadUrl} 
                  className="w-full h-[800px] border-none"
                  title="PDF Viewer"
                />
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
