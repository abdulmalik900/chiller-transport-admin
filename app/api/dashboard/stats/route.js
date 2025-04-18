import { NextResponse } from 'next/server';
import prisma from '@/lib/PrismaInstance';
import { formatDate } from '@/app/services/apiService';

// GET dashboard statistics
export async function GET() {
  try {
    // Get the current date
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Get total posts count
    const totalPosts = await prisma.blogPost.count();
    
    // Get total authors count - Note: Using Author model, not User
    const totalAuthors = await prisma.author.count();
    
    // Get posts created this month
    const postsThisMonth = await prisma.blogPost.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });
    
    // Get recent posts
    const recentPosts = await prisma.blogPost.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: true,
      },
    });
    
    // Get recent activity
    const recentActivity = await getRecentActivity(thirtyDaysAgo);
    
    return NextResponse.json({
      totalPosts,
      totalAuthors,
      postsThisMonth,
      recentPosts,
      recentActivity,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', message: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get recent activity
async function getRecentActivity(thirtyDaysAgo) {
  try {
    // Get recent posts (created in the last 30 days)
    const recentPosts = await prisma.blogPost.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: true,
      },
      take: 5,
    });
    
    // Get recent authors
    const recentAuthors = await prisma.author.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
    
    // Combine and sort by date
    const activities = [
      ...recentPosts.map(post => ({
        type: 'post_created',
        id: post.id,
        title: post.title,
        author: post.author.name,
        authorId: post.author.id,
        date: post.createdAt,
        formattedDate: formatDate(post.createdAt)
      })),
      ...recentAuthors.map(author => ({
        type: 'author_created',
        id: author.id,
        name: author.name,
        date: author.createdAt,
        formattedDate: formatDate(author.createdAt)
      })),
    ];
    
    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return activities.slice(0, 10); // Return the 10 most recent activities
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return []; // Return empty array on error
  }
} 