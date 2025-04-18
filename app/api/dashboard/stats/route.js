import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Format a date to a readable string
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (e) {
    return "Unknown date";
  }
}

// GET dashboard statistics
export async function GET() {
  try {
    console.log('Fetching dashboard stats...');
    
    // Get counts directly - no complex logic
    const [totalPosts, totalAuthors] = await Promise.all([
      prisma.blogPost.count(),
      prisma.author.count()
    ]);
    
    console.log('Counts:', { totalPosts, totalAuthors });
    
    // Get recently created posts
    const recentPosts = await prisma.blogPost.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { author: true }
    });
    
    console.log('Recent posts:', recentPosts.length);
    
    // Get current month stats
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const postsThisMonth = await prisma.blogPost.count({
      where: {
        createdAt: { gte: firstDayOfMonth }
      }
    });
    
    console.log('Posts this month:', postsThisMonth);
    
    // Return all data
    return NextResponse.json({
      totalPosts,
      totalAuthors,
      postsThisMonth,
      recentPosts,
      recentActivity: [] // Simplified to empty array for now
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics', details: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get recent activity
async function getRecentActivity(thirtyDaysAgo) {
  try {
    // Get recent posts
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
        author: post.author?.name || 'Unknown Author',
        authorId: post.author?.id,
        date: post.createdAt,
        formattedDate: formatDate(post.createdAt)
      })),
      ...recentAuthors.map(author => ({
        type: 'author_created',
        id: author.id,
        name: author.name || 'Unknown',
        date: author.createdAt,
        formattedDate: formatDate(author.createdAt)
      })),
    ];
    
    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return activities.slice(0, 10);
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
} 