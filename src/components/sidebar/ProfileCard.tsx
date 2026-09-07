import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Utility to strip HTML tags to show a clean excerpt
function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
}

interface ProfileCardProps {
  slug: string;
  name: string;
  title: string;
  imageSrc: string;
  link: string;
  defaultExcerpt: string;
}

export default async function ProfileCard({ slug, name, title, imageSrc, link, defaultExcerpt }: ProfileCardProps) {
  let excerpt = defaultExcerpt;
  let dynamicImageSrc = imageSrc;
  let hasImage = true;
  let dynamicName = name;
  let dynamicTitle = title;

  try {
    const pageData = await (prisma as any).pageContent.findUnique({
      where: { slug }
    });

    if (pageData && pageData.content) {
      let rawContent = pageData.content;
      
      // If stored as JSON from EditableContent
      try {
        const parsed = JSON.parse(pageData.content);
        if (parsed && typeof parsed === 'object') {
          if (parsed.title) dynamicName = parsed.title;
          if (parsed.subtitle) dynamicTitle = parsed.subtitle;
          if (parsed.html) rawContent = parsed.html;
        }
      } catch {}

      const imgMatch = rawContent.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch && imgMatch[1]) {
        dynamicImageSrc = imgMatch[1];
        hasImage = true;
      } else {
        hasImage = Boolean(imageSrc);
      }

      // Get plain text and take first 200 characters
      const plainText = stripHtml(rawContent).trim();
      if (plainText) {
        excerpt = plainText.substring(0, 200) + "...";
      }
    }
  } catch (err) {
    // Fallback to default if DB fails
  }

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col hover:border-emerald-300 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 text-base leading-tight mb-1 truncate">{dynamicName}</h4>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">{dynamicTitle}</span>
        </div>
        {hasImage && (
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-600/20 flex-shrink-0 relative shadow-2xs">
            <div className="absolute inset-0 bg-slate-100" />
            <Image
              src={dynamicImageSrc}
              alt={dynamicTitle}
              fill
              className="object-cover relative z-10"
              sizes="56px"
            />
          </div>
        )}
      </div>
      <p className="text-xs text-slate-600 mb-4 leading-relaxed text-justify line-clamp-4">
        {excerpt}
      </p>

      <Link href={link} className="inline-flex items-center justify-center bg-[#052e23] hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors w-max mt-auto shadow-2xs">
        বিস্তারিত পড়ুন
      </Link>
    </div>
  );
}
