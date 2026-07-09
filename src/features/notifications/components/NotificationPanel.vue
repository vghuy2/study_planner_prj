<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/features/notifications/stores/notification.store'
import { Bell, Check, CheckCheck, Trash2, X, Timer, Star, AlertTriangle, Clock, Info } from 'lucide-vue-next'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const router  = useRouter()
const store   = useNotificationStore()
const isOpen  = ref(false)
const panelRef = ref(null)

// ─── Outside click to close ────────────────────────────────────────────────
function handleClickOutside(e) {
  if (panelRef.value && !panelRef.value.contains(e.target)) {
    isOpen.value = false
  }
}
onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

function toggle() {
  isOpen.value = !isOpen.value
}

// ─── Notification icon map ─────────────────────────────────────────────────
const iconMap = {
  check:  Check,
  clock:  Clock,
  alert:  AlertTriangle,
  timer:  Timer,
  star:   Star,
  info:   Info,
}

const colorMap = {
  task_completed:  { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  task_due_soon:   { bg: 'bg-amber-500/15',   text: 'text-amber-400',   dot: 'bg-amber-400'   },
  task_overdue:    { bg: 'bg-red-500/15',      text: 'text-red-400',     dot: 'bg-red-400'     },
  pomodoro_done:   { bg: 'bg-blue-500/15',     text: 'text-blue-400',    dot: 'bg-blue-400'    },
  pomodoro_break:  { bg: 'bg-sky-500/15',      text: 'text-sky-400',     dot: 'bg-sky-400'     },
  goal_achieved:   { bg: 'bg-violet-500/15',   text: 'text-violet-400',  dot: 'bg-violet-400'  },
  system:          { bg: 'bg-gray-500/15',      text: 'text-gray-400',    dot: 'bg-gray-400'    },
}

function getColor(type) {
  return colorMap[type] || colorMap.system
}

function getIcon(iconKey) {
  return iconMap[iconKey] || Info
}

function formatTime(iso) {
  return dayjs(iso).fromNow()
}

function handleNotifClick(notif) {
  store.markRead(notif.id)
  if (notif.link) {
    router.push(notif.link)
    isOpen.value = false
  }
}
</script>

<template>
  <div ref="panelRef" class="relative">
    <!-- Bell button -->
    <button
      @click="toggle"
      class="relative p-2 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-white/[0.06] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
      :class="isOpen ? 'bg-white/[0.06] text-gray-200' : ''"
      aria-label="Notifications"
    >
      <Bell class="w-[18px] h-[18px]" />
      <!-- Unread badge -->
      <transition name="badge-pop">
        <span
          v-if="store.hasUnread"
          class="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[16px] h-4 px-[3px] text-[9px] font-bold text-white bg-blue-500 rounded-full ring-[1.5px] ring-gray-950 tabular"
        >
          {{ store.unreadCount > 9 ? '9+' : store.unreadCount }}
        </span>
      </transition>
    </button>

    <!-- ── Dropdown Panel ───────────────────────────────────────────────── -->
    <transition name="panel-slide">
      <div
        v-if="isOpen"
        class="absolute right-0 top-[calc(100%+10px)] w-[360px] max-w-[calc(100vw-2rem)] z-50 animate-fade-up"
        style="animation-duration: 0.2s;"
      >
        <!-- Outer bezel border -->
        <div class="p-[1px] rounded-2xl bg-gradient-to-b from-white/[0.12] to-white/[0.03]">
          <div class="bg-[#0d1420] rounded-[15px] overflow-hidden shadow-2xl shadow-black/60">

            <!-- Header -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div class="flex items-center gap-2">
                <span class="text-[13px] font-semibold text-white">Notifications</span>
                <span
                  v-if="store.unreadCount"
                  class="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-semibold tabular"
                >
                  {{ store.unreadCount }} new
                </span>
              </div>
              <div class="flex items-center gap-1">
                <button
                  v-if="store.hasUnread"
                  @click="store.markAllRead()"
                  class="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-gray-400 hover:text-gray-200 hover:bg-white/[0.05] transition-colors"
                  title="Mark all read"
                >
                  <CheckCheck class="w-3.5 h-3.5" />
                  All read
                </button>
                <button
                  v-if="store.notifications.length"
                  @click="store.clearAll()"
                  class="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Clear all"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="isOpen = false"
                  class="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/[0.05] transition-colors"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Notification List -->
            <div class="overflow-y-auto max-h-[400px] custom-scrollbar">
              <!-- Empty state -->
              <div
                v-if="!store.notifications.length"
                class="flex flex-col items-center justify-center py-12 px-4"
              >
                <div class="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                  <Bell class="w-5 h-5 text-gray-600" />
                </div>
                <p class="text-[13px] font-medium text-gray-500">No notifications yet</p>
                <p class="text-[11px] text-gray-700 mt-0.5">Complete tasks or sessions to see activity here.</p>
              </div>

              <!-- Items -->
              <TransitionGroup name="notif-list" tag="div">
                <div
                  v-for="notif in store.recent"
                  :key="notif.id"
                  @click="handleNotifClick(notif)"
                  class="group relative flex gap-3 px-4 py-3.5 border-b border-white/[0.04] last:border-0 transition-colors cursor-pointer"
                  :class="notif.read ? 'hover:bg-white/[0.02]' : 'bg-blue-500/[0.04] hover:bg-blue-500/[0.07]'"
                >
                  <!-- Icon -->
                  <div
                    class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    :class="getColor(notif.type).bg"
                  >
                    <component
                      :is="getIcon(notif.icon)"
                      class="w-[15px] h-[15px]"
                      :class="getColor(notif.type).text"
                    />
                  </div>

                  <!-- Text -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                      <p class="text-[12.5px] font-semibold text-gray-200 leading-tight truncate">
                        {{ notif.title }}
                      </p>
                      <span class="text-[10.5px] text-gray-600 shrink-0 mt-px">{{ formatTime(notif.createdAt) }}</span>
                    </div>
                    <p class="text-[11.5px] text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {{ notif.message }}
                    </p>
                  </div>

                  <!-- Unread dot -->
                  <span
                    v-if="!notif.read"
                    class="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    :class="getColor(notif.type).dot"
                  />

                  <!-- Dismiss button (visible on hover) -->
                  <button
                    @click.stop="store.remove(notif.id)"
                    class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-gray-700 hover:text-gray-400 hover:bg-white/[0.05] transition-all"
                  >
                    <X class="w-3 h-3" />
                  </button>
                </div>
              </TransitionGroup>
            </div>

          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Badge pop animation */
.badge-pop-enter-active { transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s; }
.badge-pop-leave-active { transition: transform 0.15s ease, opacity 0.15s; }
.badge-pop-enter-from   { transform: scale(0.5); opacity: 0; }
.badge-pop-leave-to     { transform: scale(0.5); opacity: 0; }

/* Panel slide */
.panel-slide-enter-active { transition: opacity 0.18s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1); }
.panel-slide-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.panel-slide-enter-from   { opacity: 0; transform: translateY(-8px) scale(0.97); }
.panel-slide-leave-to     { opacity: 0; transform: translateY(-6px) scale(0.97); }

/* Notification list transitions */
.notif-list-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.notif-list-leave-active { transition: all 0.2s ease; position: absolute; width: 100%; }
.notif-list-enter-from   { opacity: 0; transform: translateX(-12px); }
.notif-list-leave-to     { opacity: 0; transform: translateX(12px); }
.notif-list-move         { transition: transform 0.3s ease; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156,163,175,0.15); border-radius: 4px; }
</style>
