import { NextResponse } from 'next/server';
import prisma from '@/lib/PrismaInstance';

// GET an author by ID
export async function GET(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    const author = await prisma.author.findUnique({
      where: { id },
      include: {
        posts: {
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            createdAt: true
          }
        }
      }
    });
    
    if (!author) {
      return NextResponse.json(
        { error: `Author with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    // Add post count for convenience
    const authorWithCount = {
      ...author,
      postCount: author.posts.length
    };
    
    return NextResponse.json(authorWithCount);
  } catch (error) {
    console.error(`Error fetching author:`, error);
    return NextResponse.json(
      { error: `Failed to fetch author` },
      { status: 500 }
    );
  }
}

// PUT - update an author by ID
export async function PUT(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    const data = await request.json();
    
    // Add validation here
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // First check if author exists
    const existingAuthor = await prisma.author.findUnique({
      where: { id }
    });
    
    if (!existingAuthor) {
      return NextResponse.json(
        { error: `Author with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    const updatedAuthor = await prisma.author.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        bio: data.bio,
        avatarUrl: data.avatarUrl || data.image, // Support both field names
        updatedAt: new Date()
      },
      include: {
        posts: {
          select: {
            id: true
          }
        }
      }
    });
    
    // Add post count for convenience
    const authorWithCount = {
      ...updatedAuthor,
      postCount: updatedAuthor.posts.length
    };
    
    return NextResponse.json(authorWithCount);
  } catch (error) {
    console.error(`Error updating author:`, error);
    return NextResponse.json(
      { error: `Failed to update author` },
      { status: 500 }
    );
  }
}

// DELETE - delete an author by ID
export async function DELETE(request, context) {
  try {
    const params = await context.params;
    const id = params.id;
    
    // First check if author exists
    const existingAuthor = await prisma.author.findUnique({
      where: { id },
      include: {
        posts: true
      }
    });
    
    if (!existingAuthor) {
      return NextResponse.json(
        { error: `Author with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    // Check if author has posts
    if (existingAuthor.posts.length > 0) {
      return NextResponse.json(
        { error: `Cannot delete author with ID ${id} because they have associated posts` },
        { status: 400 }
      );
    }
    
    await prisma.author.delete({
      where: { id }
    });
    
    return NextResponse.json({
      message: `Author with ID ${id} deleted successfully`
    });
  } catch (error) {
    console.error(`Error deleting author:`, error);
    return NextResponse.json(
      { error: `Failed to delete author` },
      { status: 500 }
    );
  }
} 