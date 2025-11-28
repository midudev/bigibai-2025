import { supabaseAdmin } from '@/supabase-admin'
import { ACHIEVEMENTS, type Achievement } from '@/data/achievements'

export async function grantAchievement(userId: string, achievementId: string) {
  if (!ACHIEVEMENTS[achievementId]) {
    console.error(`Achievement ${achievementId} does not exist`)
    return { success: false, error: 'Achievement not found' }
  }

  try {
    // 1. Check if user already has an entry
    const { data: existingData, error: fetchError } = await supabaseAdmin
      .from('user_achievements')
      .select('achievements')
      .eq('user_id', userId)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned"
      console.error('Error fetching user achievements:', fetchError)
      return { success: false, error: fetchError.message }
    }

    let currentAchievements = existingData?.achievements || {}

    // 2. Check if already earned
    if (currentAchievements[achievementId]) {
      return { success: true, new: false } // Already earned
    }

    // 3. Add new achievement
    currentAchievements[achievementId] = {
      created_at: new Date().toISOString(),
    }

    // 4. Upsert
    const { error: upsertError } = await supabaseAdmin.from('user_achievements').upsert({
      user_id: userId,
      achievements: currentAchievements,
    })

    if (upsertError) {
      console.error('Error granting achievement:', upsertError)
      return { success: false, error: upsertError.message }
    }

    // 5. Return achievement data for notification
    const achievement = ACHIEVEMENTS[achievementId]
    return { 
      success: true, 
      new: true,
      achievement: {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        image: achievement.image,
      }
    }
  } catch (error) {
    console.error('Unexpected error granting achievement:', error)
    return { success: false, error: 'Unexpected error' }
  }
}
