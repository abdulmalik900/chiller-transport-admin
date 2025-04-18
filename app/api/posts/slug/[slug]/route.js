import { NextResponse } from 'next/server';
import prisma from '@/lib/PrismaInstance';

// GET a post by slug
export async function GET(request, context) {
  try {
    const slug = context.params.slug;
    
    const post = await prisma.blogPost.findFirst({
      where: { slug },
      include: {
        author: true,
      },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: `Post with slug "${slug}" not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error(`Error fetching post:`, error);
    return NextResponse.json(
      { error: `Failed to fetch post` },
      { status: 500 }
    );
  }
} 