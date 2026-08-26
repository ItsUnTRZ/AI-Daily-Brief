import { prisma } from "@/lib/db";

export async function getFeaturedPost() {
  const today = new Date().toISOString().slice(0, 10);
  // post whose featuredUntil >= today, newest first
  const featured = await prisma.post.findFirst({
    where: {
      published: true,
      OR: [
        { featuredUntil: { gte: today } },
        { featuredUntil: null },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return featured;
}

export async function getRecentPosts(exceptId?: string, limit = 20) {
  return prisma.post.findMany({
    where: { published: true, ...(exceptId ? { id: { not: exceptId } } : {}) },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.post.findUnique({ where: { slug } });
}

export async function getAllPublished() {
  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
}
