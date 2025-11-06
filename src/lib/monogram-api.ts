// ================================================================
// MONOGRAM API HELPERS
// ================================================================
// Helper functions for common operations
// Use these in your React components
// 
// NOTE: This file will have TypeScript errors until you:
// 1. Add Supabase credentials to .env.local
// 2. Run: npm run prisma:generate
// 3. Uncomment type exports in src/lib/prisma.ts
// ================================================================

import { prisma } from './prisma';

// @ts-ignore - Types will be available after running prisma:generate
import type { 
  Space, 
  Membership, 
  Prompt, 
  Response, 
  Newsletter,
  Transaction,
  Badge,
  StoreItem,
  Purchase 
} from '@prisma/client';

// ================================================================
// USER OPERATIONS
// ================================================================

/**
 * Get user profile with stats
 */
export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
      userBadges: {
        include: { badge: true },
        where: { isDisplayed: true },
        orderBy: { displayOrder: 'asc' }
      },
      _count: {
        select: {
          createdSpaces: true,
          memberships: true,
          responses: true
        }
      }
    }
  });
}

/**
 * Update user streak (call daily via cron)
 */
export async function updateUserStreak(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) return null;

  const today = new Date();
  const lastActive = user.lastActiveDate;
  
  let newStreak = user.currentStreak;
  
  if (!lastActive) {
    newStreak = 1;
  } else {
    const daysSince = Math.floor(
      (today.getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSince === 1) {
      newStreak = user.currentStreak + 1;
    } else if (daysSince > 1) {
      newStreak = 1; // Streak broken
    }
  }

  return await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastActiveDate: today
    }
  });
}

// ================================================================
// SPACE OPERATIONS
// ================================================================

/**
 * Create a new space
 */
export async function createSpace(data: {
  name: string;
  description?: string;
  leaderId: string;
  accessType?: 'Public' | 'Private';
  rotationType?: 'ROUND_ROBIN' | 'MANUAL' | 'RANDOM';
}) {
  return await prisma.$transaction(async (tx) => {
    // Create space
    const space = await tx.space.create({
      data: {
        name: data.name,
        description: data.description,
        leaderId: data.leaderId,
        accessType: data.accessType || 'Public',
        rotationType: data.rotationType || 'ROUND_ROBIN'
      }
    });

    // Add leader as member
    await tx.membership.create({
      data: {
        spaceId: space.id,
        userId: data.leaderId,
        role: 'ADMIN'
      }
    });

    return space;
  });
}

/**
 * Get user's spaces
 */
