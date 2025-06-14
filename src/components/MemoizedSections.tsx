import React from 'react'
import StatsSection from './modals/sections/StatsSection'
import AbilitiesSection from './modals/sections/AbilitiesSection'
import ElementAdvantages from './modals/sections/ElementAdvantages'
import RuneEquipment from './modals/sections/RuneEquipment'
import UpgradeSection from './modals/sections/UpgradeSection'

// Memoized sections for better performance
export const MemoizedStatsSection = React.memo(StatsSection)
export const MemoizedAbilitiesSection = React.memo(AbilitiesSection)
export const MemoizedElementAdvantages = React.memo(ElementAdvantages)
export const MemoizedRuneEquipment = React.memo(RuneEquipment)
export const MemoizedUpgradeSection = React.memo(UpgradeSection)

// Add display names for debugging
MemoizedStatsSection.displayName = 'MemoizedStatsSection'
MemoizedAbilitiesSection.displayName = 'MemoizedAbilitiesSection'
MemoizedElementAdvantages.displayName = 'MemoizedElementAdvantages'
MemoizedRuneEquipment.displayName = 'MemoizedRuneEquipment'
MemoizedUpgradeSection.displayName = 'MemoizedUpgradeSection' 