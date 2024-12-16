<template>
  <div class="timeline-container">
    <div class="time-axis">
      <label style="text-align: center;margin-left: 10px;">
        <!-- 横线 -->
        <div class="axis-line" :style="{ width: axisWidth }" />

        <!-- 刻度线 -->
        <div class="ticks" :style="{ width: axisWidth }">
          <div
            v-for="line in allTicks"
            :key="line.key"
            class="tick"
            :style="{
              left: line.position + 'px',
              height: line.height + 'px',
              backgroundColor: itemline == line.val ? '#00e676' : '#bbbbbb'
            }"
          >
            <div v-if="itemline == line.val" class="piece">
              <div class="triangle" />
              <div class="txt">14</div>
            </div>
          </div>
        </div>

        <!-- 小时数字 -->
        <div class="time-ticks" :style="{ width: axisWidth }">
          <div
            v-for="hour in paddedHours"
            :key="hour.index"
            class="tick-label"
            :style="{
              left: hour.index == 0 ? '-23px' :
                (hour.index * hourWidth + leftPadding - hourWidth / 2) + 'px',
              width: hourWidth + 'px'
            }"
          >
            {{ hour.label }}
          </div>
        </div>

        <!-- 色块表示状态 -->
        <div
          v-for="(item, i) in processedTimeData"
          :key="i"
          :class="['time-block', getStatusClass(item, i)]"
          :style="{
            width: item.width,
            left: item.left
          }"
          @click="toolTipbox(item)"
        >
          {{ statusLabel(item) }}
        </div>
      </label>
    </div>

    <!-- text label -->
    <div class="text-label">
      <div
        v-for="(item, i) in labels"
        :key="i"
        class="label-item"
        :style="{
          color: i == 0 ? '#00e676' :
            i == 1 ? '#bbbbbb' :
            i == 2 ? '#ff9800' :
            i == 3 ? '#00AEEF' : ''
        }"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script>
import moment from '@/utils/moment.js'