export async function getUserSpaces(userId: string) {
  return await prisma.space.findMany({
    where: {
      memberships: {
        some: { userId }
      }
    },
    include: {
      leader: {
        select: { id: true, name: true, avatarUrl: true }
      },
      currentCurator: {
        select: { id: true, name: true, avatarUrl: true }
      },
      _count: {
        select: { memberships: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

/**
 * Get next curator for a space
 */
export async function getNextCurator(spaceId: string): Promise<string | null> {
  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    include: {
      memberships: {
        where: { role: { in: ['CURATOR', 'ADMIN'] } },
        orderBy: { joinedAt: 'asc' }
      },
      curatorRotations: {
        orderBy: { weekNumber: 'desc' },
        take: 1
      }
    }
  });

  if (!space || space.memberships.length === 0) return null;

  if (space.rotationType === 'RANDOM') {
    const randomIndex = Math.floor(Math.random() * space.memberships.length);
    return space.memberships[randomIndex].userId;
  }

  if (space.rotationType === 'ROUND_ROBIN') {
    const lastCurator = space.curatorRotations[0];
    if (!lastCurator) return space.memberships[0].userId;

    const lastIndex = space.memberships.findIndex(
      m => m.userId === lastCurator.userId
    );
    const nextIndex = (lastIndex + 1) % space.memberships.length;
    return space.memberships[nextIndex].userId;
  }

  return null; // Manual rotation
}

/**
 * Assign next curator
 */
export async function assignNextCurator(spaceId: string) {
  const nextCuratorId = await getNextCurator(spaceId);
  if (!nextCuratorId) return null;

  const space = await prisma.space.findUnique({
    where: { id: spaceId },
    select: { currentWeek: true }
  });

  return await prisma.$transaction(async (tx) => {
    // Update space
    await tx.space.update({
      where: { id: spaceId },
      data: {
        currentCuratorId: nextCuratorId,
        currentWeek: { increment: 1 }
      }
    });

    // Record rotation
    await tx.curatorRotation.create({
      data: {
        spaceId,
        userId: nextCuratorId,
        weekNumber: (space?.currentWeek || 0) + 1
      }
    });

    return nextCuratorId;
  });
}

// ================================================================
// PROMPT & RESPONSE OPERATIONS
// ================================================================

/**
 * Create prompts for the week
 */
export async function createPrompts(data: {
  spaceId: string;
  curatorId: string;
  weekNumber: number;
  prompts: Array<{
    question: string;
    order: number;
    imageUrl?: string;
    musicUrl?: string;
    mediaType?: 'IMAGE' | 'MUSIC' | 'VIDEO';
  }>;
}) {
  return await prisma.prompt.createMany({
    data: data.prompts.map(p => ({
      spaceId: data.spaceId,
      curatorId: data.curatorId,
      weekNumber: data.weekNumber,
      question: p.question,
      order: p.order,
      imageUrl: p.imageUrl,
      musicUrl: p.musicUrl,
      mediaType: p.mediaType,
      isPublished: false
    }))
  });
}

/**
 * Submit response to prompt
 */
export async function submitResponse(data: {
  promptId: string;
  userId: string;
  content: string;
  imageUrl?: string;
  musicUrl?: string;
  isDraft?: boolean;
}) {
  return await prisma.$transaction(async (tx) => {
    // Create/update response
    const response = await tx.response.upsert({
      where: {
        promptId_userId: {
          promptId: data.promptId,
          userId: data.userId
        }
      },
      create: {
        promptId: data.promptId,
        userId: data.userId,
        content: data.content,
        imageUrl: data.imageUrl,
        musicUrl: data.musicUrl,
        isDraft: data.isDraft ?? false
      },
      update: {
        content: data.content,
        imageUrl: data.imageUrl,
        musicUrl: data.musicUrl,
        isDraft: data.isDraft ?? false,
        updatedAt: new Date()
      }
    });

    // If not draft, award tokens
    if (!data.isDraft) {
      await awardTokens({
        userId: data.userId,
        amount: 50,
        type: 'EARN_RESPONSE',
        reason: 'Submitted weekly response',
        promptId: data.promptId
      });
    }

    return response;
  });
}

/**
 * Get week's prompts and responses
 */
export async function getWeekPrompts(spaceId: string, weekNumber: number) {
  return await prisma.prompt.findMany({
    where: {
      spaceId,
      weekNumber,
      isPublished: true
    },
    include: {
      curator: {
        select: { id: true, name: true, avatarUrl: true }
      },
      responses: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true }
          }
        },
        where: { isDraft: false }
      }
    },
    orderBy: { order: 'asc' }
  });
}

// ================================================================
// TOKEN & GAMIFICATION OPERATIONS
// ================================================================

/**
 * Award tokens to user
 */
export async function awardTokens(data: {
  userId: string;
  amount: number;
  type: 'EARN_RESPONSE' | 'EARN_CURATOR' | 'EARN_STREAK' | 'EARN_BADGE' | 'EARN_GIFT';
  reason: string;
  spaceId?: string;
  promptId?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // Update user balance
    await tx.user.update({
      where: { id: data.userId },
      data: { tokenBalance: { increment: data.amount } }
    });

    // Create transaction record
    return await tx.transaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        reason: data.reason,
        spaceId: data.spaceId,
        promptId: data.promptId
      }
    });
  });
}

/**
 * Spend tokens
 */
export async function spendTokens(data: {
  userId: string;
  amount: number;
  type: 'SPEND_PURCHASE' | 'SPEND_GIFT';
  reason: string;
  itemId?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
    select: { tokenBalance: true }
  });

  if (!user || user.tokenBalance < data.amount) {
    throw new Error('Insufficient tokens');
  }

  return await prisma.$transaction(async (tx) => {
    // Deduct tokens
    await tx.user.update({
      where: { id: data.userId },
      data: { tokenBalance: { decrement: data.amount } }
    });

    // Create transaction record
    return await tx.transaction.create({
      data: {
        userId: data.userId,
        amount: -data.amount,
        type: data.type,
        reason: data.reason,
        itemId: data.itemId
      }
    });
  });
}

/**
 * Check and award badge
 */
