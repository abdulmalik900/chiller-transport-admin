import { NextResponse } from 'next/server';
import prisma from '@/lib/PrismaInstance';

// GET all authors
export async function GET(request) {
  try {
    let authors = await prisma.author.findMany({
      include: {
        posts: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Add post count for convenience
    authors = authors.map(author => ({
      ...author,
      postCount: author.posts.length
    }));
    
    return NextResponse.json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    );
  }
}

// POST - create a new author
export async function POST(request) {
  try {
    const data = await request.json();
    
    // Add validation here
    if (!data.name || !data.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    const author = await prisma.author.create({
      data: {
        name: data.name,
        email: data.email,
        bio: data.bio || '',
        avatarUrl: data.avatarUrl || data.image || null
      }
    });
    
    return NextResponse.json(author, { status: 201 });
  } catch (error) {
    console.error('Error creating author:', error);
    return NextResponse.json(
      { error: 'Failed to create author' },
      { status: 500 }
    );
  }
}

// DELETE - delete multiple authors
export async function DELETE(request) {
  try {
    const { ids } = await request.json();
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Author IDs are required' },
        { status: 400 }
      );
    }
    
    // Check if any authors have posts
    const authorsWithPosts = await prisma.author.findMany({
      where: {
        id: { in: ids },
        posts: { some: {} }
      },
      select: {
        id: true,
        name: true
      }
    });
    
    if (authorsWithPosts.length > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete authors with posts',
          authors: authorsWithPosts 
        },
        { status: 400 }
      );
    }
    
    const deletedAuthors = await prisma.author.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    
    return NextResponse.json({
      count: deletedAuthors.count,
      message: `${deletedAuthors.count} authors deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting authors:', error);
    return NextResponse.json(
      { error: 'Failed to delete authors' },
      { status: 500 }
    );
  }
} 