export default {
  props: {
    labels: {
      type: Object,
      required: true,
      default: {}
    },
    timeData: {
      type: Array,
      required: true,
      default: () => [{ label: '驾驶', start: 86, end: 238, color: '#007AFF' }, // 1:26 到 3:58
        { label: '休息', start: 239, end: 300, color: '#34C759' }, // 3:59 到 5:00
        { label: '工作', start: 301, end: 525, color: '#FF9500' }, // 5:01 到 8:45
        { label: '睡眠', start: 526, end: 720, color: '#AF52DE' } // 8:46 到 12:00
      ]
    },
    isDebug: {
      type: Boolean,
      required: true,
      default: false
    }
  },

  data() {
    return {
      hourWidth: 50,
      leftPadding: 0,
      rightPadding: 0,
      totalMinutes: 1440,
      hours: Array.from({ length: 25 }, (_, i) => i),
      itemline: -1, // 改为-1，这样在没有数据时不会匹配任何时间点
      sum: 0
    }
  },
  computed: {
    axisWidth() {
      return (this.totalMinutes / 60) * this.hourWidth + this.leftPadding + this.rightPadding + 'px'
    },

    allTicks() {
      const ticks = []
      for (let hour = 0; hour < 24; hour++) {
        ticks.push({
          val: hour * 60,
          position: hour * this.hourWidth,
          height: this.itemline == (hour * 60) ? 40 : 26,
          key: `hour-${hour}`
        })

        for (let quarter = 0; quarter < 6; quarter++) {
          const minute = quarter * 10
          ticks.push({
            val: hour * 60 + minute,
            position: hour * this.hourWidth + (quarter * this.hourWidth) / 6,
            height: quarter == 3 ? 18 : (this.itemline == (hour * 60 + minute) ? 75 : 10),
            key: `quarter-${hour}-${minute}`
          })

          if (quarter < 5) {
            for (let j = 1; j < 10; j++) {
              const smallMinute = minute + j
              const smallPosition = hour * this.hourWidth + (smallMinute * this.hourWidth / 60)
              ticks.push({
                val: hour * 60 + smallMinute,
                position: smallPosition,
                height: this.itemline == (hour * 60 + smallMinute) ? 75 : 0,
                key: `small-${hour}-${smallMinute}`
              })
            }
          } else {
            for (let j = 1; j < 10; j++) {
              const smallMinute = minute + j
              if (smallMinute < 60) {
                const smallPosition = hour * this.hourWidth + (smallMinute * this.hourWidth / 60)
                ticks.push({
                  val: hour * 60 + smallMinute,
                  position: smallPosition,
                  height: this.itemline == (hour * 60 + smallMinute) ? 75 : 0,
                  key: `small-${hour}-${smallMinute}-end`
                })
              }
            }
          }
        }
      }
      return ticks
    },

    paddedHours() {
      return this.hours.map((hour) => ({
        index: hour,
        label: hour === 0 ? 'M' : hour === 12 ? 'N' : hour === 24 ? 'M' : hour > 12 ? hour - 12 : hour
      }))
    },

    processedTimeData() {
      const templateData = this.timeData.filter(e => e.duration)
      if (templateData[0]) {
        // 当有数据时才设置itemline
        this.itemline = this.roundBasedOnDistanceToHalf(
          moment(templateData[0].start).hour() * 60 + moment(templateData[0].start).minute()
        )
      } else {
        // 当没有数据时重置为-1
        this.itemline = -1
      }

      this.sum = 0 // 重置sum以确保正确计算

      return templateData.map((item) => {
        const countstart = this.roundBasedOnDistanceToHalf(
          moment(JSON.parse(JSON.stringify(item.start))).hour() * 60 +
             moment(JSON.parse(JSON.stringify(item.start))).minute()
        )

        const countend = this.roundBasedOnDistanceToHalf(
          moment(JSON.parse(JSON.stringify(item.end))).hour() * 60 +
             moment(JSON.parse(JSON.stringify(item.end))).minute()
        )

        const v = JSON.parse(JSON.stringify(item.duration))
        const val = this.roundBasedOnDistanceToHalf(v / 60)
        this.sum = this.sum + val

        const startInPixels = ((this.itemline + this.sum) / this.totalMinutes) * (24 * this.hourWidth)
        const widthInPixels = (val / this.totalMinutes) * (24 * this.hourWidth)
        return {
          ...item,
          start: countstart,
          duration: val,
          end: countend,
          left: startInPixels + 'px',
          width: widthInPixels + 'px'
        }
      })
    }
  },
  mounted() {
  },

  methods: {
    roundBasedOnDistanceToHalf(num) {
      const decimalPart = num - Math.floor(num)
      return decimalPart >= 0.5 ? Math.ceil(num) : Math.floor(num)
    },

    getStatusClass(item) {
      return item.status ? `status-${item.status}` : ''
    },

    toolTipbox(val) {
      this.$emit('toolClick', val)
    },

    formatSeconds(seconds) {
      if (this.isDebug) {
        const minutes = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${minutes}:${secs.toString().padStart(2, '0')}`
      } else {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        return `${hours}:${minutes.toString().padStart(2, '0')}`
      }
    },

    statusLabel(item) {
      const secTxt = this.formatSeconds(item.duration)
      switch (item.status) {
        case 1: return `ON ${secTxt}`
        case 2: return `DR ${secTxt}`
        case 3: return `SB ${secTxt}`
        case 4: return `OFF ${secTxt}`
        default: return ''
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.timeline-container {
  position: relative;
  width: 100%;
}

.time-axis {
  position: relative;
  display: block;
  height: 140px;
  width: 100%;
  // overflow-x: scroll;
  background-color: var(--eld-bg);
}

.axis-line {
  position: absolute;
  bottom: 43px;
  left: 18%;
  height: 1px;
  background-color: #e8e8e8;
  z-index: 1;
}

.ticks {
  position: absolute;
  top: 90px;
  left: 18%;
  height: 25px;
  border-bottom: 1px solid #eaeaea;
}

.tick {
  position: absolute;
  width: 1px;
  bottom: 0;
}

.piece {
  width: 25px;
  height: 20px;
  position: absolute;
  top: -15px;
  left: -13px;
  background-color: #00e676;
  color: #077a42;
  display: flex;
  align-items: center;
  justify-content: center;
}

.triangle {
  position: absolute;
  top: 20px;
  width: 0;
  height: 0;
  border-left: 13px solid transparent;
  border-right: 13px solid transparent;
  border-top: 5px solid #00e676;
}

.txt {
  position: absolute;
  top: 2px;
  font-size: 13px;
  color: white;
}

.time-ticks {
  position: absolute;
  bottom: 0;
  left: 18%;
  height: 30px;
  z-index: 2;
}

.tick-label {
  position: absolute;
  text-align: center;
  font-size: 12px;
  color: var(--eld-text-color);
  line-height: 30px;
}

.time-block {
  position: absolute;
  height: 25px;
  padding: 3px;
  line-height: 20px;
  color: #fff;
  text-align: center;
  font-size: 12px;
  border-radius: 4px;
  top: 55px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  &.status-2 { background-color: #00e676; }
  &.status-4 { background-color: #bbbbbb; }
  &.status-3 { background-color: #ff9800; }
  &.status-1 { background-color: #00AEEF; }
}

.text-label {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  width: 100%;
  top: 3px;

  .label-item {
    margin: 0 20px;
    text-align: center;
  }
}
</style>
