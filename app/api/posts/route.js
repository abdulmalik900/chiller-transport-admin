import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all posts
export async function GET(request) {
  try {
    // Get all posts with their authors
    const posts = await prisma.blogPost.findMany({
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST - create a new post
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Add validation here
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        metadesc: data.metadesc || '',
        img: data.img || '',
        tags: data.tags || [],
        published: data.published || false,
        authorId: data.authorId,
      },
      include: {
        author: true,
      },
    });
    
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

// DELETE - delete multiple posts
export async function DELETE(request) {
  try {
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Post IDs are required' },
        { status: 400 }
      );
    }
    
    const deletedPosts = await prisma.blogPost.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
    
    return NextResponse.json({
      count: deletedPosts.count,
      message: `${deletedPosts.count} posts deleted successfully`,
    });
  } catch (error) {
    console.error('Error deleting posts:', error);
    return NextResponse.json(
      { error: 'Failed to delete posts' },
      { status: 500 }
    );
  }
} 