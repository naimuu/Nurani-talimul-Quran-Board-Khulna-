import NoticeBoardClient from "./NoticeBoardClient";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function NoticeBoard() {
  let notices: any[] = [];
  try {
    notices = await (prisma as any).notice.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    });
  } catch (error) {
    console.error("Failed to load notices for sidebar:", error);
  }

  return <NoticeBoardClient notices={notices} />;
}
