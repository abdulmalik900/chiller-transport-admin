import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET a post by ID
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: true,
      },
    });
    
    if (!post) {
      return NextResponse.json(
        { error: `Post with ID ${id} not found` },
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

// PUT - update a post by ID
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const data = await request.json();
    
    // Add validation here
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // First check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { error: `Post with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    // Generate slug from title if not provided
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
    }
    
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        metadesc: data.metadesc,
        published: data.published,
        authorId: data.authorId,
        img: data.img,
        tags: data.tags,
        updatedAt: new Date(),
      },
      include: {
        author: true,
      },
    });
    
    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error(`Error updating post:`, error);
    return NextResponse.json(
      { error: `Failed to update post` },
      { status: 500 }
    );
  }
}

// DELETE - delete a post by ID
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    // First check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });
    
    if (!existingPost) {
      return NextResponse.json(
        { error: `Post with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    await prisma.blogPost.delete({
      where: { id },
    });
    
    return NextResponse.json({
      message: `Post with ID ${id} deleted successfully`
    });
  } catch (error) {
    console.error(`Error deleting post:`, error);
    return NextResponse.json(
      { error: `Failed to delete post` },
      { status: 500 }
    );
  }
} 