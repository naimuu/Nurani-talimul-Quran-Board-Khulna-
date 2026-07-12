import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Utility to strip HTML tags to show a clean excerpt
function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '');
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

  try {
    const pageData = await (prisma as any).pageContent.findUnique({
      where: { slug }
    });
    
    if (pageData && pageData.content) {
      const imgMatch = pageData.content.match(/<img[^>]+src="([^">]+)"/);
      if (imgMatch && imgMatch[1]) {
        dynamicImageSrc = imgMatch[1];
        hasImage = true;
      } else {
        hasImage = false;
      }

      // Get plain text and take first 250 characters
      const plainText = stripHtml(pageData.content).trim();
      if (plainText) {
         excerpt = plainText.substring(0, 250) + "...";
      }
    }
  } catch (err) {
    // Fallback to default if DB fails
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-200 flex flex-col hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <h4 className="font-bold text-blue-900 text-lg leading-tight mb-1">{name}</h4>
          <span className="text-xs font-bold text-red-500">{title}</span>
        </div>
        {hasImage && (
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 flex-shrink-0 relative">
            <div className="absolute inset-0 bg-slate-200" />
            <Image 
              src={dynamicImageSrc} 
              alt={title} 
              fill 
              className="object-cover relative z-10" 
              sizes="64px" 
            />
          </div>
        )}
      </div>
      <p className="text-sm text-slate-600 mb-6 leading-relaxed text-justify line-clamp-6">
        {excerpt}
      </p>
      
      <Link href={link} className="inline-block bg-blue-800 text-white text-xs font-bold px-6 py-2 rounded-full hover:bg-blue-900 transition-colors w-max mt-auto">
        বিস্তারিত
      </Link>
    </div>
  );
}
