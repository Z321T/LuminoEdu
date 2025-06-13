<!-- filepath: d:\git\LuminoEdu\frontend\frontend\src\components\home\StatsGrid.vue -->
<template>
  <div class="stats-grid">
    <div
      v-for="stat in stats"
      :key="stat.label"
      class="stat-card"
      :style="{ '--accent-color': stat.color }"
    >
      <div class="stat-icon">{{ stat.icon }}</div>
      <div class="stat-content">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
        <div
          v-if="stat.change"
          class="stat-change"
          :class="stat.changeType"
        >
          {{ stat.change }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StatItem {
  icon: string
  value: number | string
  label: string
  color: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}

interface Props {
  stats: StatItem[]
}

defineProps<Props>()
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  border-left: 4px solid var(--accent-color);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, var(--accent-color), transparent);
  opacity: 0.1;
  border-radius: 50%;
  transform: translate(30px, -30px);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-color);
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  color: #666;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.stat-change.positive {
  background: #d4edda;
  color: #155724;
}

.stat-change.negative {
  background: #f8d7da;
  color: #721c24;
}

.stat-change.neutral {
  background: #e2e3e5;
  color: #6c757d;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    padding: 20px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 32px;
  }
}
</style>