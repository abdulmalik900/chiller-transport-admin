import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET all authors
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function GET(request) {
  try {
    const authors = await prisma.author.findMany({
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
    
    const transformedAuthors = authors.map(author => ({
      id: author.id,
      name: author.name,
      email: author.email,
      bio: author.bio,
      avatarUrl: author.avatarUrl,
      postCount: author.posts.length,
      createdAt: author.createdAt,
      updatedAt: author.updatedAt
    }));
    
    return NextResponse.json(transformedAuthors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    );
  }
}

/**
 * POST - create a new author
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!data.name?.trim() || !data.email?.trim()) {
      return NextResponse.json(
        { error: 'Name and email are required fields' },
        { status: 400 }
      );
    }
    
    const author = await prisma.author.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        bio: data.bio?.trim() || '',
        avatarUrl: data.avatarUrl || null
      }
    });
    
    return NextResponse.json(author, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'An author with this email already exists' },
        { status: 409 }
      );
    }

    console.error('Error creating author:', error);
    return NextResponse.json(
      { error: 'Failed to create author' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - delete multiple authors
 * @param {Request} request
 * @returns {Promise<NextResponse>}
 */
export async function DELETE(request) {
  try {
    const { ids } = await request.json();
    
    if (!ids?.length || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'Valid author IDs array is required' },
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
        { status: 409 }
      );
    }
    
    const deletedAuthors = await prisma.author.deleteMany({
      where: {
        id: { in: ids }
      }
    });
    
    return NextResponse.json({
      success: true,
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