export async function checkAndAwardBadge(
  userId: string, 
  badgeName: string
) {
  // Check if user already has badge
  const existing = await prisma.userBadge.findFirst({
    where: {
      userId,
      badge: { name: badgeName }
    }
  });

  if (existing) return null;

  // Get badge
  const badge = await prisma.badge.findUnique({
    where: { name: badgeName }
  });

  if (!badge) return null;

  // Award badge
  return await prisma.$transaction(async (tx) => {
    const userBadge = await tx.userBadge.create({
      data: {
        userId,
        badgeId: badge.id
      }
    });

    // Award tokens for badge (100 tokens)
    await awardTokens({
      userId,
      amount: 100,
      type: 'EARN_BADGE',
      reason: `Earned badge: ${badge.name}`
    });

    return userBadge;
  });
}

/**
 * Purchase store item
 */
export async function purchaseItem(userId: string, itemId: string) {
  const item = await prisma.storeItem.findUnique({
    where: { id: itemId }
  });

  if (!item || !item.isAvailable) {
    throw new Error('Item not available');
  }

  if (item.isLimited && item.stock !== null && item.stock <= 0) {
    throw new Error('Item out of stock');
  }

  // Check existing purchase
  const existing = await prisma.purchase.findUnique({
    where: {
      userId_itemId: { userId, itemId }
    }
  });

  if (existing) {
    throw new Error('Item already purchased');
  }

  return await prisma.$transaction(async (tx) => {
    // Spend tokens
    await spendTokens({
      userId,
      amount: item.price,
      type: 'SPEND_PURCHASE',
      reason: `Purchased: ${item.name}`,
      itemId
    });

    // Create purchase
    const purchase = await tx.purchase.create({
      data: {
        userId,
        itemId,
        pricePaid: item.price
      }
    });

    // Decrement stock if limited
    if (item.isLimited && item.stock !== null) {
      await tx.storeItem.update({
        where: { id: itemId },
        data: { stock: { decrement: 1 } }
      });
    }

    return purchase;
  });
}

/**
 * Send token gift
 */
export async function sendTokenGift(data: {
  fromUserId: string;
  toUserId: string;
  amount: number;
  message?: string;
}) {
  return await prisma.$transaction(async (tx) => {
    // Spend tokens from sender
    await spendTokens({
      userId: data.fromUserId,
      amount: data.amount,
      type: 'SPEND_GIFT',
      reason: `Gift sent to user`
    });

    // Award tokens to receiver
    await awardTokens({
      userId: data.toUserId,
      amount: data.amount,
      type: 'EARN_GIFT',
      reason: `Gift received from user`
    });

    // Create gift record
    return await tx.tokenGift.create({
      data: {
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        amount: data.amount,
        message: data.message
      }
    });
  });
}

// ================================================================
// NEWSLETTER OPERATIONS
// ================================================================

/**
 * Generate newsletter
 */
export async function generateNewsletter(data: {
  spaceId: string;
  weekNumber: number;
  curatorId: string;
  title: string;
  theme?: string;
  footerNote?: string;
}) {
  return await prisma.newsletter.create({
    data: {
      spaceId: data.spaceId,
      weekNumber: data.weekNumber,
      curatorId: data.curatorId,
      title: data.title,
      theme: data.theme,
      footerNote: data.footerNote,
      isPublished: false
    }
  });
}

/**
 * Publish newsletter
 */
export async function publishNewsletter(
  newsletterId: string,
  publicUrl: string,
  pdfUrl?: string
) {
  return await prisma.newsletter.update({
    where: { id: newsletterId },
    data: {
      isPublished: true,
      publishedAt: new Date(),
      publicUrl,
      pdfUrl
    }
  });
}

/**
 * Get space newsletters
 */
export async function getSpaceNewsletters(spaceId: string) {
  return await prisma.newsletter.findMany({
    where: { spaceId },
    orderBy: { weekNumber: 'desc' },
    take: 10
  });
}

// ================================================================
// LEADERBOARD QUERIES
// ================================================================

/**
 * Get top users by tokens
 */
export async function getTokenLeaderboard(limit: number = 10) {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      tokenBalance: true,
      currentStreak: true
    },
    orderBy: { tokenBalance: 'desc' },
    take: limit
  });
}

/**
 * Get top users by streak
 */
export async function getStreakLeaderboard(limit: number = 10) {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      currentStreak: true,
      longestStreak: true
    },
    orderBy: { currentStreak: 'desc' },
    take: limit
  });
}

/**
 * Get space leaderboard
 */
export async function getSpaceLeaderboard(spaceId: string, limit: number = 10) {
  return await prisma.membership.findMany({
    where: { spaceId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true
        }
      }
    },
    orderBy: [
      { totalSubmissions: 'desc' },
      { weeklyStreak: 'desc' }
    ],
    take: limit
  });
}
