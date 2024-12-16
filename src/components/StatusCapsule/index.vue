<template>
  <div class="capsule" :style="{ background: statusColor }">
    {{ statusText }}
  </div>
</template>

<script>
export default {
  name: 'StatusCapsule',
  props: {
    status: {
      type: Number,
      required: true
    }
  },
  computed: {
    statusColor() {
      switch (this.status) {
        case 2: return '#34b369'
        case 4: return '#9b9daa'
        case 3: return '#f2994a'
        case 1: return '#1470c6'
        default: return ''
      }
    },
    statusText() {
      switch (this.status) {
        case 4: return 'OFF'
        case 1: return 'ON'
        case 2: return 'DR'
        case 3: return 'SB'
        default: return ''
      }
    }
  }
}
</script>

<style scoped>
.capsule {
  width: 50px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: white;
  border-radius: 4px;
  font-weight: bold;
}
</style>
