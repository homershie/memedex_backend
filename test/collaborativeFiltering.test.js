/**
 * 協同過濾推薦系統測試
 */

import { jest } from '@jest/globals'
import {
  buildInteractionMatrix,
  calculateUserSimilarity,
  findSimilarUsers,
  getCollaborativeFilteringRecommendations,
  getCollaborativeFilteringStats,
} from '../utils/collaborativeFiltering.js'

// 模擬數據庫模型
const mockLike = {
  find: jest.fn(),
}

const mockCollection = {
  find: jest.fn(),
}

const mockComment = {
  find: jest.fn(),
}

const mockShare = {
  find: jest.fn(),
}

const mockView = {
  find: jest.fn(),
}

const mockMeme = {
  find: jest.fn(),
}

const mockUser = {
  find: jest.fn(),
}

// 模擬模組
jest.mock('../models/Like.js', () => mockLike)
jest.mock('../models/Collection.js', () => mockCollection)
jest.mock('../models/Comment.js', () => mockComment)
jest.mock('../models/Share.js', () => mockShare)
jest.mock('../models/View.js', () => mockView)
jest.mock('../models/Meme.js', () => mockMeme)
jest.mock('../models/User.js', () => mockUser)

describe('協同過濾推薦系統', () => {
  beforeEach(() => {
    // 重置所有模擬
    jest.clearAllMocks()
  })

  afterEach(() => {
    // 清理
  })

  describe('calculateUserSimilarity', () => {
    it('應該正確計算用戶相似度', () => {
      const user1Interactions = {
        meme1: 1.0,
        meme2: 2.0,
        meme3: 1.5,
      }
      const user2Interactions = {
        meme1: 1.5,
        meme2: 2.5,
        meme3: 1.0,
      }

      const similarity = calculateUserSimilarity(user1Interactions, user2Interactions)
      expect(similarity).toBeGreaterThan(0)
      expect(similarity).toBeLessThanOrEqual(1)
    })

    it('應該處理沒有共同互動的情況', () => {
      const user1Interactions = {
        meme1: 1.0,
        meme2: 2.0,
      }
      const user2Interactions = {
        meme3: 1.5,
        meme4: 2.5,
      }

      const similarity = calculateUserSimilarity(user1Interactions, user2Interactions)
      expect(similarity).toBe(0)
    })

    it('應該處理空互動數據', () => {
      const user1Interactions = {}
      const user2Interactions = {}

      const similarity = calculateUserSimilarity(user1Interactions, user2Interactions)
      expect(similarity).toBe(0)
    })
  })

  describe('findSimilarUsers', () => {
    it('應該找到相似用戶', () => {
      const targetUserId = 'user1'
      const interactionMatrix = {
        user1: {
          meme1: 1.0,
          meme2: 2.0,
          meme3: 1.5,
        },
        user2: {
          meme1: 1.5,
          meme2: 2.5,
          meme3: 1.0,
        },
        user3: {
          meme4: 1.0,
          meme5: 2.0,
        },
      }

      const similarUsers = findSimilarUsers(targetUserId, interactionMatrix, 0.1, 10)
      expect(similarUsers.length).toBeGreaterThan(0)
      expect(similarUsers[0]).toHaveProperty('userId')
      expect(similarUsers[0]).toHaveProperty('similarity')
    })

    it('應該處理目標用戶不存在的情況', () => {
      const targetUserId = 'nonexistent'
      const interactionMatrix = {
        user1: {
          meme1: 1.0,
        },
      }

      const similarUsers = findSimilarUsers(targetUserId, interactionMatrix, 0.1, 10)
      expect(similarUsers.length).toBe(0)
    })
  })

  describe('buildInteractionMatrix', () => {
    it('應該建立互動矩陣', async () => {
      // 模擬數據庫查詢結果
      mockUser.find.mockResolvedValue([{ _id: 'user1' }, { _id: 'user2' }])
      mockMeme.find.mockResolvedValue([{ _id: 'meme1' }, { _id: 'meme2' }])
      mockLike.find.mockResolvedValue([
        { user_id: 'user1', meme_id: 'meme1', createdAt: new Date() },
        { user_id: 'user2', meme_id: 'meme2', createdAt: new Date() },
      ])
      mockCollection.find.mockResolvedValue([])
      mockComment.find.mockResolvedValue([])
      mockShare.find.mockResolvedValue([])
      mockView.find.mockResolvedValue([])

      const matrix = await buildInteractionMatrix(['user1', 'user2'], ['meme1', 'meme2'])
      expect(matrix).toBeDefined()
      expect(typeof matrix).toBe('object')
    })

    it('應該處理空數據的情況', async () => {
      // 模擬空數據
      mockUser.find.mockResolvedValue([])
      mockMeme.find.mockResolvedValue([])
      mockLike.find.mockResolvedValue([])
      mockCollection.find.mockResolvedValue([])
      mockComment.find.mockResolvedValue([])
      mockShare.find.mockResolvedValue([])
      mockView.find.mockResolvedValue([])

      const matrix = await buildInteractionMatrix()
      expect(matrix).toBeDefined()
      expect(Object.keys(matrix).length).toBe(0)
    })
  })

  describe('getCollaborativeFilteringStats', () => {
    it('應該返回統計資訊', async () => {
      // 模擬數據庫查詢結果
      mockUser.find.mockResolvedValue([{ _id: 'user1' }, { _id: 'user2' }])
      mockMeme.find.mockResolvedValue([{ _id: 'meme1' }, { _id: 'meme2' }])
      mockLike.find.mockResolvedValue([
        { user_id: 'user1', meme_id: 'meme1', createdAt: new Date() },
      ])
      mockCollection.find.mockResolvedValue([])
      mockComment.find.mockResolvedValue([])
      mockShare.find.mockResolvedValue([])
      mockView.find.mockResolvedValue([])

      const stats = await getCollaborativeFilteringStats('user1')
      expect(stats).toHaveProperty('user_id')
      expect(stats).toHaveProperty('interaction_count')
      expect(stats).toHaveProperty('similar_users_count')
      expect(stats).toHaveProperty('average_similarity')
    })
  })

  describe('getCollaborativeFilteringRecommendations', () => {
    it('應該生成推薦', async () => {
      // 模擬數據庫查詢結果
      mockUser.find.mockResolvedValue([{ _id: 'user1' }, { _id: 'user2' }])
      mockMeme.find.mockResolvedValue([{ _id: 'meme1' }, { _id: 'meme2' }])
      mockLike.find.mockResolvedValue([
        { user_id: 'user1', meme_id: 'meme1', createdAt: new Date() },
        { user_id: 'user2', meme_id: 'meme2', createdAt: new Date() },
      ])
      mockCollection.find.mockResolvedValue([])
      mockComment.find.mockResolvedValue([])
      mockShare.find.mockResolvedValue([])
      mockView.find.mockResolvedValue([])

      // 模擬迷因查詢結果
      mockMeme.find.mockResolvedValueOnce([
        {
          _id: 'meme1',
          title: 'Test Meme',
          status: 'public',
          hot_score: 100,
          toObject: () => ({
            _id: 'meme1',
            title: 'Test Meme',
            status: 'public',
            hot_score: 100,
          }),
          populate: jest.fn().mockReturnThis(),
        },
      ])

      const recommendations = await getCollaborativeFilteringRecommendations('user1', {
        limit: 10,
        minSimilarity: 0.1,
        maxSimilarUsers: 10,
        excludeInteracted: true,
        includeHotScore: true,
        hotScoreWeight: 0.3,
      })

      expect(Array.isArray(recommendations)).toBe(true)
    })

    it('應該處理用戶沒有互動歷史的情況', async () => {
      // 模擬空互動歷史
      mockUser.find.mockResolvedValue([{ _id: 'user1' }])
      mockMeme.find.mockResolvedValue([{ _id: 'meme1' }])
      mockLike.find.mockResolvedValue([])
      mockCollection.find.mockResolvedValue([])
      mockComment.find.mockResolvedValue([])
      mockShare.find.mockResolvedValue([])
      mockView.find.mockResolvedValue([])

      // 模擬熱門迷因查詢結果
      mockMeme.find.mockResolvedValueOnce([
        {
          _id: 'meme1',
          title: 'Hot Meme',
          status: 'public',
          hot_score: 500,
          toObject: () => ({
            _id: 'meme1',
            title: 'Hot Meme',
            status: 'public',
            hot_score: 500,
          }),
          populate: jest.fn().mockReturnThis(),
        },
      ])

      const recommendations = await getCollaborativeFilteringRecommendations('user1', {
        limit: 10,
      })

      expect(Array.isArray(recommendations)).toBe(true)
      expect(recommendations.length).toBeGreaterThan(0)
      expect(recommendations[0].recommendation_type).toBe('collaborative_fallback')
    })
  })
})
